import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate } from 'class-validator';
import { CockpitRitualEntity } from './entities/cockpit_ritual.entity';
import { CreateCockpitRitualDTO } from './dtos/create';
import { UpdateCockpitRitualDTO } from './dtos/update';

@Injectable()
export class CockpitRitualService {
  constructor(
    @InjectRepository(CockpitRitualEntity)
    private readonly repo: Repository<CockpitRitualEntity>,
  ) {}

  async create(payload: CreateCockpitRitualDTO): Promise<CockpitRitualEntity> {
    const dto = Object.assign(new CreateCockpitRitualDTO(), payload);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const msgs = errors.flatMap((e) => Object.values(e.constraints || {}));
      throw new BadRequestException(`Dados inválidos: ${msgs.join(', ')}`);
    }
    const ritual = this.repo.create({
      ...payload,
      duration_min: payload.duration_min ?? 60,
      kpi_count: payload.kpi_count ?? 0,
      tracked_sessions: payload.tracked_sessions ?? 0,
      total_sessions: payload.total_sessions ?? 0,
      tracking_label: payload.tracking_label ?? 'rastreadas',
      next_label: payload.next_label ?? '—',
      participants: payload.participants ?? [],
      extra_participants: payload.extra_participants ?? 0,
      is_active: payload.is_active ?? true,
      last_not_tracked_date: payload.last_not_tracked_date ?? null,
    });
    return this.repo.save(ritual);
  }

  async findAll(params?: {
    q?: string;
    area?: string;
    freq?: string;
    status?: 'active' | 'inactive' | 'all';
  }): Promise<CockpitRitualEntity[]> {
    const qb = this.repo.createQueryBuilder('r');

    if (params?.q) {
      qb.andWhere('(LOWER(r.name) LIKE :q OR LOWER(r.owner_name) LIKE :q)', {
        q: `%${params.q.toLowerCase()}%`,
      });
    }
    if (params?.area && params.area !== 'ALL') {
      qb.andWhere('r.area = :area', { area: params.area });
    }
    if (params?.freq && params.freq !== 'all') {
      qb.andWhere('r.freq = :freq', { freq: params.freq });
    }
    if (params?.status && params.status !== 'all') {
      qb.andWhere('r.is_active = :active', { active: params.status === 'active' });
    }

    qb.orderBy('r.created_at', 'DESC');
    return qb.getMany();
  }

  async findById(id: string): Promise<CockpitRitualEntity> {
    const ritual = await this.repo.findOne({ where: { id } });
    if (!ritual) throw new NotFoundException('Ritual não encontrado.');
    return ritual;
  }

  async update(id: string, payload: UpdateCockpitRitualDTO): Promise<CockpitRitualEntity> {
    const ritual = await this.findById(id);
    const dto = Object.assign(new UpdateCockpitRitualDTO(), payload);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const msgs = errors.flatMap((e) => Object.values(e.constraints || {}));
      throw new BadRequestException(`Dados inválidos: ${msgs.join(', ')}`);
    }
    Object.assign(ritual, payload);
    return this.repo.save(ritual);
  }

  async duplicate(id: string): Promise<CockpitRitualEntity> {
    const ritual = await this.findById(id);
    const copy = this.repo.create({
      ...ritual,
      id: undefined as unknown as string,
      name: `${ritual.name} (cópia)`,
      is_active: true,
      created_at: undefined as unknown as Date,
      updated_at: undefined as unknown as Date,
    });
    return this.repo.save(copy);
  }

  async setActive(id: string, active: boolean): Promise<CockpitRitualEntity> {
    const ritual = await this.findById(id);
    ritual.is_active = active;
    return this.repo.save(ritual);
  }

  async linkKpis(ritualId: string, kpiIds: string[]): Promise<void> {
    await this.findById(ritualId);
    await this.repo.manager.query(`DELETE FROM erp_cockpit_kpi_ritual WHERE ritual_id = $1`, [ritualId]);
    for (const kid of kpiIds) {
      await this.repo.manager.query(
        `INSERT INTO erp_cockpit_kpi_ritual (kpi_id, ritual_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [kid, ritualId],
      );
    }
    await this.repo
      .createQueryBuilder()
      .update(CockpitRitualEntity)
      .set({ kpi_count: kpiIds.length })
      .where('id = :id', { id: ritualId })
      .execute();
  }

  /** IDs dos KPIs ligados ao ritual (tabela erp_cockpit_kpi_ritual). */
  async findLinkedKpiIds(ritualId: string): Promise<string[]> {
    await this.findById(ritualId);
    const rows = (await this.repo.manager.query(
      `SELECT kpi_id FROM erp_cockpit_kpi_ritual WHERE ritual_id = $1 ORDER BY kpi_id`,
      [ritualId],
    )) as { kpi_id: string }[];
    return (rows ?? []).map((r) => String(r.kpi_id));
  }

  /** Feed iCal (RFC 5545) com eventos recorrentes por ritual ativo. */
  async buildIcsFeed(area?: string): Promise<string> {
    const list = await this.findAll({
      status: 'active',
      area: area && area !== 'ALL' ? area : undefined,
    });
    const stamp = this.formatIcsUtc(new Date());
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//OTicket//Cockpit//PT', 'CALSCALE:GREGORIAN'];
    for (const r of list) {
      const uid = `${r.id}@cockpit.oticket`;
      const freq = (r.freq || '').toLowerCase();
      let rrule = 'FREQ=WEEKLY';
      if (freq.includes('mensal') || freq.includes('month')) rrule = 'FREQ=MONTHLY';
      if (freq.includes('diári') || freq.includes('daily') || freq === 'diaria') rrule = 'FREQ=DAILY';
      const start = new Date(r.created_at);
      start.setUTCHours(13, 0, 0, 0);
      const dtstart = this.formatIcsUtc(start);
      const dur = Math.max(15, Number(r.duration_min ?? 60));
      const desc = `${r.area} · ${r.schedule} · ${r.owner_name}`.trim();
      lines.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${dtstart}`,
        `DURATION:PT${dur}M`,
        `SUMMARY:${this.escapeIcsText(r.name)}`,
        `DESCRIPTION:${this.escapeIcsText(desc)}`,
        `RRULE:${rrule}`,
        'END:VEVENT',
      );
    }
    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  private escapeIcsText(s: string): string {
    return (s || '')
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,');
  }

  private formatIcsUtc(d: Date): string {
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  }
}

