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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt_1 = require("bcrypt");
const account_service_1 = require("../account/account.service");
const user_service_1 = require("../user/user.service");
const user_status_enum_1 = require("src/utils/enums/user_status.enum");
const virtual_account_1 = require("./virtual-account");
let AuthService = class AuthService {
    jwtService;
    accountService;
    userService;
    constructor(jwtService, accountService, userService) {
        this.jwtService = jwtService;
        this.accountService = accountService;
        this.userService = userService;
    }
    /** Evita exceção se o hash no banco estiver corrompido ou em texto plano legado */
    safeBcryptCompare(plain, hash) {
        try {
            if (!hash || hash.length < 20) {
                return false;
            }
            return (0, bcrypt_1.compareSync)(plain, hash);
        }
        catch {
            return false;
        }
    }
    async signIn(data) {
        const cpfDigits = data.cpf.replace(/\D/g, '');
        const userEntity = await this.userService.findByCpf(cpfDigits);
        if (!userEntity ||
            !this.safeBcryptCompare(data.password, userEntity.password)) {
            throw new common_1.HttpException({
                message: 'Usuário ou senha inválidos',
                code: 1,
            }, common_1.HttpStatus.UNAUTHORIZED);
        }
        // Verificar status do usuário
        if (userEntity.status === user_status_enum_1.UserStatus.INACTIVE) {
            throw new common_1.HttpException({
                message: 'Usuário inativo',
                code: 2,
            }, common_1.HttpStatus.UNAUTHORIZED);
        }
        if (userEntity.status === user_status_enum_1.UserStatus.BLOCKED) {
            throw new common_1.HttpException({
                message: 'Usuário bloqueado',
                code: 3,
            }, common_1.HttpStatus.UNAUTHORIZED);
        }
        // Atualizar último login
        await this.userService.updateLastLogin(userEntity.id);
        /* Projeto sem vínculo user↔account: sempre conta virtual. Role/permissões vazios. */
        const currentAccountId = virtual_account_1.VIRTUAL_COCKPIT_ACCOUNT_ID;
        const currentAccount = {
            id: virtual_account_1.VIRTUAL_COCKPIT_ACCOUNT_ID,
            name: virtual_account_1.VIRTUAL_COCKPIT_ACCOUNT_NAME,
        };
        const accounts = [
            {
                id: virtual_account_1.VIRTUAL_COCKPIT_ACCOUNT_ID,
                name: virtual_account_1.VIRTUAL_COCKPIT_ACCOUNT_NAME,
                code: '',
                email: '',
                type: 0,
                level: '',
            },
        ];
        const role = null;
        const permissions = [];
        const payload = {
            sub: userEntity.id,
            cpf: userEntity.cpf,
            current_account_id: currentAccountId,
            user_id: userEntity.id,
        };
        const token = this.jwtService.sign(payload);
        return {
            user: {
                id: userEntity.id,
                name: userEntity.name,
                email: userEntity.email,
                cpf: userEntity.cpf,
            },
            account: {
                id: currentAccount.id,
                name: currentAccount.name,
            },
            accounts: accounts,
            current_account_id: currentAccountId,
            role: role || null,
            permissions: permissions || [],
            token,
            expiresIn: String(process.env.JWT_EXPIRATION_TIME),
        };
    }
    /**
     * Emite novo JWT com `current_account_id` atualizado.
     * Não há `erp_user_account` neste projeto — valida só token + existência da conta em `erp_account`.
     */
    async updateToken(currentToken, account_id) {
        try {
            const account = await this.accountService.findById(account_id);
            const decodedToken = this.jwtService.decode(currentToken);
            if (!decodedToken) {
                throw new common_1.UnauthorizedException('Token inválido.');
            }
            const userId = (decodedToken.user_id ?? decodedToken.sub);
            if (!userId) {
                throw new common_1.UnauthorizedException('Token inválido.');
            }
            const { iat, exp, ...payload } = decodedToken;
            const nextPayload = {
                ...payload,
                user_id: userId,
                current_account_id: account_id,
            };
            const token = this.jwtService.sign(nextPayload);
            return {
                token,
                account,
                role: null,
                permissions: [],
            };
        }
        catch (e) {
            if (e instanceof common_1.UnauthorizedException)
                throw e;
            throw new common_1.UnauthorizedException('Erro ao atualizar o token.');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        account_service_1.AccountService,
        user_service_1.UserService])
], AuthService);
