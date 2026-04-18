import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { subDays } from 'date-fns';
import { validate } from 'class-validator';
import { CockpitNotificationEntity } from './entities/cockpit_notification.entity';
import { CreateCockpitNotificationDTO } from './dtos/create';
import { UpdateCockpitNotificationDTO } from './dtos/update';

@Injectable()
export class CockpitNotificationService {
  constructor(
    @InjectRepository(CockpitNotificationEntity)
    private readonly repo: Repository<CockpitNotificationEntity>,
  ) {}

  async create(payload: CreateCockpitNotificationDTO): Promise<CockpitNotificationEntity> {
    const dto = Object.assign(new CreateCockpitNotificationDTO(), payload);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const msgs = errors.flatMap((e) => Object.values(e.constraints || {}));
      throw new BadRequestException(`Dados inválidos: ${msgs.join(', ')}`);
    }

    const now = new Date();
    const isRead = payload.is_read ?? false;

    const entity = this.repo.create({
      title: payload.title,
      message: payload.message,
      severity: payload.severity ?? 'info',
      source: payload.source ?? 'system',
      link_url: payload.link_url ?? null,
      link_label: payload.link_label ?? null,
      is_read: isRead,
      read_at: isRead ? now : null,
      metadata: payload.metadata ?? {},
    });

    return this.repo.save(entity);
  }

  async findAll(params?: {
    q?: string;
    source?: string;
    severity?: string;
    only_unread?: boolean;
    limit?: number;
  }): Promise<CockpitNotificationEntity[]> {
    const qb = this.repo.createQueryBuilder('n');

    if (params?.q) {
      qb.andWhere('(LOWER(n.title) LIKE :q OR LOWER(n.message) LIKE :q)', {
        q: `%${params.q.toLowerCase()}%`,
      });
    }
    if (params?.source && params.source !== 'all') qb.andWhere('n.source = :source', { source: params.source });
    if (params?.severity && params.severity !== 'all') qb.andWhere('n.severity = :severity', { severity: params.severity });
    if (params?.only_unread) qb.andWhere('n.is_read = false');

    qb.orderBy('n.created_at', 'DESC');
    qb.limit(Math.min(Math.max(params?.limit ?? 200, 1), 500));
    return qb.getMany();
  }

  async findById(id: string): Promise<CockpitNotificationEntity> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Notificação não encontrada.');
    return entity;
  }

  async update(id: string, payload: UpdateCockpitNotificationDTO): Promise<CockpitNotificationEntity> {
    const entity = await this.findById(id);
    const dto = Object.assign(new UpdateCockpitNotificationDTO(), payload);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const msgs = errors.flatMap((e) => Object.values(e.constraints || {}));
      throw new BadRequestException(`Dados inválidos: ${msgs.join(', ')}`);
    }

    Object.assign(entity, payload);
    if (payload.is_read === true) entity.read_at = entity.read_at ?? new Date();
    if (payload.is_read === false) entity.read_at = null;
    return this.repo.save(entity);
  }

  async setRead(id: string, read: boolean): Promise<CockpitNotificationEntity> {
    const entity = await this.findById(id);
    entity.is_read = read;
    entity.read_at = read ? new Date() : null;
    return this.repo.save(entity);
  }

  async markAllAsRead(): Promise<{ ok: true; updated: number }> {
    const res = await this.repo
      .createQueryBuilder()
      .update(CockpitNotificationEntity)
      .set({ is_read: true, read_at: () => 'NOW()' })
      .where('is_read = false')
      .execute();

    return { ok: true, updated: res.affected ?? 0 };
  }

  async clearAll(): Promise<{ ok: true; deleted: number }> {
    const res = await this.repo.createQueryBuilder().delete().from(CockpitNotificationEntity).execute();
    return { ok: true, deleted: res.affected ?? 0 };
  }

  async delete(id: string): Promise<void> {
    const entity = await this.findById(id);
    await this.repo.remove(entity);
  }

  /** Evita spam: já existe lembrete de stale para este KPI nos últimos N dias. */
  async hasRecentKpiStaleNotification(kpiId: string, withinDays = 5): Promise<boolean> {
    const since = subDays(new Date(), withinDays);
    const c = await this.repo
      .createQueryBuilder('n')
      .where(`n.metadata->>'kpi_id' = :kid`, { kid: kpiId })
      .andWhere(`n.metadata->>'kind' = 'stale_kpi'`)
      .andWhere('n.created_at > :since', { since })
      .getCount();
    return c > 0;
  }
}

