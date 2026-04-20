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
exports.CockpitRitualService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_validator_1 = require("class-validator");
const cockpit_ritual_entity_1 = require("./entities/cockpit_ritual.entity");
const create_1 = require("./dtos/create");
const update_1 = require("./dtos/update");
let CockpitRitualService = class CockpitRitualService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async create(payload) {
        const dto = Object.assign(new create_1.CreateCockpitRitualDTO(), payload);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            const msgs = errors.flatMap((e) => Object.values(e.constraints || {}));
            throw new common_1.BadRequestException(`Dados inválidos: ${msgs.join(', ')}`);
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
    async findAll(params) {
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
    async findById(id) {
        const ritual = await this.repo.findOne({ where: { id } });
        if (!ritual)
            throw new common_1.NotFoundException('Ritual não encontrado.');
        return ritual;
    }
    async update(id, payload) {
        const ritual = await this.findById(id);
        const dto = Object.assign(new update_1.UpdateCockpitRitualDTO(), payload);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            const msgs = errors.flatMap((e) => Object.values(e.constraints || {}));
            throw new common_1.BadRequestException(`Dados inválidos: ${msgs.join(', ')}`);
        }
        Object.assign(ritual, payload);
        return this.repo.save(ritual);
    }
    async duplicate(id) {
        const ritual = await this.findById(id);
        const copy = this.repo.create({
            ...ritual,
            id: undefined,
            name: `${ritual.name} (cópia)`,
            is_active: true,
            created_at: undefined,
            updated_at: undefined,
        });
        return this.repo.save(copy);
    }
    async setActive(id, active) {
        const ritual = await this.findById(id);
        ritual.is_active = active;
        return this.repo.save(ritual);
    }
    async linkKpis(ritualId, kpiIds) {
        await this.findById(ritualId);
        await this.repo.manager.query(`DELETE FROM erp_cockpit_kpi_ritual WHERE ritual_id = $1`, [ritualId]);
        for (const kid of kpiIds) {
            await this.repo.manager.query(`INSERT INTO erp_cockpit_kpi_ritual (kpi_id, ritual_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [kid, ritualId]);
        }
        await this.repo
            .createQueryBuilder()
            .update(cockpit_ritual_entity_1.CockpitRitualEntity)
            .set({ kpi_count: kpiIds.length })
            .where('id = :id', { id: ritualId })
            .execute();
    }
    /** IDs dos KPIs ligados ao ritual (tabela erp_cockpit_kpi_ritual). */
    async findLinkedKpiIds(ritualId) {
        await this.findById(ritualId);
        const rows = (await this.repo.manager.query(`SELECT kpi_id FROM erp_cockpit_kpi_ritual WHERE ritual_id = $1 ORDER BY kpi_id`, [ritualId]));
        return (rows ?? []).map((r) => String(r.kpi_id));
    }
    /** Feed iCal (RFC 5545) com eventos recorrentes por ritual ativo. */
    async buildIcsFeed(area) {
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
            if (freq.includes('mensal') || freq.includes('month'))
                rrule = 'FREQ=MONTHLY';
            if (freq.includes('diári') || freq.includes('daily') || freq === 'diaria')
                rrule = 'FREQ=DAILY';
            const start = new Date(r.created_at);
            start.setUTCHours(13, 0, 0, 0);
            const dtstart = this.formatIcsUtc(start);
            const dur = Math.max(15, Number(r.duration_min ?? 60));
            const desc = `${r.area} · ${r.schedule} · ${r.owner_name}`.trim();
            lines.push('BEGIN:VEVENT', `UID:${uid}`, `DTSTAMP:${stamp}`, `DTSTART:${dtstart}`, `DURATION:PT${dur}M`, `SUMMARY:${this.escapeIcsText(r.name)}`, `DESCRIPTION:${this.escapeIcsText(desc)}`, `RRULE:${rrule}`, 'END:VEVENT');
        }
        lines.push('END:VCALENDAR');
        return lines.join('\r\n');
    }
    escapeIcsText(s) {
        return (s || '')
            .replace(/\\/g, '\\\\')
            .replace(/\n/g, '\\n')
            .replace(/;/g, '\\;')
            .replace(/,/g, '\\,');
    }
    formatIcsUtc(d) {
        return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    }
};
exports.CockpitRitualService = CockpitRitualService;
exports.CockpitRitualService = CockpitRitualService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cockpit_ritual_entity_1.CockpitRitualEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CockpitRitualService);
