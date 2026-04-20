"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatementProducerModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const statement_producer_controller_1 = require("./statement_producer.controller");
const statement_producer_entity_1 = require("./entities/statement_producer.entity");
const statement_producer_service_1 = require("./statement_producer.service");
const auth_module_1 = require("../auth/auth.module");
let StatementProducerModule = class StatementProducerModule {
};
exports.StatementProducerModule = StatementProducerModule;
exports.StatementProducerModule = StatementProducerModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([statement_producer_entity_1.StatementProducerEntity]), auth_module_1.AuthModule],
        controllers: [statement_producer_controller_1.StatementProducerController],
        providers: [statement_producer_service_1.StatementProducerService],
        exports: [statement_producer_service_1.StatementProducerService],
    })
], StatementProducerModule);
