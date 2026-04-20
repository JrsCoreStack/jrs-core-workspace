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
exports.EventService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const create_1 = require("./dtos/create");
const class_validator_1 = require("class-validator");
const event_entity_1 = require("./entities/event.entity");
const account_service_1 = require("../account/account.service");
let EventService = class EventService {
    eventRepository;
    accountService;
    constructor(eventRepository, accountService) {
        this.eventRepository = eventRepository;
        this.accountService = accountService;
    }
    async create(createEventDTO) {
        await this.accountService.findById(createEventDTO.account_id);
        const dto = Object.assign(new create_1.CreateEventDTO(), {
            ...createEventDTO,
            start_date: new Date(createEventDTO.start_date),
            end_date: new Date(createEventDTO.end_date),
        });
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            const errorMessages = errors.map((error) => {
                return Object.values(error.constraints || {}).join(', ');
            });
            throw new common_1.BadRequestException(`Dados inválidos: ${errorMessages.join(', ')}`);
        }
        const eventExists = await this.eventExists(createEventDTO.id_reference, createEventDTO.account_id);
        if (eventExists) {
            throw new common_1.BadRequestException(`Evento com o id de referência ${createEventDTO.id_reference} já existe na conta ${createEventDTO.account_id}.`);
        }
        const event = this.eventRepository.create(createEventDTO);
        return this.eventRepository.save(event);
    }
    async findAll(account_id, limit, offset, event_name) {
        let where = {
            account_id: account_id,
        };
        if (event_name) {
            where.name = (0, typeorm_2.ILike)(`%${event_name}%`);
        }
        const events = await this.eventRepository.find({
            where: where,
            relations: ['account'],
            take: limit,
            skip: offset,
            order: {
                created_at: 'DESC',
            },
        });
        const countEvents = await this.eventRepository.count({
            where: { account_id: account_id },
        });
        return {
            data: events,
            total: countEvents,
        };
    }
    async findById(id) {
        const event = await this.eventRepository.findOne({ where: { id } });
        if (!event) {
            throw new common_1.BadRequestException(`Evento não encontrado.`);
        }
        return event;
    }
    async eventExists(id_reference, account_id) {
        const event = await this.eventRepository.findOne({
            where: { id_reference, account_id },
        });
        if (event) {
            return event;
        }
        else {
            return null;
        }
    }
};
exports.EventService = EventService;
exports.EventService = EventService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(event_entity_1.EventEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        account_service_1.AccountService])
], EventService);
