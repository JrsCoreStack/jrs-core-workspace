"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatementTypeModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("../auth/auth.module");
const statement_type_entity_1 = require("./entities/statement_type.entity");
const statement_type_controller_1 = require("./statement_type.controller");
const statement_type_service_1 = require("./statement_type.service");
let StatementTypeModule = class StatementTypeModule {
};
exports.StatementTypeModule = StatementTypeModule;
exports.StatementTypeModule = StatementTypeModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([statement_type_entity_1.StatementTypeEntity]), auth_module_1.AuthModule],
        controllers: [statement_type_controller_1.StatementTypeController],
        providers: [statement_type_service_1.StatementTypeService],
        exports: [statement_type_service_1.StatementTypeService],
    })
], StatementTypeModule);
