"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CockpitActionPlanModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const cockpit_action_plan_entity_1 = require("./entities/cockpit_action_plan.entity");
const cockpit_action_plan_controller_1 = require("./cockpit_action_plan.controller");
const cockpit_action_plan_service_1 = require("./cockpit_action_plan.service");
const cockpit_notification_entity_1 = require("../cockpit_notification/entities/cockpit_notification.entity");
let CockpitActionPlanModule = class CockpitActionPlanModule {
};
exports.CockpitActionPlanModule = CockpitActionPlanModule;
exports.CockpitActionPlanModule = CockpitActionPlanModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([cockpit_action_plan_entity_1.CockpitActionPlanEntity, cockpit_notification_entity_1.CockpitNotificationEntity])],
        controllers: [cockpit_action_plan_controller_1.CockpitActionPlanController],
        providers: [cockpit_action_plan_service_1.CockpitActionPlanService],
        exports: [cockpit_action_plan_service_1.CockpitActionPlanService],
    })
], CockpitActionPlanModule);
