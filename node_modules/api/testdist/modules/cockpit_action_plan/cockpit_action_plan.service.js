"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CockpitActionPlanService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_validator_1 = require("class-validator");
const cockpit_action_plan_entity_1 = require("./entities/cockpit_action_plan.entity");
const create_1 = require("./dtos/create");
const update_1 = require("./dtos/update");
const add_comment_1 = require("./dtos/add-comment");
const cockpit_notification_entity_1 = require("../cockpit_notification/entities/cockpit_notification.entity");
let CockpitActionPlanService = class CockpitActionPlanService {
    repo;
    notificationRepo;
    constructor(repo, notificationRepo) {
        this.repo = repo;
        this.notificationRepo = notificationRepo;
    }
    async create(payload) {
        const dto = Object.assign(new create_1.CreateCockpitActionPlanDTO(), payload);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            const msgs = errors.flatMap((e) => Object.values(e.constraints || {}));
            throw new common_1.BadRequestException(`Dados inválidos: ${msgs.join(', ')}`);
        }
        if (payload.depends_on_plan_id) {
            const dep = await this.repo.findOne({ where: { id: payload.depends_on_plan_id } });
            if (!dep)
                throw new common_1.BadRequestException('Plano predecessor não encontrado.');
            const st = payload.status ?? 'planned';
            if (['in_progress', 'delivered'].includes(st) && !['delivered', 'archived'].includes(dep.status)) {
                throw new common_1.BadRequestException('Conclua o plano predecessor antes de avançar este item.');
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
        await this.notificationRepo.save(this.notificationRepo.create({
            title: 'Novo plano de ação criado',
            message: `${saved.title} (${saved.owner_name})`,
            severity: 'info',
            source: 'action_plan',
            link_url: `/cockpit/planos-de-acao?id=${saved.id}`,
            link_label: 'Abrir plano',
            metadata: { action_plan_id: saved.id, event: 'created' },
        }));
        return saved;
    }
    async findAll(params) {
        const qb = this.repo.createQueryBuilder('p');
        if (params?.q) {
            qb.andWhere('(LOWER(p.title) LIKE :q OR LOWER(p.owner_name) LIKE :q)', {
                q: `%${params.q.toLowerCase()}%`,
            });
        }
        if (params?.area && params.area !== 'all')
            qb.andWhere('p.area = :area', { area: params.area });
        if (params?.status && params.status !== 'all')
            qb.andWhere('p.status = :status', { status: params.status });
        if (params?.priority && params.priority !== 'all')
            qb.andWhere('p.priority = :priority', { priority: params.priority });
        if (params?.ritual_id)
            qb.andWhere('p.ritual_id = :ritual_id', { ritual_id: params.ritual_id });
        if (params?.meeting_id)
            qb.andWhere('p.meeting_id = :meeting_id', { meeting_id: params.meeting_id });
        const today = params?.todayIso;
        if (params?.due && params.due !== 'any' && today) {
            if (params.due === 'today')
                qb.andWhere('p.due_date = :today', { today });
            if (params.due === 'overdue')
                qb.andWhere('p.due_date < :today AND p.status NOT IN (:...done)', { today, done: ['delivered', 'archived'] });
        }
        qb.orderBy('p.created_at', 'DESC');
        return qb.getMany();
    }
    async findById(id) {
        const plan = await this.repo.findOne({ where: { id } });
        if (!plan)
            throw new common_1.NotFoundException('Plano de ação não encontrado.');
        return plan;
    }
    async update(id, payload) {
        const plan = await this.findById(id);
        if (payload.depends_on_plan_id !== undefined && payload.depends_on_plan_id) {
            if (payload.depends_on_plan_id === id) {
                throw new common_1.BadRequestException('Plano não pode depender de si mesmo.');
            }
            const dep = await this.repo.findOne({ where: { id: payload.depends_on_plan_id } });
            if (!dep)
                throw new common_1.BadRequestException('Plano predecessor não encontrado.');
            if (dep.depends_on_plan_id === id) {
                throw new common_1.BadRequestException('Dependência circular entre planos.');
            }
        }
        const prevStatus = plan.status;
        if (payload.status !== undefined &&
            ['in_progress', 'delivered'].includes(payload.status) &&
            plan.depends_on_plan_id) {
            const dep = await this.repo.findOne({ where: { id: plan.depends_on_plan_id } });
            if (dep && !['delivered', 'archived'].includes(dep.status)) {
                throw new common_1.BadRequestException('Conclua o plano predecessor antes de avançar este item.');
            }
        }
        const history = Array.isArray(plan.history) ? [...plan.history] : [];
        const dto = Object.assign(new update_1.UpdateCockpitActionPlanDTO(), payload);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            const msgs = errors.flatMap((e) => Object.values(e.constraints || {}));
            throw new common_1.BadRequestException(`Dados inválidos: ${msgs.join(', ')}`);
        }
        const actor = payload.owner_name ?? plan.owner_name ?? 'sistema';
        const ts = new Date().toISOString();
        const add = (action) => history.unshift({ action, at: ts, by: actor });
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
                await this.notificationRepo.save(this.notificationRepo.create({
                    title: 'Plano de ação bloqueado',
                    message: `${saved.title} está bloqueado`,
                    severity: 'alert',
                    source: 'action_plan',
                    link_url: `/cockpit/planos-de-acao?id=${saved.id}`,
                    link_label: 'Revisar bloqueio',
                    metadata: { action_plan_id: saved.id, event: 'blocked' },
                }));
            }
            if (payload.status === 'delivered') {
                await this.notificationRepo.save(this.notificationRepo.create({
                    title: 'Plano de ação concluído',
                    message: `${saved.title} foi concluído`,
                    severity: 'info',
                    source: 'action_plan',
                    link_url: `/cockpit/planos-de-acao?id=${saved.id}`,
                    link_label: 'Ver conclusão',
                    metadata: { action_plan_id: saved.id, event: 'delivered' },
                }));
            }
        }
        return saved;
    }
    async addComment(id, payload) {
        const plan = await this.findById(id);
        const dto = Object.assign(new add_comment_1.AddCockpitActionPlanCommentDTO(), payload);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            const msgs = errors.flatMap((e) => Object.values(e.constraints || {}));
            throw new common_1.BadRequestException(`Dados inválidos: ${msgs.join(', ')}`);
        }
        const text = (payload.text ?? '').trim();
        if (!text)
            throw new common_1.BadRequestException('Comentário vazio.');
        const comments = Array.isArray(plan.comments) ? [...plan.comments] : [];
        const parentId = (payload.parent_id ?? '').trim();
        if (parentId && !comments.some((c) => c.id === parentId)) {
            throw new common_1.BadRequestException('Comentário pai não encontrado neste plano.');
        }
        comments.unshift({
            id: (0, crypto_1.randomUUID)(),
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
    async delete(id) {
        const plan = await this.findById(id);
        await this.repo.remove(plan);
    }
    async dashboardSummary(params) {
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
            if (p.status === 'delivered' || p.status === 'archived')
                continue;
            if (p.status === 'blocked')
                blocked++;
            else
                open++;
            if (p.due_date < todayIso)
                overdue++;
        }
        return { open, overdue, blocked, pending: open + blocked };
    }
};
exports.CockpitActionPlanService = CockpitActionPlanService;
exports.CockpitActionPlanService = CockpitActionPlanService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cockpit_action_plan_entity_1.CockpitActionPlanEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(cockpit_notification_entity_1.CockpitNotificationEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CockpitActionPlanService);
