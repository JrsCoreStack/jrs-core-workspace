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
exports.BankController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const bank_service_1 = require("./bank.service");
const create_1 = require("./dtos/create");
let BankController = class BankController {
    bankService;
    constructor(bankService) {
        this.bankService = bankService;
    }
    async create(createBank) {
        return this.bankService.create(createBank);
    }
    async findAll() {
        return this.bankService.findAll();
    }
};
exports.BankController = BankController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_1.CreateBankDTO]),
    __metadata("design:returntype", Promise)
], BankController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BankController.prototype, "findAll", null);
exports.BankController = BankController = __decorate([
    (0, swagger_1.ApiTags)('Bancos'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('bank'),
    __metadata("design:paramtypes", [bank_service_1.BankService])
], BankController);
