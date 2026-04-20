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
exports.CockpitMeetingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cockpit_meeting_service_1 = require("./cockpit_meeting.service");
const create_1 = require("./dtos/create");
let CockpitMeetingController = class CockpitMeetingController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(body) {
        return this.service.create(body);
    }
    list(ritualId, area, occurred_from, occurred_to, q) {
        return this.service.findAll({ ritualId, area, occurred_from, occurred_to, q });
    }
    diff(id, otherId) {
        return this.service.diffMeetings(id, otherId);
    }
    get(id) {
        return this.service.findById(id);
    }
    attachAta(id, body) {
        return this.service.attachAta(id, body);
    }
};
exports.CockpitMeetingController = CockpitMeetingController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_1.CreateCockpitMeetingDTO]),
    __metadata("design:returntype", Promise)
], CockpitMeetingController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('ritualId')),
    __param(1, (0, common_1.Query)('area')),
    __param(2, (0, common_1.Query)('occurred_from')),
    __param(3, (0, common_1.Query)('occurred_to')),
    __param(4, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], CockpitMeetingController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id/diff/:otherId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('otherId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CockpitMeetingController.prototype, "diff", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CockpitMeetingController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(':id/ata'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CockpitMeetingController.prototype, "attachAta", null);
exports.CockpitMeetingController = CockpitMeetingController = __decorate([
    (0, swagger_1.ApiTags)('Cockpit – Reuniões'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('cockpit/meetings'),
    __metadata("design:paramtypes", [cockpit_meeting_service_1.CockpitMeetingService])
], CockpitMeetingController);
