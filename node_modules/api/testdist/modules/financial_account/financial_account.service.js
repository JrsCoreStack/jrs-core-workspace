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
exports.FinancialAccountService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_validator_1 = require("class-validator");
const financial_account_entity_1 = require("./entities/financial_account.entity");
const create_1 = require("./dtos/create");
let FinancialAccountService = class FinancialAccountService {
    financialAccountRepository;
    constructor(financialAccountRepository) {
        this.financialAccountRepository = financialAccountRepository;
    }
    async create(createFinancialAccountDTO) {
        const dto = Object.assign(new create_1.CreateFinancialAccountDTO(), createFinancialAccountDTO);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            const errorMessages = errors.map((error) => {
                return Object.values(error.constraints || {}).join(', ');
            });
            throw new common_1.BadRequestException(`Dados inválidos: ${errorMessages.join(', ')}`);
        }
        const financialAccount = this.financialAccountRepository.create({
            ...createFinancialAccountDTO
        });
        return this.financialAccountRepository.save(financialAccount);
    }
    async findAll() {
        return this.financialAccountRepository.find();
    }
    async findById(id) {
        const financialAccount = await this.financialAccountRepository.findOne({
            where: { id },
        });
        if (!financialAccount) {
            throw new common_1.BadRequestException(`Conta financeira não encontrada.`);
        }
        return financialAccount;
    }
    async findByAccountId(account_id) {
        return this.financialAccountRepository.find({
            where: { account_id },
        });
    }
};
exports.FinancialAccountService = FinancialAccountService;
exports.FinancialAccountService = FinancialAccountService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(financial_account_entity_1.FinancialAccountEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FinancialAccountService);
