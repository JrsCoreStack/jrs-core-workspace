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
exports.CockpitMeetingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_validator_1 = require("class-validator");
const cockpit_meeting_entity_1 = require("./entities/cockpit_meeting.entity");
const create_1 = require("./dtos/create");
let CockpitMeetingService = class CockpitMeetingService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async create(payload) {
        const dto = Object.assign(new create_1.CreateCockpitMeetingDTO(), payload);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            const msgs = errors.flatMap((e) => Object.values(e.constraints || {}));
            throw new common_1.BadRequestException(`Dados inválidos: ${msgs.join(', ')}`);
        }
        const meeting = this.repo.create({
            ritual_id: payload.ritual_id ?? null,
            occurred_at: payload.occurred_at ? new Date(payload.occurred_at) : undefined,
            duration_min: payload.duration_min ?? 60,
            state: payload.state ?? 'done',
            ata: null,
            agenda_items: Array.isArray(payload.agenda_items) ? payload.agenda_items : [],
            meeting_participants: Array.isArray(payload.meeting_participants)
                ? payload.meeting_participants
                : [],
            ata_template_id: payload.ata_template_id ?? null,
        });
        return this.repo.save(meeting);
    }
    async findAll(params) {
        const qb = this.repo.createQueryBuilder('m');
        if (params?.ritualId)
            qb.andWhere('m.ritual_id = :rid', { rid: params.ritualId });
        if (params?.area && params.area !== 'ALL') {
            qb.andWhere(`m.ritual_id IN (SELECT id FROM erp_cockpit_ritual WHERE area = :area)`, {
                area: params.area,
            });
        }
        if (params?.occurred_from) {
            qb.andWhere('m.occurred_at >= :of', { of: new Date(params.occurred_from) });
        }
        if (params?.occurred_to) {
            qb.andWhere('m.occurred_at <= :ot', { ot: new Date(params.occurred_to) });
        }
        const qq = params?.q?.trim();
        if (qq) {
            qb.andWhere(`(COALESCE(m.ata::text,'') ILIKE :qq OR COALESCE(m.agenda_items::text,'') ILIKE :qq OR COALESCE(m.meeting_participants::text,'') ILIKE :qq)`, { qq: `%${qq}%` });
        }
        qb.orderBy('m.occurred_at', 'DESC');
        return qb.getMany();
    }
    async findById(id) {
        const meeting = await this.repo.findOne({ where: { id } });
        if (!meeting)
            throw new common_1.NotFoundException('Reunião não encontrada.');
        return meeting;
    }
    async attachAta(id, body) {
        const meeting = await this.findById(id);
        if (body?.agenda_items !== undefined)
            meeting.agenda_items = body.agenda_items;
        if (body?.meeting_participants !== undefined)
            meeting.meeting_participants = body.meeting_participants;
        if (body?.ata_template_id !== undefined)
            meeting.ata_template_id = body.ata_template_id;
        if (body?.ata !== undefined) {
            meeting.ata = body.ata;
        }
        else if (body !== undefined) {
            const { agenda_items: _a, meeting_participants: _p, ata_template_id: _t, ...rest } = body;
            if (Object.keys(rest).length)
                meeting.ata = rest;
        }
        meeting.state = 'done';
        return this.repo.save(meeting);
    }
    async diffMeetings(id, otherId) {
        const left = await this.findById(id);
        const right = await this.findById(otherId);
        const ata_equal = JSON.stringify(left.ata ?? null) === JSON.stringify(right.ata ?? null);
        const agenda_equal = JSON.stringify(left.agenda_items ?? []) === JSON.stringify(right.agenda_items ?? []);
        const participants_equal = JSON.stringify(left.meeting_participants ?? []) === JSON.stringify(right.meeting_participants ?? []);
        return { left, right, ata_equal, agenda_equal, participants_equal };
    }
};
exports.CockpitMeetingService = CockpitMeetingService;
exports.CockpitMeetingService = CockpitMeetingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cockpit_meeting_entity_1.CockpitMeetingEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CockpitMeetingService);
