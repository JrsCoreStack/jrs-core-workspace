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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const create_1 = require("./dtos/create");
const return_1 = require("./dtos/return");
const auth_service_1 = require("./auth.service");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async signIn(data) {
        return await this.authService.signIn(data);
    }
    async updateToken(token, account_id) {
        const newToken = await this.authService.updateToken(token, account_id);
        return {
            token: newToken.token,
            account: {
                id: newToken.account.id,
                name: newToken.account.name,
            },
            role: newToken.role,
            permissions: newToken.permissions,
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Login com CPF e senha' }),
    (0, swagger_1.ApiBody)({ type: create_1.AuthDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login realizado com sucesso', type: return_1.ReturnAuthDTO }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Credenciais inválidas' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Usuário bloqueado ou inativo' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_1.AuthDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signIn", null);
__decorate([
    (0, common_1.Post)('token/update'),
    (0, swagger_1.ApiOperation)({ summary: 'Trocar conta ativa no token JWT' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['token', 'account_id'],
            properties: {
                token: { type: 'string', example: 'eyJhbGci...' },
                account_id: { type: 'string', format: 'uuid', example: 'uuid-da-conta' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Novo token emitido com a conta selecionada',
        schema: {
            type: 'object',
            properties: {
                token: { type: 'string' },
                account: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                    },
                },
                role: { type: 'string', nullable: true },
                permissions: { type: 'array', items: { type: 'string' } },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Token inválido ou expirado' }),
    __param(0, (0, common_1.Body)('token')),
    __param(1, (0, common_1.Body)('account_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateToken", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
