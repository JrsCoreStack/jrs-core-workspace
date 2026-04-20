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
exports.BankAccountController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const bank_account_service_1 = require("./bank_account.service");
const create_1 = require("./dtos/create");
const auth_guard_1 = require("src/guards/auth.guard");
const account_guard_1 = require("src/guards/account.guard");
const account_decorator_1 = require("src/decorators/account.decorator");
let BankAccountController = class BankAccountController {
    bankAccountService;
    constructor(bankAccountService) {
        this.bankAccountService = bankAccountService;
    }
    async create(createBankAccount) {
        return this.bankAccountService.create(createBankAccount);
    }
    async findAll(account_id) {
        return this.bankAccountService.findAll(account_id);
    }
};
exports.BankAccountController = BankAccountController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_1.CreateBankAccountDTO]),
    __metadata("design:returntype", Promise)
], BankAccountController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, account_guard_1.AccountGuard),
    (0, common_1.Get)(),
    __param(0, (0, account_decorator_1.CurrentAccountId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BankAccountController.prototype, "findAll", null);
exports.BankAccountController = BankAccountController = __decorate([
    (0, swagger_1.ApiTags)('Contas Banc�rias'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('bank_account'),
    __metadata("design:paramtypes", [bank_account_service_1.BankAccountService])
], BankAccountController);
