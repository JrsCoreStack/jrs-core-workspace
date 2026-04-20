"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CockpitNotificationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const cockpit_notification_entity_1 = require("./entities/cockpit_notification.entity");
const cockpit_notification_controller_1 = require("./cockpit_notification.controller");
const cockpit_notification_service_1 = require("./cockpit_notification.service");
let CockpitNotificationModule = class CockpitNotificationModule {
};
exports.CockpitNotificationModule = CockpitNotificationModule;
exports.CockpitNotificationModule = CockpitNotificationModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([cockpit_notification_entity_1.CockpitNotificationEntity])],
        controllers: [cockpit_notification_controller_1.CockpitNotificationController],
        providers: [cockpit_notification_service_1.CockpitNotificationService],
        exports: [cockpit_notification_service_1.CockpitNotificationService],
    })
], CockpitNotificationModule);
