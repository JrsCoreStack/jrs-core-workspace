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
exports.CockpitNotificationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cockpit_notification_service_1 = require("./cockpit_notification.service");
const create_1 = require("./dtos/create");
const update_1 = require("./dtos/update");
let CockpitNotificationController = class CockpitNotificationController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(body) {
        return this.service.create(body);
    }
    list(q, source, severity, only_unread, limit) {
        return this.service.findAll({
            q,
            source,
            severity,
            only_unread: only_unread === 'true' || only_unread === '1',
            limit: limit ? Number(limit) : undefined,
        });
    }
    get(id) {
        return this.service.findById(id);
    }
    update(id, body) {
        return this.service.update(id, body);
    }
    markRead(id) {
        return this.service.setRead(id, true);
    }
    markUnread(id) {
        return this.service.setRead(id, false);
    }
    markAllRead() {
        return this.service.markAllAsRead();
    }
    clearAll() {
        return this.service.clearAll();
    }
    async remove(id) {
        await this.service.delete(id);
        return { message: 'Notificação deletada com sucesso' };
    }
};
exports.CockpitNotificationController = CockpitNotificationController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_1.CreateCockpitNotificationDTO]),
    __metadata("design:returntype", Promise)
], CockpitNotificationController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('source')),
    __param(2, (0, common_1.Query)('severity')),
    __param(3, (0, common_1.Query)('only_unread')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], CockpitNotificationController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CockpitNotificationController.prototype, "get", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_1.UpdateCockpitNotificationDTO]),
    __metadata("design:returntype", Promise)
], CockpitNotificationController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CockpitNotificationController.prototype, "markRead", null);
__decorate([
    (0, common_1.Patch)(':id/unread'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CockpitNotificationController.prototype, "markUnread", null);
__decorate([
    (0, common_1.Post)('mark-all-read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CockpitNotificationController.prototype, "markAllRead", null);
__decorate([
    (0, common_1.Delete)('clear'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CockpitNotificationController.prototype, "clearAll", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CockpitNotificationController.prototype, "remove", null);
exports.CockpitNotificationController = CockpitNotificationController = __decorate([
    (0, swagger_1.ApiTags)('Cockpit � Notifica��es'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('cockpit/notifications'),
    __metadata("design:paramtypes", [cockpit_notification_service_1.CockpitNotificationService])
], CockpitNotificationController);
