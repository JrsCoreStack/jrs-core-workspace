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
exports.CockpitReportController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cockpit_report_service_1 = require("./cockpit_report.service");
let CockpitReportController = class CockpitReportController {
    report;
    constructor(report) {
        this.report = report;
    }
    async strategicPdf(area, period) {
        const buf = await this.report.buildStrategicPdf({ area, period });
        return new common_1.StreamableFile(buf, { type: 'application/pdf' });
    }
};
exports.CockpitReportController = CockpitReportController;
__decorate([
    (0, common_1.Get)('estrategico.pdf'),
    (0, common_1.Header)('Content-Disposition', 'attachment; filename="cockpit-estrategico.pdf"'),
    __param(0, (0, common_1.Query)('area')),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CockpitReportController.prototype, "strategicPdf", null);
exports.CockpitReportController = CockpitReportController = __decorate([
    (0, swagger_1.ApiTags)('Cockpit � Relat�rios'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('cockpit/report'),
    __metadata("design:paramtypes", [cockpit_report_service_1.CockpitReportService])
], CockpitReportController);
