"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CockpitReportModule = void 0;
const common_1 = require("@nestjs/common");
const cockpit_report_controller_1 = require("./cockpit_report.controller");
const cockpit_report_service_1 = require("./cockpit_report.service");
const cockpit_kpi_module_1 = require("../cockpit_kpi/cockpit_kpi.module");
const cockpit_ritual_module_1 = require("../cockpit_ritual/cockpit_ritual.module");
const cockpit_meeting_module_1 = require("../cockpit_meeting/cockpit_meeting.module");
const cockpit_action_plan_module_1 = require("../cockpit_action_plan/cockpit_action_plan.module");
let CockpitReportModule = class CockpitReportModule {
};
exports.CockpitReportModule = CockpitReportModule;
exports.CockpitReportModule = CockpitReportModule = __decorate([
    (0, common_1.Module)({
        imports: [cockpit_kpi_module_1.CockpitKpiModule, cockpit_ritual_module_1.CockpitRitualModule, cockpit_meeting_module_1.CockpitMeetingModule, cockpit_action_plan_module_1.CockpitActionPlanModule],
        controllers: [cockpit_report_controller_1.CockpitReportController],
        providers: [cockpit_report_service_1.CockpitReportService],
    })
], CockpitReportModule);
