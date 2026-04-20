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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CockpitReportService = void 0;
const common_1 = require("@nestjs/common");
const pdfkit_1 = __importDefault(require("pdfkit"));
const cockpit_kpi_service_1 = require("../cockpit_kpi/cockpit_kpi.service");
const cockpit_ritual_service_1 = require("../cockpit_ritual/cockpit_ritual.service");
const cockpit_meeting_service_1 = require("../cockpit_meeting/cockpit_meeting.service");
const cockpit_action_plan_service_1 = require("../cockpit_action_plan/cockpit_action_plan.service");
function calendarBounds(periodKey, ref) {
    if (periodKey === 'week') {
        const start = new Date(ref);
        start.setDate(start.getDate() - 6);
        return {
            fromIso: `${start.toISOString().slice(0, 10)}T00:00:00.000Z`,
            toIso: `${ref.toISOString().slice(0, 10)}T23:59:59.999Z`,
        };
    }
    if (periodKey === 'month') {
        const y = ref.getFullYear();
        const m = ref.getMonth();
        const start = new Date(y, m, 1);
        const end = new Date(y, m + 1, 0);
        return {
            fromIso: `${start.toISOString().slice(0, 10)}T00:00:00.000Z`,
            toIso: `${end.toISOString().slice(0, 10)}T23:59:59.999Z`,
        };
    }
    const y = ref.getFullYear();
    return {
        fromIso: `${y}-01-01T00:00:00.000Z`,
        toIso: `${y}-12-31T23:59:59.999Z`,
    };
}
let CockpitReportService = class CockpitReportService {
    kpiService;
    ritualService;
    meetingService;
    actionPlanService;
    constructor(kpiService, ritualService, meetingService, actionPlanService) {
        this.kpiService = kpiService;
        this.ritualService = ritualService;
        this.meetingService = meetingService;
        this.actionPlanService = actionPlanService;
    }
    async buildStrategicPdf(params) {
        const period = (['week', 'month', 'year'].includes(params.period ?? '')
            ? params.period
            : 'month');
        const area = params.area && params.area !== 'all' && params.area !== 'ALL' ? params.area : undefined;
        const ref = new Date();
        const { fromIso, toIso } = calendarBounds(period, ref);
        const todayIso = ref.toISOString().slice(0, 10);
        const [kpis, rituals, meetings, plans] = await Promise.all([
            this.kpiService.findAll({ area }),
            this.ritualService.findAll({ status: 'active', area }),
            this.meetingService.findAll({ area, occurred_from: fromIso, occurred_to: toIso }),
            this.actionPlanService.findAll({ area, todayIso, due: 'any' }),
        ]);
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({ size: 'A4', margin: 48 });
            const chunks = [];
            doc.on('data', (c) => chunks.push(c));
            doc.on('error', reject);
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.fontSize(18).text('Cockpit estratégico', { align: 'center' });
            doc.moveDown(0.5);
            doc
                .fontSize(10)
                .fillColor('#444')
                .text(`Emitido em ${ref.toLocaleString('pt-BR')} · Período: ${period} · Área: ${area ?? 'Todas'}`, { align: 'center' });
            doc.fillColor('#000');
            doc.moveDown(1.2);
            doc.fontSize(13).text('KPIs', { underline: true });
            doc.moveDown(0.3);
            doc.fontSize(9);
            if (!kpis.length)
                doc.text('Nenhum KPI no escopo.');
            else {
                for (const k of kpis.slice(0, 40)) {
                    doc.text(`• ${k.name} (${k.area}) — ${k.status} · desvio ${k.deviation_pct?.toFixed?.(1) ?? k.deviation_pct}%`);
                }
                if (kpis.length > 40)
                    doc.text(`… e mais ${kpis.length - 40} KPIs.`);
            }
            doc.moveDown(0.8);
            doc.fontSize(13).text('Rituais ativos', { underline: true });
            doc.moveDown(0.3);
            doc.fontSize(9);
            if (!rituals.length)
                doc.text('Nenhum ritual.');
            else {
                for (const r of rituals.slice(0, 30)) {
                    doc.text(`• ${r.name} — ${r.area} · ${r.freq}`);
                }
            }
            doc.moveDown(0.8);
            doc.fontSize(13).text('Reuniões no período', { underline: true });
            doc.moveDown(0.3);
            doc.fontSize(9);
            if (!meetings.length)
                doc.text('Nenhuma reunião registrada no intervalo.');
            else {
                for (const m of meetings.slice(0, 35)) {
                    const d = m.occurred_at ? new Date(m.occurred_at).toISOString().slice(0, 10) : '—';
                    doc.text(`• ${d} — estado ${m.state}`);
                }
            }
            doc.moveDown(0.8);
            const pend = plans.filter((p) => p.status !== 'delivered' && p.status !== 'archived');
            doc.fontSize(13).text('Planos de ação em aberto (escopo)', { underline: true });
            doc.moveDown(0.3);
            doc.fontSize(9);
            if (!pend.length)
                doc.text('Nenhum plano pendente listado.');
            else {
                for (const p of pend.slice(0, 35)) {
                    doc.text(`• ${p.title} — ${p.status} · até ${p.due_date}`);
                }
            }
            doc.moveDown(1);
            doc.fontSize(8).fillColor('#666').text('Documento gerado no servidor · OTicket ERP Cockpit', { align: 'center' });
            doc.end();
        });
    }
};
exports.CockpitReportService = CockpitReportService;
exports.CockpitReportService = CockpitReportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cockpit_kpi_service_1.CockpitKpiService,
        cockpit_ritual_service_1.CockpitRitualService,
        cockpit_meeting_service_1.CockpitMeetingService,
        cockpit_action_plan_service_1.CockpitActionPlanService])
], CockpitReportService);
