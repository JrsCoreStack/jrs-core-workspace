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
exports.UserAccountController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const user_account_service_1 = require("./user_account.service");
const create_1 = require("./dtos/create");
const account_decorator_1 = require("src/decorators/account.decorator");
const auth_guard_1 = require("src/guards/auth.guard");
const account_guard_1 = require("src/guards/account.guard");
const role_guard_1 = require("src/guards/role.guard");
let UserAccountController = class UserAccountController {
    userAccountService;
    constructor(userAccountService) {
        this.userAccountService = userAccountService;
    }
    async create(createUserAccount) {
        return this.userAccountService.create(createUserAccount);
    }
    async findAll(account_id, name) {
        return this.userAccountService.findAll(account_id, name);
    }
    async update(updateUser, id) {
        return this.userAccountService.update(id, updateUser);
    }
    async delete(id) {
        return this.userAccountService.delete(id);
    }
    async findByUserId(id) {
        return this.userAccountService.findByUserId(id);
    }
};
exports.UserAccountController = UserAccountController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Vincular usuário a uma conta' }),
    (0, swagger_1.ApiBody)({ type: create_1.CreateUserAccountDTO }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Vínculo criado com sucesso' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_1.CreateUserAccountDTO]),
    __metadata("design:returntype", Promise)
], UserAccountController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, account_guard_1.AccountGuard, role_guard_1.RoleGuard),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar usuários da conta logada' }),
    (0, swagger_1.ApiQuery)({ name: 'name', required: false, description: 'Filtrar por nome' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de vínculos usuário-conta' }),
    __param(0, (0, account_decorator_1.CurrentAccountId)()),
    __param(1, (0, common_1.Query)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserAccountController.prototype, "findAll", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar vínculo usuário-conta' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vínculo atualizado' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserAccountController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Remover vínculo usuário-conta' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vínculo removido' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserAccountController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)('/user/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar vínculos por ID do usuário' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid', description: 'ID do usuário' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vínculos do usuário' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserAccountController.prototype, "findByUserId", null);
exports.UserAccountController = UserAccountController = __decorate([
    (0, swagger_1.ApiTags)('Usuário-Conta'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('user_account'),
    __metadata("design:paramtypes", [user_account_service_1.UserAccountService])
], UserAccountController);
