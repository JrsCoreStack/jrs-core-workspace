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
exports.RoleGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_account_entity_1 = require("../modules/user_account/entities/user_account.entity");
let RoleGuard = class RoleGuard {
    reflector;
    userAccountRepository;
    constructor(reflector, userAccountRepository) {
        this.reflector = reflector;
        this.userAccountRepository = userAccountRepository;
    }
    async canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride('roles', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const accountId = request.current_account_id;
        if (!user || !accountId) {
            throw new common_1.ForbiddenException('Usuário ou conta não encontrados');
        }
        // Buscar o role do usuário na conta específica
        const userAccount = await this.userAccountRepository.findOne({
            where: {
                user_id: user.user_id,
                account_id: accountId,
            },
        });
        if (!userAccount) {
            throw new common_1.ForbiddenException('Usuário não possui acesso a esta conta');
        }
        // Verificar se o role do usuário está na lista de roles permitidos
        // const hasRole = requiredRoles.includes(userAccount.role);
        // if (!hasRole) {
        //   throw new ForbiddenException(
        //     `Acesso negado. Roles necessários: ${requiredRoles.join(', ')}. Role atual: ${userAccount.role}`,
        //   );
        // }
        return true;
    }
};
exports.RoleGuard = RoleGuard;
exports.RoleGuard = RoleGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(user_account_entity_1.UserAccountEntity)),
    __metadata("design:paramtypes", [core_1.Reflector,
        typeorm_2.Repository])
], RoleGuard);
