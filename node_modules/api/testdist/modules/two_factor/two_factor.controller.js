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
exports.TwoFactorController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const two_factor_service_1 = require("./two_factor.service");
let TwoFactorController = class TwoFactorController {
    twoFactorService;
    constructor(twoFactorService) {
        this.twoFactorService = twoFactorService;
    }
    async generate(email) {
        return this.twoFactorService.generateSecret(email);
    }
    // 2. Validação do primeiro código e ativação
    async activate(code, secret, email) {
        return this.twoFactorService.validateAccount({
            code,
            secret,
            email,
        });
    }
    async validate(code, email) {
        return this.twoFactorService.validateCode(code, email);
    }
};
exports.TwoFactorController = TwoFactorController;
__decorate([
    (0, common_1.Post)('generate'),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TwoFactorController.prototype, "generate", null);
__decorate([
    (0, common_1.Post)('activate'),
    __param(0, (0, common_1.Body)('code')),
    __param(1, (0, common_1.Body)('secret')),
    __param(2, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TwoFactorController.prototype, "activate", null);
__decorate([
    (0, common_1.Post)('validate'),
    __param(0, (0, common_1.Body)('code')),
    __param(1, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TwoFactorController.prototype, "validate", null);
exports.TwoFactorController = TwoFactorController = __decorate([
    (0, swagger_1.ApiTags)('Autentica��o 2FA'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('2fa'),
    __metadata("design:paramtypes", [two_factor_service_1.TwoFactorService])
], TwoFactorController);
