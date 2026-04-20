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
exports.FinancialGatewayFeeRuleService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_validator_1 = require("class-validator");
const financial_gateway_fee_rule_entity_1 = require("./entities/financial_gateway_fee_rule.entity");
const create_1 = require("./dtos/create");
const financial_card_brand_enum_1 = require("src/utils/enums/financial_card_brand.enum");
const account_service_1 = require("../account/account.service");
let FinancialGatewayFeeRuleService = class FinancialGatewayFeeRuleService {
    financialGatewayFeeRuleRepository;
    accountService;
    constructor(financialGatewayFeeRuleRepository, accountService) {
        this.financialGatewayFeeRuleRepository = financialGatewayFeeRuleRepository;
        this.accountService = accountService;
    }
    async create(createFinancialGatewayFeeRuleDTO) {
        const dto = Object.assign(new create_1.CreateFinancialGatewayFeeRuleDTO(), createFinancialGatewayFeeRuleDTO);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            const errorMessages = errors.map((error) => {
                return Object.values(error.constraints || {}).join(', ');
            });
            throw new common_1.BadRequestException(`Dados inválidos: ${errorMessages.join(', ')}`);
        }
        const financialGatewayFeeRule = this.financialGatewayFeeRuleRepository.create({
            ...createFinancialGatewayFeeRuleDTO,
        });
        return this.financialGatewayFeeRuleRepository.save(financialGatewayFeeRule);
    }
    async findAll() {
        return this.financialGatewayFeeRuleRepository.find();
    }
    async findById(id) {
        const financialGatewayFeeRule = await this.financialGatewayFeeRuleRepository.findOne({
            where: { id },
        });
        if (!financialGatewayFeeRule) {
            throw new common_1.BadRequestException(`Regra de taxa de gateway não encontrada.`);
        }
        return financialGatewayFeeRule;
    }
    async findByAccountId(account_id) {
        return this.financialGatewayFeeRuleRepository.find({
            where: { account_id },
        });
    }
    async findActive(account_id) {
        const where = { active: true };
        if (account_id) {
            where.account_id = account_id;
        }
        return this.financialGatewayFeeRuleRepository.find({
            where,
            order: {
                gateway: 'ASC',
                payment_method: 'ASC',
            },
        });
    }
    async findFeeByCriteria(account_code, gateway, payment_method, card_brand, installments) {
        // Buscar account pelo code para obter o account_id
        const account = await this.accountService.findByCode(account_code);
        const account_id = account.id;
        // Validar card_brand apenas se fornecido
        if (card_brand) {
            const validCardBrand = Object.values(financial_card_brand_enum_1.FinancialCardBrand).includes(card_brand);
            if (!validCardBrand) {
                throw new common_1.BadRequestException(`card_brand inválido. Valores aceitos: ${Object.values(financial_card_brand_enum_1.FinancialCardBrand).join(', ')}`);
            }
        }
        // Construir condições de busca
        const where = {
            account_id,
            gateway,
            payment_method,
            active: true,
        };
        // Se card_brand foi fornecido, buscar por ele; caso contrário, buscar onde é NULL
        if (card_brand) {
            where.card_brand = card_brand;
        }
        else {
            where.card_brand = null;
        }
        // Se installments foi fornecido, buscar por ele; caso contrário, buscar onde é NULL
        if (installments !== null && installments !== undefined) {
            where.installments = installments;
        }
        else {
            where.installments = null;
        }
        // Buscar regra exata que corresponde a todos os critérios
        const rule = await this.financialGatewayFeeRuleRepository.findOne({
            where,
        });
        if (!rule) {
            return null;
        }
        return {
            percentage_fee: Number(rule.percentage_fee),
            fixed_fee: Number(rule.fixed_fee),
        };
    }
};
exports.FinancialGatewayFeeRuleService = FinancialGatewayFeeRuleService;
exports.FinancialGatewayFeeRuleService = FinancialGatewayFeeRuleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(financial_gateway_fee_rule_entity_1.FinancialGatewayFeeRuleEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        account_service_1.AccountService])
], FinancialGatewayFeeRuleService);
