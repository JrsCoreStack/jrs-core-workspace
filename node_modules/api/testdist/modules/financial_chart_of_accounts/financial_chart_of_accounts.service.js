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
exports.FinancialChartOfAccountsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const financial_chart_of_accounts_entity_1 = require("./entities/financial_chart_of_accounts.entity");
const typeorm_2 = require("typeorm");
const create_1 = require("./dtos/create");
const class_validator_1 = require("class-validator");
let FinancialChartOfAccountsService = class FinancialChartOfAccountsService {
    chartOfAccountsRepository;
    constructor(chartOfAccountsRepository) {
        this.chartOfAccountsRepository = chartOfAccountsRepository;
    }
    async create(createChartOfAccountsDTO) {
        const dto = Object.assign(new create_1.CreateFinancialChartOfAccountsDTO(), createChartOfAccountsDTO);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            const errorMessages = errors.map((error) => {
                return Object.values(error.constraints || {}).join(', ');
            });
            throw new common_1.BadRequestException(`Dados inválidos: ${errorMessages.join(', ')}`);
        }
        const existingCode = await this.chartOfAccountsRepository.findOne({
            where: { code: createChartOfAccountsDTO.code },
        });
        if (existingCode) {
            throw new common_1.BadRequestException(`Código ${createChartOfAccountsDTO.code} já existe.`);
        }
        const chartOfAccount = this.chartOfAccountsRepository.create({
            ...createChartOfAccountsDTO,
            active: createChartOfAccountsDTO.active ?? true,
        });
        return this.chartOfAccountsRepository.save(chartOfAccount);
    }
    async findAll() {
        return this.chartOfAccountsRepository.find();
    }
    async findById(id) {
        const chartOfAccount = await this.chartOfAccountsRepository.findOne({
            where: { id },
        });
        if (!chartOfAccount) {
            throw new common_1.BadRequestException(`Plano de contas não encontrado.`);
        }
        return chartOfAccount;
    }
    async findByAccountId(account_id) {
        return this.chartOfAccountsRepository.find({
            where: { account_id },
        });
    }
    async findByCode(code) {
        const chartOfAccount = await this.chartOfAccountsRepository.findOne({
            where: { code },
        });
        if (!chartOfAccount) {
            throw new common_1.BadRequestException(`Plano de contas não encontrado.`);
        }
        return chartOfAccount;
    }
};
exports.FinancialChartOfAccountsService = FinancialChartOfAccountsService;
exports.FinancialChartOfAccountsService = FinancialChartOfAccountsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(financial_chart_of_accounts_entity_1.FinancialChartOfAccountsEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FinancialChartOfAccountsService);
