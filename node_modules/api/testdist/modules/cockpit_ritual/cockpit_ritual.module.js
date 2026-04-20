"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CockpitRitualModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const cockpit_ritual_entity_1 = require("./entities/cockpit_ritual.entity");
const cockpit_ritual_controller_1 = require("./cockpit_ritual.controller");
const cockpit_ritual_service_1 = require("./cockpit_ritual.service");
let CockpitRitualModule = class CockpitRitualModule {
};
exports.CockpitRitualModule = CockpitRitualModule;
exports.CockpitRitualModule = CockpitRitualModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([cockpit_ritual_entity_1.CockpitRitualEntity])],
        controllers: [cockpit_ritual_controller_1.CockpitRitualController],
        providers: [cockpit_ritual_service_1.CockpitRitualService],
        exports: [cockpit_ritual_service_1.CockpitRitualService],
    })
], CockpitRitualModule);
