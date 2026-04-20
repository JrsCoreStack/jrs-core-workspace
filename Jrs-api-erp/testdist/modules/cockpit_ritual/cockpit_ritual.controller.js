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
exports.CockpitRitualController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cockpit_ritual_service_1 = require("./cockpit_ritual.service");
const create_1 = require("./dtos/create");
const update_1 = require("./dtos/update");
const class_validator_1 = require("class-validator");
let CockpitRitualController = class CockpitRitualController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(body) {
        return this.service.create(body);
    }
    exportIcs(area) {
        return this.service.buildIcsFeed(area);
    }
    findAll(q, area, freq, status) {
        return this.service.findAll({ q, area, freq, status });
    }
    async getLinkedKpis(id) {
        const kpi_ids = await this.service.findLinkedKpiIds(id);
        return { kpi_ids };
    }
    findById(id) {
        return this.service.findById(id);
    }
    update(id, body) {
        return this.service.update(id, body);
    }
    duplicate(id) {
        return this.service.duplicate(id);
    }
    archive(id) {
        return this.service.setActive(id, false);
    }
    reactivate(id) {
        return this.service.setActive(id, true);
    }
    async setKpiLinks(id, body) {
        class LinkKpisDTO {
            kpi_ids;
        }
        __decorate([
            (0, class_validator_1.IsArray)(),
            (0, class_validator_1.IsString)({ each: true }),
            __metadata("design:type", Array)
        ], LinkKpisDTO.prototype, "kpi_ids", void 0);
        const dto = Object.assign(new LinkKpisDTO(), body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            const msgs = errors.flatMap((e) => Object.values(e.constraints || {}));
            throw new common_1.BadRequestException(`Dados inválidos: ${msgs.join(', ')}`);
        }
        await this.service.linkKpis(id, body.kpi_ids ?? []);
        return { ok: true };
    }
};
exports.CockpitRitualController = CockpitRitualController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar ritual de cockpit' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Ritual criado com sucesso' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_1.CreateCockpitRitualDTO]),
    __metadata("design:returntype", Promise)
], CockpitRitualController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('export/ics'),
    (0, common_1.Header)('Content-Type', 'text/calendar; charset=utf-8'),
    (0, common_1.Header)('Content-Disposition', 'attachment; filename="cockpit-rituais.ics"'),
    (0, swagger_1.ApiOperation)({ summary: 'Exportar rituais em formato iCal (.ics)' }),
    (0, swagger_1.ApiQuery)({ name: 'area', required: false, description: 'Filtrar por área' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Arquivo .ics', content: { 'text/calendar': {} } }),
    __param(0, (0, common_1.Query)('area')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CockpitRitualController.prototype, "exportIcs", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar rituais' }),
    (0, swagger_1.ApiQuery)({ name: 'q', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'area', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'freq', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['active', 'inactive', 'all'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de rituais' }),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('area')),
    __param(2, (0, common_1.Query)('freq')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], CockpitRitualController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id/kpis'),
    (0, swagger_1.ApiOperation)({ summary: 'KPIs vinculados ao ritual' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiResponse)({ status: 200, schema: { properties: { kpi_ids: { type: 'array', items: { type: 'string' } } } } }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CockpitRitualController.prototype, "getLinkedKpis", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar ritual por ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ritual encontrado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ritual não encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CockpitRitualController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar ritual' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ritual atualizado' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_1.UpdateCockpitRitualDTO]),
    __metadata("design:returntype", Promise)
], CockpitRitualController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/duplicate'),
    (0, swagger_1.ApiOperation)({ summary: 'Duplicar ritual' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Ritual duplicado' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CockpitRitualController.prototype, "duplicate", null);
__decorate([
    (0, common_1.Patch)(':id/archive'),
    (0, swagger_1.ApiOperation)({ summary: 'Arquivar ritual' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ritual arquivado' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CockpitRitualController.prototype, "archive", null);
__decorate([
    (0, common_1.Patch)(':id/reactivate'),
    (0, swagger_1.ApiOperation)({ summary: 'Reativar ritual' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ritual reativado' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CockpitRitualController.prototype, "reactivate", null);
__decorate([
    (0, common_1.Put)(':id/kpis'),
    (0, swagger_1.ApiOperation)({ summary: 'Vincular KPIs ao ritual' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiBody)({ schema: { properties: { kpi_ids: { type: 'array', items: { type: 'string' } } } } }),
    (0, swagger_1.ApiResponse)({ status: 200, schema: { properties: { ok: { type: 'boolean' } } } }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CockpitRitualController.prototype, "setKpiLinks", null);
exports.CockpitRitualController = CockpitRitualController = __decorate([
    (0, swagger_1.ApiTags)('Cockpit – Rituais'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('cockpit/rituals'),
    __metadata("design:paramtypes", [cockpit_ritual_service_1.CockpitRitualService])
], CockpitRitualController);
