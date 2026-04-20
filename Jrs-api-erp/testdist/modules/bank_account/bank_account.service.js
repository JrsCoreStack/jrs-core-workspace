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
exports.BankAccountService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bank_account_entity_1 = require("./entities/bank_account.entity");
const typeorm_2 = require("typeorm");
const create_1 = require("./dtos/create");
const class_validator_1 = require("class-validator");
let BankAccountService = class BankAccountService {
    bankAccountRepository;
    constructor(bankAccountRepository) {
        this.bankAccountRepository = bankAccountRepository;
    }
    async create(createBankAccountDTO) {
        const dto = Object.assign(new create_1.CreateBankAccountDTO(), createBankAccountDTO);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            const errorMessages = errors.map((error) => {
                return Object.values(error.constraints || {}).join(', ');
            });
            throw new common_1.BadRequestException(`Dados inválidos: ${errorMessages.join(', ')}`);
        }
        const bank = this.bankAccountRepository.create(createBankAccountDTO);
        return this.bankAccountRepository.save(bank);
    }
    async findAll(account_id) {
        return this.bankAccountRepository.find({
            where: {
                account_id: account_id,
            },
            relations: ['account', 'bank'],
        });
    }
};
exports.BankAccountService = BankAccountService;
exports.BankAccountService = BankAccountService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(bank_account_entity_1.BankAccountEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], BankAccountService);
