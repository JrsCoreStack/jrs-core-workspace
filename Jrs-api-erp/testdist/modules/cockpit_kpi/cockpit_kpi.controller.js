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
exports.CockpitKpiController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../../guards/auth.guard");
const user_decorator_1 = require("../../decorators/user.decorator");
const platform_express_1 = require("@nestjs/platform-express");
const cockpit_kpi_service_1 = require("./cockpit_kpi.service");
const create_1 = require("./dtos/create");
const update_1 = require("./dtos/update");
const class_validator_1 = require("class-validator");
let CockpitKpiController = class CockpitKpiController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(body) {
        return this.service.create(body);
    }
    runStaleCheck() {
        return this.service.runStaleCheckAndNotify();
    }
    list(q, area, ritual_id, meeting_id) {
        return this.service.findAll({ q, area, ritual_id, meeting_id });
    }
    async downloadEvidence(kpiId, resultId) {
        const { stream, fileName, mime } = await this.service.openEvidenceFile(kpiId, resultId);
        return new common_1.StreamableFile(stream, {
            type: mime,
            disposition: `attachment; filename="${encodeURIComponent(fileName)}"`,
        });
    }
    async uploadEvidence(kpiId, resultId, file) {
        if (!file?.buffer?.length)
            throw new common_1.BadRequestException('Arquivo obrigatório.');
        return this.service.attachEvidenceFile(kpiId, resultId, file);
    }
    get(id) {
        return this.service.findDetailById(id);
    }
    update(id, body) {
        return this.service.update(id, body);
    }
    async removeResult(kpiId, resultId, userId) {
        await this.service.softDeleteResult(kpiId, resultId, userId);
        return { ok: true };
    }
    async addResult(id, body) {
        class AddResultDTO {
            period_label;
            value;
            target;
            period_start;
            evidence_url;
            evidence_note;
        }
        __decorate([
            (0, class_validator_1.IsString)(),
            (0, class_validator_1.MaxLength)(32),
            __metadata("design:type", String)
        ], AddResultDTO.prototype, "period_label", void 0);
        __decorate([
            (0, class_validator_1.IsNumber)(),
            __metadata("design:type", Number)
        ], AddResultDTO.prototype, "value", void 0);
        __decorate([
            (0, class_validator_1.IsOptional)(),
            (0, class_validator_1.IsNumber)(),
            __metadata("design:type", Number)
        ], AddResultDTO.prototype, "target", void 0);
        __decorate([
            (0, class_validator_1.IsOptional)(),
            (0, class_validator_1.IsString)(),
            (0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/),
            __metadata("design:type", String)
        ], AddResultDTO.prototype, "period_start", void 0);
        __decorate([
            (0, class_validator_1.IsOptional)(),
            (0, class_validator_1.IsString)(),
            (0, class_validator_1.MaxLength)(2048),
            __metadata("design:type", String)
        ], AddResultDTO.prototype, "evidence_url", void 0);
        __decorate([
            (0, class_validator_1.IsOptional)(),
            (0, class_validator_1.IsString)(),
            (0, class_validator_1.MaxLength)(500),
            __metadata("design:type", String)
        ], AddResultDTO.prototype, "evidence_note", void 0);
        const dto = Object.assign(new AddResultDTO(), body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            const msgs = errors.flatMap((e) => Object.values(e.constraints || {}));
            throw new common_1.BadRequestException(`Dados inválidos: ${msgs.join(', ')}`);
        }
        return this.service.addResult(id, body);
    }
    async setRitualLinks(id, body) {
        class LinkRitualsDTO {
            ritual_ids;
        }
        __decorate([
            (0, class_validator_1.IsArray)(),
            __metadata("design:type", Array)
        ], LinkRitualsDTO.prototype, "ritual_ids", void 0);
        const dto = Object.assign(new LinkRitualsDTO(), body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            const msgs = errors.flatMap((e) => Object.values(e.constraints || {}));
            throw new common_1.BadRequestException(`Dados inválidos: ${msgs.join(', ')}`);
        }
        await this.service.linkRituals(id, body.ritual_ids ?? []);
        return { ok: true };
    }
    async remove(id) {
        await this.service.delete(id);
        return { message: 'KPI deletado com sucesso' };
    }
};
exports.CockpitKpiController = CockpitKpiController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar KPI' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'KPI criado com sucesso' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_1.CreateCockpitKpiDTO]),
    __metadata("design:returntype", Promise)
], CockpitKpiController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('stale-check'),
    (0, swagger_1.ApiOperation)({ summary: 'Executar verificação de KPIs desatualizados (stale check)' }),
    (0, swagger_1.ApiResponse)({ status: 201, schema: { properties: { scanned: { type: 'number' }, staleUpdated: { type: 'number' }, notificationsCreated: { type: 'number' } } } }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CockpitKpiController.prototype, "runStaleCheck", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar KPIs' }),
    (0, swagger_1.ApiQuery)({ name: 'q', required: false, description: 'Pesquisar por nome' }),
    (0, swagger_1.ApiQuery)({ name: 'area', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'ritual_id', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'meeting_id', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de KPIs' }),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('area')),
    __param(2, (0, common_1.Query)('ritual_id')),
    __param(3, (0, common_1.Query)('meeting_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], CockpitKpiController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id/results/:resultId/attachment'),
    (0, swagger_1.ApiOperation)({ summary: 'Download de evidência do resultado' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiParam)({ name: 'resultId', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Arquivo de evidência' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('resultId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CockpitKpiController.prototype, "downloadEvidence", null);
__decorate([
    (0, common_1.Post)(':id/results/:resultId/attachment'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { limits: { fileSize: 15 * 1024 * 1024 } })),
    (0, swagger_1.ApiOperation)({ summary: 'Upload de evidência para resultado de KPI' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiParam)({ name: 'resultId', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Evidência anexada' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('resultId')),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CockpitKpiController.prototype, "uploadEvidence", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar KPI por ID (detalhe)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Detalhe do KPI' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'KPI não encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CockpitKpiController.prototype, "get", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar KPI' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'KPI atualizado' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_1.UpdateCockpitKpiDTO]),
    __metadata("design:returntype", Promise)
], CockpitKpiController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id/results/:resultId'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Remover resultado de KPI (soft delete)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiParam)({ name: 'resultId', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiResponse)({ status: 200, schema: { properties: { ok: { type: 'boolean' } } } }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('resultId')),
    __param(2, (0, user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CockpitKpiController.prototype, "removeResult", null);
__decorate([
    (0, common_1.Post)(':id/results'),
    (0, swagger_1.ApiOperation)({ summary: 'Adicionar resultado ao KPI' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['period_label', 'value'],
            properties: {
                period_label: { type: 'string', example: '2024-01' },
                value: { type: 'number', example: 85.5 },
                target: { type: 'number', nullable: true, example: 100 },
                period_start: { type: 'string', example: '2024-01-01', nullable: true },
                evidence_url: { type: 'string', nullable: true },
                evidence_note: { type: 'string', nullable: true },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Resultado adicionado' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CockpitKpiController.prototype, "addResult", null);
__decorate([
    (0, common_1.Put)(':id/rituals'),
    (0, swagger_1.ApiOperation)({ summary: 'Vincular rituais ao KPI' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiBody)({ schema: { properties: { ritual_ids: { type: 'array', items: { type: 'string' } } } } }),
    (0, swagger_1.ApiResponse)({ status: 200, schema: { properties: { ok: { type: 'boolean' } } } }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CockpitKpiController.prototype, "setRitualLinks", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Deletar KPI' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiResponse)({ status: 200, schema: { properties: { message: { type: 'string' } } } }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CockpitKpiController.prototype, "remove", null);
exports.CockpitKpiController = CockpitKpiController = __decorate([
    (0, swagger_1.ApiTags)('Cockpit – KPIs'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('cockpit/kpis'),
    __metadata("design:paramtypes", [cockpit_kpi_service_1.CockpitKpiService])
], CockpitKpiController);
