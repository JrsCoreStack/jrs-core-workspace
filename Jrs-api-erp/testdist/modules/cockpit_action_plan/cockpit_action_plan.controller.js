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
exports.CockpitActionPlanController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cockpit_action_plan_service_1 = require("./cockpit_action_plan.service");
const create_1 = require("./dtos/create");
const update_1 = require("./dtos/update");
const add_comment_1 = require("./dtos/add-comment");
let CockpitActionPlanController = class CockpitActionPlanController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(body) {
        return this.service.create(body);
    }
    dashboardSummary(ritual_id, meeting_id) {
        return this.service.dashboardSummary({ ritual_id, meeting_id });
    }
    list(q, area, status, due, priority, todayIso, ritual_id, meeting_id) {
        return this.service.findAll({ q, area, status, due, priority, todayIso, ritual_id, meeting_id });
    }
    get(id) {
        return this.service.findById(id);
    }
    update(id, body) {
        return this.service.update(id, body);
    }
    addComment(id, body) {
        return this.service.addComment(id, body);
    }
    async remove(id) {
        await this.service.delete(id);
        return { message: 'Plano de ação deletado com sucesso' };
    }
};
exports.CockpitActionPlanController = CockpitActionPlanController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_1.CreateCockpitActionPlanDTO]),
    __metadata("design:returntype", Promise)
], CockpitActionPlanController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('dashboard/summary'),
    __param(0, (0, common_1.Query)('ritual_id')),
    __param(1, (0, common_1.Query)('meeting_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CockpitActionPlanController.prototype, "dashboardSummary", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('area')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('due')),
    __param(4, (0, common_1.Query)('priority')),
    __param(5, (0, common_1.Query)('today')),
    __param(6, (0, common_1.Query)('ritual_id')),
    __param(7, (0, common_1.Query)('meeting_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], CockpitActionPlanController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CockpitActionPlanController.prototype, "get", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_1.UpdateCockpitActionPlanDTO]),
    __metadata("design:returntype", Promise)
], CockpitActionPlanController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/comments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_comment_1.AddCockpitActionPlanCommentDTO]),
    __metadata("design:returntype", Promise)
], CockpitActionPlanController.prototype, "addComment", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CockpitActionPlanController.prototype, "remove", null);
exports.CockpitActionPlanController = CockpitActionPlanController = __decorate([
    (0, swagger_1.ApiTags)('Cockpit – Planos de Ação'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('cockpit/action-plans'),
    __metadata("design:paramtypes", [cockpit_action_plan_service_1.CockpitActionPlanService])
], CockpitActionPlanController);
