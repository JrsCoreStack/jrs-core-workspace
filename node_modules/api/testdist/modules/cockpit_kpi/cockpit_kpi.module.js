"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CockpitKpiModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const cockpit_kpi_entity_1 = require("./entities/cockpit_kpi.entity");
const cockpit_kpi_result_entity_1 = require("./entities/cockpit_kpi_result.entity");
const cockpit_kpi_goal_version_entity_1 = require("./entities/cockpit_kpi_goal_version.entity");
const cockpit_kpi_controller_1 = require("./cockpit_kpi.controller");
const cockpit_kpi_service_1 = require("./cockpit_kpi.service");
const cockpit_kpi_stale_cron_1 = require("./cockpit-kpi-stale.cron");
const cockpit_notification_module_1 = require("../cockpit_notification/cockpit_notification.module");
const user_entity_1 = require("../user/entities/user.entity");
const auth_module_1 = require("../auth/auth.module");
let CockpitKpiModule = class CockpitKpiModule {
};
exports.CockpitKpiModule = CockpitKpiModule;
exports.CockpitKpiModule = CockpitKpiModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([cockpit_kpi_entity_1.CockpitKpiEntity, cockpit_kpi_result_entity_1.CockpitKpiResultEntity, cockpit_kpi_goal_version_entity_1.CockpitKpiGoalVersionEntity, user_entity_1.UserEntity]),
            auth_module_1.AuthModule,
            cockpit_notification_module_1.CockpitNotificationModule,
        ],
        controllers: [cockpit_kpi_controller_1.CockpitKpiController],
        providers: [cockpit_kpi_service_1.CockpitKpiService, cockpit_kpi_stale_cron_1.CockpitKpiStaleCron],
        exports: [cockpit_kpi_service_1.CockpitKpiService],
    })
], CockpitKpiModule);
