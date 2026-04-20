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
exports.UserAccountService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_account_entity_1 = require("./entities/user_account.entity");
const typeorm_2 = require("typeorm");
const create_1 = require("./dtos/create");
const class_validator_1 = require("class-validator");
let UserAccountService = class UserAccountService {
    userAccountRepository;
    constructor(userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }
    async create(createUserAccountDTO) {
        const dto = Object.assign(new create_1.CreateUserAccountDTO(), createUserAccountDTO);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            const errorMessages = errors.map((error) => {
                return Object.values(error.constraints || {}).join(', ');
            });
            throw new common_1.BadRequestException(`Dados inválidos: ${errorMessages.join(', ')}`);
        }
        const userAccount = this.userAccountRepository.create(createUserAccountDTO);
        return this.userAccountRepository.save(userAccount);
    }
    async findAll(account_id, name) {
        return this.userAccountRepository.find({
            relations: ['user', 'account'],
            where: {
                account_id: account_id,
                user: {
                    name: name ? (0, typeorm_2.ILike)(`%${name}%`) : undefined,
                },
            },
        });
    }
    async findById(id) {
        const userAccount = await this.userAccountRepository.findOne({
            where: { id },
            relations: ['user', 'account'],
        });
        if (!userAccount) {
            throw new common_1.BadRequestException(`Conta de usuário com ID ${id} não encontrada.`);
        }
        return userAccount;
    }
    async findByUserId(userId) {
        const user = await this.userAccountRepository.find({
            relations: ['user', 'account', 'role'],
            where: {
                user_id: userId,
            },
        });
        return user;
    }
    async findByCpf(cpf) {
        cpf = cpf.replace(/\D/g, '');
        const users = await this.userAccountRepository.find({
            relations: [
                'user',
                'account',
                'role',
                'account.user_accounts',
                'account.user_accounts.user',
            ],
            where: {
                user: {
                    cpf: cpf,
                },
            },
        });
        if (users.length > 0) {
            return users[0];
        }
        return null;
    }
    async findByEmail(email) {
        const users = await this.userAccountRepository.find({
            relations: [
                'user',
                'account',
                'account.user_accounts',
                'account.user_accounts.user',
            ],
            where: {
                user: {
                    email: email,
                },
            },
        });
        if (users.length > 0) {
            return users[0];
        }
        return null;
    }
    async update(id, updateUserAccountDTO) {
        const userAccount = await this.findById(id);
        const updatedUserAccount = Object.assign(userAccount, updateUserAccountDTO);
        return this.userAccountRepository.save(updatedUserAccount);
    }
    async delete(id) {
        const userAccount = await this.findById(id);
        await this.userAccountRepository.remove(userAccount);
    }
};
exports.UserAccountService = UserAccountService;
exports.UserAccountService = UserAccountService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_account_entity_1.UserAccountEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserAccountService);
