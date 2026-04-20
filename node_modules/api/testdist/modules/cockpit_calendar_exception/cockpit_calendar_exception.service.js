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
exports.CockpitCalendarExceptionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_validator_1 = require("class-validator");
const cockpit_calendar_exception_entity_1 = require("./entities/cockpit_calendar_exception.entity");
const create_1 = require("./dtos/create");
let CockpitCalendarExceptionService = class CockpitCalendarExceptionService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async create(payload) {
        const dto = Object.assign(new create_1.CreateCockpitCalendarExceptionDTO(), payload);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            const msgs = errors.flatMap((e) => Object.values(e.constraints || {}));
            throw new common_1.BadRequestException(`Dados inválidos: ${msgs.join(', ')}`);
        }
        const entity = this.repo.create({
            ritual_id: payload.ritual_id ?? null,
            occurrence_date: payload.occurrence_date,
            exception_type: payload.exception_type,
            notes: payload.notes ?? null,
        });
        return this.repo.save(entity);
    }
    async findAll(params) {
        const qb = this.repo.createQueryBuilder('e');
        if (params?.ritual_id)
            qb.andWhere('e.ritual_id = :ritual_id', { ritual_id: params.ritual_id });
        if (params?.from)
            qb.andWhere('e.occurrence_date >= :from', { from: params.from });
        if (params?.to)
            qb.andWhere('e.occurrence_date <= :to', { to: params.to });
        qb.orderBy('e.occurrence_date', 'DESC');
        return qb.getMany();
    }
    async findById(id) {
        const entity = await this.repo.findOne({ where: { id } });
        if (!entity)
            throw new common_1.NotFoundException('Exceção não encontrada.');
        return entity;
    }
    async update(id, payload) {
        const entity = await this.findById(id);
        const dto = Object.assign(new create_1.CreateCockpitCalendarExceptionDTO(), payload);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            const msgs = errors.flatMap((e) => Object.values(e.constraints || {}));
            throw new common_1.BadRequestException(`Dados inválidos: ${msgs.join(', ')}`);
        }
        entity.ritual_id = payload.ritual_id ?? null;
        entity.occurrence_date = payload.occurrence_date;
        entity.exception_type = payload.exception_type;
        entity.notes = payload.notes ?? null;
        return this.repo.save(entity);
    }
    async delete(id) {
        const entity = await this.findById(id);
        await this.repo.remove(entity);
    }
};
exports.CockpitCalendarExceptionService = CockpitCalendarExceptionService;
exports.CockpitCalendarExceptionService = CockpitCalendarExceptionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cockpit_calendar_exception_entity_1.CockpitCalendarExceptionEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CockpitCalendarExceptionService);
