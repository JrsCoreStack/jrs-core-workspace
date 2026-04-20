"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CockpitCalendarExceptionModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const cockpit_calendar_exception_entity_1 = require("./entities/cockpit_calendar_exception.entity");
const cockpit_calendar_exception_controller_1 = require("./cockpit_calendar_exception.controller");
const cockpit_calendar_exception_service_1 = require("./cockpit_calendar_exception.service");
let CockpitCalendarExceptionModule = class CockpitCalendarExceptionModule {
};
exports.CockpitCalendarExceptionModule = CockpitCalendarExceptionModule;
exports.CockpitCalendarExceptionModule = CockpitCalendarExceptionModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([cockpit_calendar_exception_entity_1.CockpitCalendarExceptionEntity])],
        controllers: [cockpit_calendar_exception_controller_1.CockpitCalendarExceptionController],
        providers: [cockpit_calendar_exception_service_1.CockpitCalendarExceptionService],
        exports: [cockpit_calendar_exception_service_1.CockpitCalendarExceptionService],
    })
], CockpitCalendarExceptionModule);
