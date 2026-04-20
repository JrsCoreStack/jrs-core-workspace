"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialGatewayFeeRuleModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const financial_gateway_fee_rule_entity_1 = require("./entities/financial_gateway_fee_rule.entity");
const financial_gateway_fee_rule_controller_1 = require("./financial_gateway_fee_rule.controller");
const financial_gateway_fee_rule_service_1 = require("./financial_gateway_fee_rule.service");
const account_module_1 = require("../account/account.module");
let FinancialGatewayFeeRuleModule = class FinancialGatewayFeeRuleModule {
};
exports.FinancialGatewayFeeRuleModule = FinancialGatewayFeeRuleModule;
exports.FinancialGatewayFeeRuleModule = FinancialGatewayFeeRuleModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([financial_gateway_fee_rule_entity_1.FinancialGatewayFeeRuleEntity]),
            account_module_1.AccountModule,
        ],
        controllers: [financial_gateway_fee_rule_controller_1.FinancialGatewayFeeRuleController],
        providers: [financial_gateway_fee_rule_service_1.FinancialGatewayFeeRuleService],
        exports: [financial_gateway_fee_rule_service_1.FinancialGatewayFeeRuleService],
    })
], FinancialGatewayFeeRuleModule);
