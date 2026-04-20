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
exports.CockpitNotificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const date_fns_1 = require("date-fns");
const class_validator_1 = require("class-validator");
const cockpit_notification_entity_1 = require("./entities/cockpit_notification.entity");
const create_1 = require("./dtos/create");
const update_1 = require("./dtos/update");
let CockpitNotificationService = class CockpitNotificationService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async create(payload) {
        const dto = Object.assign(new create_1.CreateCockpitNotificationDTO(), payload);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            const msgs = errors.flatMap((e) => Object.values(e.constraints || {}));
            throw new common_1.BadRequestException(`Dados inválidos: ${msgs.join(', ')}`);
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
    async findAll(params) {
        const qb = this.repo.createQueryBuilder('n');
        if (params?.q) {
            qb.andWhere('(LOWER(n.title) LIKE :q OR LOWER(n.message) LIKE :q)', {
                q: `%${params.q.toLowerCase()}%`,
            });
        }
        if (params?.source && params.source !== 'all')
            qb.andWhere('n.source = :source', { source: params.source });
        if (params?.severity && params.severity !== 'all')
            qb.andWhere('n.severity = :severity', { severity: params.severity });
        if (params?.only_unread)
            qb.andWhere('n.is_read = false');
        qb.orderBy('n.created_at', 'DESC');
        qb.limit(Math.min(Math.max(params?.limit ?? 200, 1), 500));
        return qb.getMany();
    }
    async findById(id) {
        const entity = await this.repo.findOne({ where: { id } });
        if (!entity)
            throw new common_1.NotFoundException('Notificação não encontrada.');
        return entity;
    }
    async update(id, payload) {
        const entity = await this.findById(id);
        const dto = Object.assign(new update_1.UpdateCockpitNotificationDTO(), payload);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            const msgs = errors.flatMap((e) => Object.values(e.constraints || {}));
            throw new common_1.BadRequestException(`Dados inválidos: ${msgs.join(', ')}`);
        }
        Object.assign(entity, payload);
        if (payload.is_read === true)
            entity.read_at = entity.read_at ?? new Date();
        if (payload.is_read === false)
            entity.read_at = null;
        return this.repo.save(entity);
    }
    async setRead(id, read) {
        const entity = await this.findById(id);
        entity.is_read = read;
        entity.read_at = read ? new Date() : null;
        return this.repo.save(entity);
    }
    async markAllAsRead() {
        const res = await this.repo
            .createQueryBuilder()
            .update(cockpit_notification_entity_1.CockpitNotificationEntity)
            .set({ is_read: true, read_at: () => 'NOW()' })
            .where('is_read = false')
            .execute();
        return { ok: true, updated: res.affected ?? 0 };
    }
    async clearAll() {
        const res = await this.repo.createQueryBuilder().delete().from(cockpit_notification_entity_1.CockpitNotificationEntity).execute();
        return { ok: true, deleted: res.affected ?? 0 };
    }
    async delete(id) {
        const entity = await this.findById(id);
        await this.repo.remove(entity);
    }
    /** Evita spam: já existe lembrete de stale para este KPI nos últimos N dias. */
    async hasRecentKpiStaleNotification(kpiId, withinDays = 5) {
        const since = (0, date_fns_1.subDays)(new Date(), withinDays);
        const c = await this.repo
            .createQueryBuilder('n')
            .where(`n.metadata->>'kpi_id' = :kid`, { kid: kpiId })
            .andWhere(`n.metadata->>'kind' = 'stale_kpi'`)
            .andWhere('n.created_at > :since', { since })
            .getCount();
        return c > 0;
    }
};
exports.CockpitNotificationService = CockpitNotificationService;
exports.CockpitNotificationService = CockpitNotificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cockpit_notification_entity_1.CockpitNotificationEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CockpitNotificationService);
