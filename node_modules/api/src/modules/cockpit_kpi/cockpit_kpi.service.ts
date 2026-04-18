import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { createReadStream, promises as fsp } from 'fs';
import * as path from 'path';
import type { Readable } from 'stream';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { validate } from 'class-validator';
import { differenceInCalendarDays } from 'date-fns';
import { CockpitKpiEntity } from './entities/cockpit_kpi.entity';
import { CockpitKpiResultEntity } from './entities/cockpit_kpi_result.entity';
import { CockpitKpiGoalVersionEntity } from './entities/cockpit_kpi_goal_version.entity';
import { CreateCockpitKpiDTO } from './dtos/create';
import { UpdateCockpitKpiDTO } from './dtos/update';
import { inferPeriodStartFromLabel } from './utils/infer-period-start';
import { inputFrequencyToDays } from './utils/input-frequency-to-days';
import { CockpitNotificationService } from '../cockpit_notification/cockpit_notification.service';
import { UserEntity } from '../user/entities/user.entity';

function isValidDate(d: unknown): d is Date {
  return d instanceof Date && Number.isFinite(d.getTime());
}

type KpiListItem = {
  id: string;
  code_ref: string | null;
  name: string;
  area: string;
  unit: string;
  kpi_type: string;
  aggregation: string;
  input_frequency: string;
  owner_name: string;
  owner_role: string | null;
  is_cockpit: boolean;
  month_goal: number;
  annual_goal: number;
  current_value: number;
  deviation_pct: number;
  trend: 'up' | 'down' | 'flat';
  status: 'above' | 'attention' | 'critical' | 'empty';
  stale_periods: number;
  critical_deviation_threshold_pct: number;
  attention_deviation_threshold_pct: number;
};

type KpiDetail = KpiListItem & {
  results: {
    id: string;
    period_label: string;
    period_start: string | null;
    value: number;
    target: number;
    deviation_pct: number;
    evidence_url: string | null;
    evidence_note: string | null;
    evidence_file_name: string | null;
    evidence_attachment_path: string | null;
  }[];
  linked_rituals: { id: string; name: string; area: string }[];
  goal_versions: { id: string; month_goal: number; annual_goal: number; changed_at: string; changed_by: string | null; note: string | null }[];
};

@Injectable()
export class CockpitKpiService {
  constructor(
    @InjectRepository(CockpitKpiEntity)
    private readonly repo: Repository<CockpitKpiEntity>,
    @InjectRepository(CockpitKpiResultEntity)
    private readonly resultRepo: Repository<CockpitKpiResultEntity>,
    @InjectRepository(CockpitKpiGoalVersionEntity)
    private readonly goalVersionRepo: Repository<CockpitKpiGoalVersionEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly notificationService: CockpitNotificationService,
  ) {}

  async create(payload: CreateCockpitKpiDTO): Promise<CockpitKpiEntity> {
    const dto = Object.assign(new CreateCockpitKpiDTO(), payload);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const msgs = errors.flatMap((e) => Object.values(e.constraints || {}));
      throw new BadRequestException(`Dados inválidos: ${msgs.join(', ')}`);
    }
    const normalizedCodeRef = (payload.code_ref ?? '').trim();
    const codeRef = normalizedCodeRef ? normalizedCodeRef : await this.generateNextCodeRef();

    const thrRaw = Number(payload.critical_deviation_threshold_pct ?? 15);
    const criticalThr =
      Number.isFinite(thrRaw) && thrRaw > 0 ? Math.min(100, Math.max(0.1, thrRaw)) : 15;
    const attRaw = Number(payload.attention_deviation_threshold_pct ?? 5);
    const attentionThr =
      Number.isFinite(attRaw) && attRaw > 0 ? Math.min(100, Math.max(0.1, attRaw)) : 5;

    const entity = this.repo.create({
      name: payload.name,
      metric: payload.metric,
      code_ref: codeRef,
      unit: payload.unit ?? '',
      area: payload.area,
      kpi_type: payload.kpi_type ?? 'Monetário',
      aggregation: payload.aggregation ?? 'Soma',
      input_frequency: payload.input_frequency ?? 'Semanal',
      owner_name: payload.owner_name,
      owner_role: payload.owner_role ?? null,
      is_cockpit: payload.is_cockpit ?? false,
      critical_deviation_threshold_pct: criticalThr,
      attention_deviation_threshold_pct: attentionThr,
      month_goal: Number(payload.month_goal ?? 0),
      annual_goal: Number(payload.annual_goal ?? 0),
      current_value: null,
      stale_periods: 0,
      ritual_id: payload.ritual_id ?? null,
      meeting_id: payload.meeting_id ?? null,
      is_active: true,
    });
    const saved = await this.repo.save(entity);

