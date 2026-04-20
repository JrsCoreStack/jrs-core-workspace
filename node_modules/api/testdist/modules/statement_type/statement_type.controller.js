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
exports.StatementTypeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const statement_type_service_1 = require("./statement_type.service");
const auth_guard_1 = require("src/guards/auth.guard");
const account_guard_1 = require("src/guards/account.guard");
const create_1 = require("./dtos/create");
let StatementTypeController = class StatementTypeController {
    statementTypeService;
    constructor(statementTypeService) {
        this.statementTypeService = statementTypeService;
    }
    async create(createStatementType) {
        return this.statementTypeService.create(createStatementType);
    }
    async findAll() {
        return this.statementTypeService.findAll();
    }
};
exports.StatementTypeController = StatementTypeController;
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, account_guard_1.AccountGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_1.CreateStatementTypeDTO]),
    __metadata("design:returntype", Promise)
], StatementTypeController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, account_guard_1.AccountGuard),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatementTypeController.prototype, "findAll", null);
exports.StatementTypeController = StatementTypeController = __decorate([
    (0, swagger_1.ApiTags)('Tipos de Extrato'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('statement_type'),
    __metadata("design:paramtypes", [statement_type_service_1.StatementTypeService])
], StatementTypeController);
