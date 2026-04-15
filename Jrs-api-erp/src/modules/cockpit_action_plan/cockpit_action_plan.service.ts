import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate } from 'class-validator';
import { CockpitActionPlanEntity } from './entities/cockpit_action_plan.entity';
import { CreateCockpitActionPlanDTO } from './dtos/create';
import { UpdateCockpitActionPlanDTO } from './dtos/update';
import { AddCockpitActionPlanCommentDTO } from './dtos/add-comment';
import { CockpitNotificationEntity } from '../cockpit_notification/entities/cockpit_notification.entity';

@Injectable()
export class CockpitActionPlanService {
  constructor(
    @InjectRepository(CockpitActionPlanEntity)
    private readonly repo: Repository<CockpitActionPlanEntity>,
    @InjectRepository(CockpitNotificationEntity)
    private readonly notificationRepo: Repository<CockpitNotificationEntity>,
  ) {}

  async create(payload: CreateCockpitActionPlanDTO): Promise<CockpitActionPlanEntity> {
    const dto = Object.assign(new CreateCockpitActionPlanDTO(), payload);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const msgs = errors.flatMap((e) => Object.values(e.constraints || {}));
      throw new BadRequestException(`Dados inválidos: ${msgs.join(', ')}`);
    }

    if (payload.depends_on_plan_id) {
      const dep = await this.repo.findOne({ where: { id: payload.depends_on_plan_id } });
      if (!dep) throw new BadRequestException('Plano predecessor não encontrado.');
      const st = payload.status ?? 'planned';
      if (['in_progress', 'delivered'].includes(st) && !['delivered', 'archived'].includes(dep.status)) {
        throw new BadRequestException('Conclua o plano predecessor antes de avançar este item.');
      }
    }