    // create a first goal version snapshot
    await this.goalVersionRepo.save(
      this.goalVersionRepo.create({
        kpi_id: saved.id,
        month_goal: saved.month_goal,
        annual_goal: saved.annual_goal,
        note: 'Meta criada',
        changed_by: payload.owner_name ?? null,
      }),
    );

    return saved;
  }

  /**
   * Gera code_ref sequencial no formato "#123".
   * Se houver code_refs mistos, usa o maior número encontrado.
   */
  private async generateNextCodeRef(): Promise<string> {
    const row = await this.repo
      .createQueryBuilder('k')
      .select(`MAX(REGEXP_REPLACE(COALESCE(k.code_ref, ''), '\\\\D', '', 'g'))`, 'max_digits')
      .getRawOne<{ max_digits: string | null }>();

    const maxDigits = (row?.max_digits ?? '').trim();
    const max = maxDigits ? Number(maxDigits) : 0;
    const next = Number.isFinite(max) ? max + 1 : 1;
    return `#${next}`;
  }

  async findAll(params?: { q?: string; area?: string; ritual_id?: string; meeting_id?: string }): Promise<KpiListItem[]> {
    const qb = this.repo.createQueryBuilder('k');
    if (params?.q) qb.andWhere('LOWER(k.name) LIKE :q OR LOWER(k.metric) LIKE :q', { q: `%${params.q.toLowerCase()}%` });
    if (params?.area && params.area !== 'ALL') qb.andWhere('k.area = :area', { area: params.area });
    if (params?.ritual_id) qb.andWhere('k.ritual_id = :ritual_id', { ritual_id: params.ritual_id });
    if (params?.meeting_id) qb.andWhere('k.meeting_id = :meeting_id', { meeting_id: params.meeting_id });
    qb.orderBy('k.created_at', 'DESC');
    const list = await qb.getMany();
    return Promise.all(list.map((k) => this.toListItem(k)));
  }

  async findById(id: string): Promise<CockpitKpiEntity> {
    const kpi = await this.repo.findOne({ where: { id } });
    if (!kpi) throw new NotFoundException('KPI não encontrado.');
    return kpi;
  }

  async findDetailById(id: string): Promise<KpiDetail> {
    const kpi = await this.findById(id);
    const base = await this.toListItem(kpi);

    const results = await this.resultRepo.find({
      where: { kpi_id: id, deleted_at: IsNull() },
      order: { created_at: 'DESC' },
      take: 120,
    });

    const goalVersions = await this.goalVersionRepo.find({
      where: { kpi_id: id },
      order: { changed_at: 'DESC' },
      take: 50,
    });

    // linked rituals (join table)
    const linked = await this.repo.manager.query(
      `
        SELECT r.id, r.name, r.area
        FROM erp_cockpit_kpi_ritual kr
        JOIN erp_cockpit_ritual r ON r.id = kr.ritual_id
        WHERE kr.kpi_id = $1
        ORDER BY r.created_at DESC
      `,
      [id],
    );

    return {
      ...base,
      results: results.map((r) => ({
        id: r.id,
        period_label: r.period_label,
        period_start: r.period_start
          ? typeof r.period_start === 'string'
            ? r.period_start
            : (r.period_start as Date).toISOString().slice(0, 10)
          : null,
        value: Number(r.value ?? 0),
        target: Number(r.target ?? 0),
        deviation_pct: Number(r.deviation_pct ?? 0),
        evidence_url: r.evidence_url?.trim() ? r.evidence_url.trim() : null,
        evidence_note: r.evidence_note?.trim() ? r.evidence_note.trim() : null,
        evidence_file_name: r.evidence_file_name?.trim() ? r.evidence_file_name.trim() : null,
        evidence_attachment_path: r.evidence_file_key ? `/cockpit/kpis/${id}/results/${r.id}/attachment` : null,
      })),
      linked_rituals: (linked ?? []).map((r: any) => ({ id: r.id, name: r.name, area: r.area })),
      goal_versions: goalVersions.map((g) => ({
        id: g.id,
        month_goal: Number(g.month_goal ?? 0),
        annual_goal: Number(g.annual_goal ?? 0),
        changed_at: g.changed_at.toISOString(),
        changed_by: g.changed_by ?? null,
        note: g.note ?? null,
      })),
    };
  }

  async update(id: string, payload: UpdateCockpitKpiDTO): Promise<CockpitKpiEntity> {
    const kpi = await this.findById(id);
    const dto = Object.assign(new UpdateCockpitKpiDTO(), payload);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const msgs = errors.flatMap((e) => Object.values(e.constraints || {}));
      throw new BadRequestException(`Dados inválidos: ${msgs.join(', ')}`);
    }
    const prevMonth = Number(kpi.month_goal ?? 0);
    const prevAnnual = Number(kpi.annual_goal ?? 0);

    Object.assign(kpi, payload);
    if (payload.month_goal !== undefined) kpi.month_goal = Number(payload.month_goal ?? 0);
    if (payload.annual_goal !== undefined) kpi.annual_goal = Number(payload.annual_goal ?? 0);
    if (payload.critical_deviation_threshold_pct !== undefined) {
      const thrRaw = Number(payload.critical_deviation_threshold_pct);
      kpi.critical_deviation_threshold_pct =
        Number.isFinite(thrRaw) && thrRaw > 0 ? Math.min(100, Math.max(0.1, thrRaw)) : 15;
    }
    if (payload.attention_deviation_threshold_pct !== undefined) {
      const attRaw = Number(payload.attention_deviation_threshold_pct);
      const att = Number.isFinite(attRaw) && attRaw > 0 ? Math.min(100, Math.max(0.1, attRaw)) : 5;
      kpi.attention_deviation_threshold_pct = att;
    }

    const saved = await this.repo.save(kpi);

    if (prevMonth !== Number(saved.month_goal ?? 0) || prevAnnual !== Number(saved.annual_goal ?? 0)) {
      await this.goalVersionRepo.save(
        this.goalVersionRepo.create({
          kpi_id: saved.id,
          month_goal: saved.month_goal,
          annual_goal: saved.annual_goal,
          note: 'Meta alterada',
          changed_by: saved.owner_name ?? null,
        }),
      );
    }

    return saved;
  }

  async delete(id: string): Promise<void> {
    const kpi = await this.findById(id);
    await this.repo.remove(kpi);
  }

  async addResult(kpiId: string, input: {
    period_label: string;
    value: number;
    target?: number | null;
    period_start?: string | null;
    evidence_url?: string | null;
    evidence_note?: string | null;
  }): Promise<CockpitKpiResultEntity> {
    const kpi = await this.findById(kpiId);
    const target = Number(input.target ?? kpi.month_goal ?? 0);
    const value = Number(input.value ?? 0);
    const deviation = target === 0 ? 0 : ((value - target) / Math.abs(target)) * 100;

    let periodStart: string | null = null;
    const raw = (input.period_start ?? '').trim();
    if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      periodStart = raw;
    } else {
      periodStart = inferPeriodStartFromLabel(input.period_label);
    }

    const evUrl = (input.evidence_url ?? '').trim().slice(0, 2048);
    const evNote = (input.evidence_note ?? '').trim().slice(0, 500);

    const dupQb = this.resultRepo
      .createQueryBuilder('r')
      .where('r.kpi_id = :kpiId', { kpiId })
      .andWhere('r.deleted_at IS NULL');
    if (periodStart) {
      dupQb.andWhere(`date_trunc('month', r.period_start::date) = date_trunc('month', CAST(:ps AS date))`, {
        ps: periodStart,
      });
    } else {
      dupQb.andWhere('r.period_label = :pl', { pl: input.period_label.trim() });
    }
    const duplicate = await dupQb.getOne();
    if (duplicate) {
      throw new BadRequestException('Já existe lançamento para este mês/período. Exclua o registro incorreto antes de criar outro.');
    }

    const entity = this.resultRepo.create({
      kpi_id: kpiId,
      period_label: input.period_label,
      period_start: periodStart,
      value,
      target,
      deviation_pct: deviation,
      evidence_url: evUrl || null,
      evidence_note: evNote || null,
    });
    const saved = await this.resultRepo.save(entity);

    // Update KPI snapshot fields used by list screen
    kpi.current_value = value;
    kpi.stale_periods = 0;
    await this.repo.save(kpi);

    return saved;
  }

  async softDeleteResult(kpiId: string, resultId: string, userId: string): Promise<void> {
    if (!userId?.trim()) {
      throw new BadRequestException('Usuário não identificado para auditoria.');
    }
    const row = await this.resultRepo.findOne({
      where: { id: resultId, kpi_id: kpiId },
    });
    if (!row) throw new NotFoundException('Lançamento não encontrado.');
    if (row.deleted_at) {
      throw new BadRequestException('Este lançamento já foi excluído.');
    }
    const user = await this.userRepo.findOne({ where: { id: userId } });
    row.deleted_at = new Date();
    row.deleted_by_user_id = userId;
    row.deleted_by_name = user?.name?.trim() ? user.name.trim().slice(0, 255) : null;
    await this.resultRepo.save(row);
  }

  async linkRituals(kpiId: string, ritualIds: string[]): Promise<void> {
    await this.findById(kpiId);
    // Replace links
    await this.repo.manager.query(`DELETE FROM erp_cockpit_kpi_ritual WHERE kpi_id = $1`, [kpiId]);
    for (const rid of ritualIds) {
      await this.repo.manager.query(
        `INSERT INTO erp_cockpit_kpi_ritual (kpi_id, ritual_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [kpiId, rid],
      );
    }
  }

  private async toListItem(k: CockpitKpiEntity): Promise<KpiListItem> {
    const current = Number(k.current_value ?? 0);
    const monthGoal = Number(k.month_goal ?? 0);
    const dev = monthGoal === 0 ? 0 : ((current - monthGoal) / Math.abs(monthGoal)) * 100;

    const thr = Number(k.critical_deviation_threshold_pct ?? 15);
    const t = Number.isFinite(thr) && thr > 0 ? Math.min(100, Math.max(0.1, thr)) : 15;
    const attRaw = Number(k.attention_deviation_threshold_pct ?? 5);
    const a = Number.isFinite(attRaw) && attRaw > 0 ? Math.min(100, Math.max(0.1, attRaw)) : 5;

    /** Dois cortes independentes (em %): crítico abaixo de −C; atenção entre −C e −A; abaixo de −A com dev negativo ainda “ok” leve. */
    const status: KpiListItem['status'] = (() => {
      if (monthGoal === 0) return 'empty';
      if (dev >= 0) return 'above';
      if (a < t) {
        if (dev < -t) return 'critical';
        if (dev > -a) return 'above';
        return 'attention';
      }
      if (dev < -t) return 'critical';
      return 'attention';
    })();

    const trend: KpiListItem['trend'] = dev === 0 ? 'flat' : dev > 0 ? 'up' : 'down';

    return {
      id: k.id,
      code_ref: k.code_ref ?? null,
      name: k.name,
      area: k.area,
      unit: k.unit ?? '',
      kpi_type: k.kpi_type ?? 'Monetário',
      aggregation: k.aggregation ?? 'Soma',
      input_frequency: k.input_frequency ?? 'Semanal',
      owner_name: k.owner_name ?? '',
      owner_role: k.owner_role ?? null,
      is_cockpit: !!k.is_cockpit,
      month_goal: monthGoal,
      annual_goal: Number(k.annual_goal ?? 0),
      current_value: current,
      deviation_pct: dev,
      trend,
      status,
      stale_periods: Number(k.stale_periods ?? 0),
      critical_deviation_threshold_pct: t,
      attention_deviation_threshold_pct: a,
    };
  }

  /**
   * Recalcula `stale_periods` e gera notificações quando falta lançamento conforme a frequência do KPI.
   * Chamado pelo cron diário e por POST /cockpit/kpis/stale-check.
   */
  async runStaleCheckAndNotify(): Promise<{
    scanned: number;
    staleUpdated: number;
    notificationsCreated: number;
  }> {
    const kpis = await this.repo.find({ where: { is_active: true } });
    let staleUpdated = 0;
    let notificationsCreated = 0;

    for (const kpi of kpis) {
      const monthGoal = Number(kpi.month_goal ?? 0);
      const annualGoal = Number(kpi.annual_goal ?? 0);
      if (monthGoal <= 0 && annualGoal <= 0) {
        if (kpi.stale_periods !== 0) {
          kpi.stale_periods = 0;
          await this.repo.save(kpi);
          staleUpdated++;
        }
        continue;
      }

      const rows: { period_start: string | Date | null; created_at: Date }[] = await this.resultRepo.query(
        `SELECT period_start, created_at FROM erp_cockpit_kpi_result WHERE kpi_id = $1 AND deleted_at IS NULL
         ORDER BY COALESCE(period_start::timestamp, created_at) DESC NULLS LAST LIMIT 1`,
        [kpi.id],
      );

      let anchor: Date;
      if (rows?.length) {
        const r = rows[0];
        if (r.period_start) {
          const fromPeriod = new Date(String(r.period_start).slice(0, 10) + 'T12:00:00');
          anchor = isValidDate(fromPeriod) ? fromPeriod : new Date(r.created_at);
        } else {
          anchor = new Date(r.created_at);
        }
      } else {
        anchor = kpi.created_at;
      }
      if (!isValidDate(anchor)) {
        anchor = isValidDate(kpi.created_at) ? kpi.created_at : new Date();
      }

      const today = new Date();
      let daysSince = differenceInCalendarDays(today, anchor);
      if (!Number.isFinite(daysSince)) daysSince = 0;

      const interval = Math.max(1, inputFrequencyToDays(kpi.input_frequency));

      let stale = 0;
      if (daysSince <= interval) {
        stale = 0;
      } else {
        stale = Math.min(52, Math.ceil((daysSince - interval) / interval));
      }
      if (!Number.isFinite(stale) || stale < 0) stale = 0;
      stale = Math.min(52, Math.max(0, Math.trunc(stale)));

      if (kpi.stale_periods !== stale) {
        kpi.stale_periods = stale;
        await this.repo.save(kpi);
        staleUpdated++;
      }

      if (stale >= 1) {
        const has = await this.notificationService.hasRecentKpiStaleNotification(kpi.id, 5);
        if (!has) {
          await this.notificationService.create({
            title: `KPI sem lançamento: ${kpi.name}`,
            message: `Último registro há ${daysSince} dia(s). Frequência esperada: ${kpi.input_frequency} (~${interval} dia(s) entre lançamentos). ${
              stale > 1 ? `Estimativa de ${stale} período(s) em atraso.` : 'Registre o resultado do período.'
            }`,
            severity: stale >= 3 ? 'critical' : 'alert',
            source: 'kpi',
            link_url: `/cockpit/kpis/${kpi.id}`,
            link_label: 'Abrir KPI',
            metadata: {
              kpi_id: kpi.id,
              kind: 'stale_kpi',
              stale_periods: stale,
              days_since: daysSince,
            },
          });
          notificationsCreated++;
        }
      }
    }

    return { scanned: kpis.length, staleUpdated, notificationsCreated };
  }

  private uploadsRoot(): string {
    return path.join(process.cwd(), 'uploads', 'cockpit-kpi-evidence');
  }

  async attachEvidenceFile(
    kpiId: string,
    resultId: string,
    file: { buffer: Buffer; originalname: string; mimetype?: string },
  ): Promise<CockpitKpiResultEntity> {
    await this.findById(kpiId);
    const row = await this.resultRepo.findOne({
      where: { id: resultId, kpi_id: kpiId, deleted_at: IsNull() },
    });
    if (!row) throw new NotFoundException('Resultado não encontrado.');

    const safeBase = path.basename(file.originalname || 'evidencia').replace(/[^\w.\- ()\u00C0-\u024F]/g, '_');
    const ext = path.extname(safeBase).slice(0, 16) || '.bin';
    const relKey = `${kpiId}/${resultId}${ext}`;
    const full = path.join(this.uploadsRoot(), relKey);
    await fsp.mkdir(path.dirname(full), { recursive: true });
    if (row.evidence_file_key) {
      const prev = path.join(this.uploadsRoot(), row.evidence_file_key);
      try {
        await fsp.unlink(prev);
      } catch {
        /* ignore */
      }
    }
    await fsp.writeFile(full, file.buffer);
    row.evidence_file_key = relKey;
    row.evidence_file_name = safeBase.slice(0, 500);
    return this.resultRepo.save(row);
  }

  async openEvidenceFile(
    kpiId: string,
    resultId: string,
  ): Promise<{ stream: Readable; fileName: string; mime: string }> {
    await this.findById(kpiId);
    const row = await this.resultRepo.findOne({
      where: { id: resultId, kpi_id: kpiId, deleted_at: IsNull() },
    });
    if (!row?.evidence_file_key) throw new NotFoundException('Anexo não encontrado.');
    const full = path.join(this.uploadsRoot(), row.evidence_file_key);
    const fileName = row.evidence_file_name || 'evidencia';
    const ext = path.extname(fileName).toLowerCase();
    const mime =
      ext === '.pdf'
        ? 'application/pdf'
        : ext === '.png'
          ? 'image/png'
          : ext === '.jpg' || ext === '.jpeg'
            ? 'image/jpeg'
            : 'application/octet-stream';
    return { stream: createReadStream(full), fileName, mime };
  }
}

