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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./entities/user.entity");
const typeorm_2 = require("typeorm");
const create_1 = require("./dtos/create");
const class_validator_1 = require("class-validator");
const bcrypt_1 = require("bcrypt");
let UserService = class UserService {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async create(createUserDTO) {
        const dto = Object.assign(new create_1.CreateUserDTO(), createUserDTO);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            const errorMessages = errors.map((error) => {
                return Object.values(error.constraints || {}).join(', ');
            });
            throw new common_1.BadRequestException(`Dados inválidos: ${errorMessages.join(', ')}`);
        }
        const salt = 10;
        const passwordHashed = await (0, bcrypt_1.hash)(createUserDTO.password, salt);
        const cpfDigits = createUserDTO.cpf.replace(/\D/g, '');
        const account = this.userRepository.create({
            ...createUserDTO,
            cpf: cpfDigits,
            password: passwordHashed,
        });
        return this.userRepository.save(account);
    }
    async saveTotpSecret(email, secret) {
        await this.userRepository.update({
            email: email,
        }, {
            totp_secret: secret,
            is2fa_enabled: true,
        });
    }
    async findAll(search) {
        const queryBuilder = this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.user_accounts', 'user_accounts');
        if (search) {
            const searchTerm = search.trim();
            // Remove caracteres não numéricos do CPF para busca
            const cpfSearch = searchTerm.replace(/\D/g, '');
            // Se o termo de busca contém números, busca também por CPF
            if (cpfSearch && cpfSearch.length > 0) {
                queryBuilder.where('(user.name ILIKE :search OR user.email ILIKE :search OR user.cpf = :cpfSearch)', {
                    search: `%${searchTerm}%`,
                    cpfSearch: cpfSearch,
                });
            }
            else {
                // Se não contém números, busca apenas por nome e email
                queryBuilder.where('(user.name ILIKE :search OR user.email ILIKE :search)', {
                    search: `%${searchTerm}%`,
                });
            }
        }
        return queryBuilder.getMany();
    }
    async findById(id) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['user_accounts'],
        });
        if (!user) {
            throw new common_1.BadRequestException(`Usuário com ID ${id} não encontrado.`);
        }
        return user;
    }
    async findByCpf(cpf) {
        cpf = cpf.replace(/\D/g, '');
        const user = await this.userRepository.findOne({
            where: { cpf },
        });
        if (user) {
            return user;
        }
        else {
            return null;
        }
    }
    async findByEmail(email) {
        const user = await this.userRepository.findOne({
            where: { email },
        });
        if (user) {
            return user;
        }
        else {
            return null;
        }
    }
    async update(id, updateUserDTO) {
        const user = await this.findById(id);
        const updatedUser = Object.assign(user, updateUserDTO);
        return this.userRepository.save(updatedUser);
    }
    async updateLastLogin(userId) {
        await this.userRepository.update({ id: userId }, { last_login: new Date() });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserService);
