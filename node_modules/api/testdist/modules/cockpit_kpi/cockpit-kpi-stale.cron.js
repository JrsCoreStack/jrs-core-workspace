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
var CockpitKpiStaleCron_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CockpitKpiStaleCron = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const cockpit_kpi_service_1 = require("./cockpit_kpi.service");
/** Verifica KPIs sem lançamento no ritmo da frequência e gera notificações (dedup 5 dias). */
let CockpitKpiStaleCron = CockpitKpiStaleCron_1 = class CockpitKpiStaleCron {
    kpiService;
    log = new common_1.Logger(CockpitKpiStaleCron_1.name);
    constructor(kpiService) {
        this.kpiService = kpiService;
    }
    /** 08:00 horário do servidor — ajuste TZ do host ou desative e use só POST /cockpit/kpis/stale-check */
    async handleDailyStaleCheck() {
        try {
            const r = await this.kpiService.runStaleCheckAndNotify();
            if (r.notificationsCreated > 0 || r.staleUpdated > 0) {
                this.log.log(`stale-check: scanned=${r.scanned} staleUpdated=${r.staleUpdated} notifications=${r.notificationsCreated}`);
            }
        }
        catch (e) {
            this.log.warn(`stale-check failed: ${e instanceof Error ? e.message : String(e)}`);
        }
    }
};
exports.CockpitKpiStaleCron = CockpitKpiStaleCron;
__decorate([
    (0, schedule_1.Cron)('0 8 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CockpitKpiStaleCron.prototype, "handleDailyStaleCheck", null);
exports.CockpitKpiStaleCron = CockpitKpiStaleCron = CockpitKpiStaleCron_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cockpit_kpi_service_1.CockpitKpiService])
], CockpitKpiStaleCron);