    const plan = this.repo.create({
      ...payload,
      description: payload.description ?? null,
      priority: payload.priority ?? 'medium',
      ritual_id: payload.ritual_id ?? null,
      meeting_id: payload.meeting_id ?? null,
      depends_on_plan_id: payload.depends_on_plan_id ?? null,
      comments: [],
      history: [
        {
          action: 'Plano criado',
          at: new Date().toISOString(),
          by: payload.owner_name ?? 'sistema',
        },
      ],
      is_active: true,
    });
    const saved = await this.repo.save(plan);
    await this.notificationRepo.save(
      this.notificationRepo.create({
        title: 'Novo plano de ação criado',
        message: `${saved.title} (${saved.owner_name})`,
        severity: 'info',
        source: 'action_plan',
        link_url: `/cockpit/planos-de-acao?id=${saved.id}`,
        link_label: 'Abrir plano',
        metadata: { action_plan_id: saved.id, event: 'created' },
      }),
    );
    return saved;
  }

  async findAll(params?: {
    q?: string;
    area?: string;
    status?: string;
    due?: 'any' | 'today' | 'overdue';
    priority?: string;
    todayIso?: string;
    ritual_id?: string;
    meeting_id?: string;
  }): Promise<CockpitActionPlanEntity[]> {
    const qb = this.repo.createQueryBuilder('p');

    if (params?.q) {
      qb.andWhere('(LOWER(p.title) LIKE :q OR LOWER(p.owner_name) LIKE :q)', {
        q: `%${params.q.toLowerCase()}%`,
      });
    }
    if (params?.area && params.area !== 'all') qb.andWhere('p.area = :area', { area: params.area });
    if (params?.status && params.status !== 'all') qb.andWhere('p.status = :status', { status: params.status });
    if (params?.priority && params.priority !== 'all') qb.andWhere('p.priority = :priority', { priority: params.priority });
    if (params?.ritual_id) qb.andWhere('p.ritual_id = :ritual_id', { ritual_id: params.ritual_id });
    if (params?.meeting_id) qb.andWhere('p.meeting_id = :meeting_id', { meeting_id: params.meeting_id });

    const today = params?.todayIso;
    if (params?.due && params.due !== 'any' && today) {
      if (params.due === 'today') qb.andWhere('p.due_date = :today', { today });
      if (params.due === 'overdue')
        qb.andWhere('p.due_date < :today AND p.status NOT IN (:...done)', { today, done: ['delivered', 'archived'] });
    }

    qb.orderBy('p.created_at', 'DESC');
    return qb.getMany();
  }

  async findById(id: string): Promise<CockpitActionPlanEntity> {
    const plan = await this.repo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Plano de ação não encontrado.');
    return plan;
  }

  async update(id: string, payload: UpdateCockpitActionPlanDTO): Promise<CockpitActionPlanEntity> {
    const plan = await this.findById(id);
    if (payload.depends_on_plan_id !== undefined && payload.depends_on_plan_id) {
      if (payload.depends_on_plan_id === id) {
        throw new BadRequestException('Plano não pode depender de si mesmo.');
      }
      const dep = await this.repo.findOne({ where: { id: payload.depends_on_plan_id } });
      if (!dep) throw new BadRequestException('Plano predecessor não encontrado.');
      if (dep.depends_on_plan_id === id) {
        throw new BadRequestException('Dependência circular entre planos.');
      }
    }
    const prevStatus = plan.status;
    if (
      payload.status !== undefined &&
      ['in_progress', 'delivered'].includes(payload.status) &&
      plan.depends_on_plan_id
    ) {
      const dep = await this.repo.findOne({ where: { id: plan.depends_on_plan_id } });
      if (dep && !['delivered', 'archived'].includes(dep.status)) {
        throw new BadRequestException('Conclua o plano predecessor antes de avançar este item.');
      }
    }
    const history = Array.isArray(plan.history) ? [...plan.history] : [];
    const dto = Object.assign(new UpdateCockpitActionPlanDTO(), payload);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const msgs = errors.flatMap((e) => Object.values(e.constraints || {}));
      throw new BadRequestException(`Dados inválidos: ${msgs.join(', ')}`);
    }

    const actor = payload.owner_name ?? plan.owner_name ?? 'sistema';
    const ts = new Date().toISOString();
    const add = (action: string) => history.unshift({ action, at: ts, by: actor });

    if (payload.title !== undefined && payload.title !== plan.title) {
      add(`Título: "${plan.title}" → "${payload.title}"`);
    }
    if (payload.status !== undefined && payload.status !== plan.status) {
      add(`Status: ${plan.status} → ${payload.status}`);
    }
    if (payload.priority !== undefined && payload.priority !== plan.priority) {
      add(`Prioridade: ${plan.priority} → ${payload.priority}`);
    }
    if (payload.owner_name !== undefined && payload.owner_name !== plan.owner_name) {
      add(`Responsável: ${plan.owner_name} → ${payload.owner_name}`);
    }
    if (payload.due_date !== undefined && payload.due_date !== plan.due_date) {
      add(`Prazo: ${plan.due_date} → ${payload.due_date}`);
    }
    if (payload.area !== undefined && payload.area !== plan.area) {
      add(`Área: ${plan.area} → ${payload.area}`);
    }
    const prevDesc = plan.description ?? null;
    const nextDesc = payload.description !== undefined ? (payload.description ?? null) : prevDesc;
    if (payload.description !== undefined && nextDesc !== prevDesc) {
      add('Descrição atualizada');
    }
    if (payload.ritual_id !== undefined && (payload.ritual_id ?? null) !== (plan.ritual_id ?? null)) {
      add('Vínculo com ritual alterado');
    }
    if (payload.meeting_id !== undefined && (payload.meeting_id ?? null) !== (plan.meeting_id ?? null)) {
      add('Vínculo com reunião alterado');
    }
    if (payload.depends_on_plan_id !== undefined && (payload.depends_on_plan_id ?? null) !== (plan.depends_on_plan_id ?? null)) {
      add('Dependência entre planos alterada');
    }

    Object.assign(plan, payload);
    plan.history = history;
    const saved = await this.repo.save(plan);

    if (payload.status && payload.status !== prevStatus) {
      if (payload.status === 'blocked') {
        await this.notificationRepo.save(
          this.notificationRepo.create({
            title: 'Plano de ação bloqueado',
            message: `${saved.title} está bloqueado`,
            severity: 'alert',
            source: 'action_plan',
            link_url: `/cockpit/planos-de-acao?id=${saved.id}`,
            link_label: 'Revisar bloqueio',
            metadata: { action_plan_id: saved.id, event: 'blocked' },
          }),
        );
      }
      if (payload.status === 'delivered') {
        await this.notificationRepo.save(
          this.notificationRepo.create({
            title: 'Plano de ação concluído',
            message: `${saved.title} foi concluído`,
            severity: 'info',
            source: 'action_plan',
            link_url: `/cockpit/planos-de-acao?id=${saved.id}`,
            link_label: 'Ver conclusão',
            metadata: { action_plan_id: saved.id, event: 'delivered' },
          }),
        );
      }
    }

    return saved;
  }

  async addComment(id: string, payload: AddCockpitActionPlanCommentDTO): Promise<CockpitActionPlanEntity> {
    const plan = await this.findById(id);
    const dto = Object.assign(new AddCockpitActionPlanCommentDTO(), payload);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const msgs = errors.flatMap((e) => Object.values(e.constraints || {}));
      throw new BadRequestException(`Dados inválidos: ${msgs.join(', ')}`);
    }
    const text = (payload.text ?? '').trim();
    if (!text) throw new BadRequestException('Comentário vazio.');
    const comments = Array.isArray(plan.comments) ? [...plan.comments] : [];
    const parentId = (payload.parent_id ?? '').trim();
    if (parentId && !comments.some((c) => c.id === parentId)) {
      throw new BadRequestException('Comentário pai não encontrado neste plano.');
    }
    comments.unshift({
      id: randomUUID(),
      text: text.slice(0, 4000),
      at: new Date().toISOString(),
      by: (payload.by ?? plan.owner_name ?? 'sistema').slice(0, 255),
      parent_id: parentId || null,
    });
    plan.comments = comments;
    const history = Array.isArray(plan.history) ? [...plan.history] : [];
    history.unshift({
      action: 'Comentário adicionado',
      at: new Date().toISOString(),
      by: payload.by ?? plan.owner_name ?? 'sistema',
    });
    plan.history = history;
    return this.repo.save(plan);
  }

  async delete(id: string): Promise<void> {
    const plan = await this.findById(id);
    await this.repo.remove(plan);
  }

  async dashboardSummary(params: { ritual_id?: string; meeting_id?: string }): Promise<{
    open: number;
    overdue: number;
    blocked: number;
    pending: number;
  }> {
    const list = await this.findAll({
      ritual_id: params.ritual_id,
      meeting_id: params.meeting_id,
      due: 'any',
    });
    const todayIso = new Date().toISOString().slice(0, 10);
    let open = 0;
    let overdue = 0;
    let blocked = 0;
    for (const p of list) {
      if (p.status === 'delivered' || p.status === 'archived') continue;
      if (p.status === 'blocked') blocked++;
      else open++;
      if (p.due_date < todayIso) overdue++;
    }
    return { open, overdue, blocked, pending: open + blocked };
  }
}

