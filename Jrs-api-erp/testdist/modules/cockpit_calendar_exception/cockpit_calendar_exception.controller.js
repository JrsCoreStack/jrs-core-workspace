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
exports.CockpitCalendarExceptionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cockpit_calendar_exception_service_1 = require("./cockpit_calendar_exception.service");
const create_1 = require("./dtos/create");
let CockpitCalendarExceptionController = class CockpitCalendarExceptionController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(body) {
        return this.service.create(body);
    }
    list(from, to, ritual_id) {
        return this.service.findAll({ from, to, ritual_id });
    }
    get(id) {
        return this.service.findById(id);
    }
    update(id, body) {
        return this.service.update(id, body);
    }
    async remove(id) {
        await this.service.delete(id);
        return { message: 'Exceção deletada com sucesso' };
    }
};
exports.CockpitCalendarExceptionController = CockpitCalendarExceptionController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_1.CreateCockpitCalendarExceptionDTO]),
    __metadata("design:returntype", Promise)
], CockpitCalendarExceptionController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __param(2, (0, common_1.Query)('ritual_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CockpitCalendarExceptionController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CockpitCalendarExceptionController.prototype, "get", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_1.CreateCockpitCalendarExceptionDTO]),
    __metadata("design:returntype", Promise)
], CockpitCalendarExceptionController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CockpitCalendarExceptionController.prototype, "remove", null);
exports.CockpitCalendarExceptionController = CockpitCalendarExceptionController = __decorate([
    (0, swagger_1.ApiTags)('Cockpit � Calend�rio'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('cockpit/calendar/exceptions'),
    __metadata("design:paramtypes", [cockpit_calendar_exception_service_1.CockpitCalendarExceptionService])
], CockpitCalendarExceptionController);
