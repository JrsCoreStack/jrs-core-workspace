import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { CockpitKpiService } from '../cockpit_kpi/cockpit_kpi.service';
import { CockpitRitualService } from '../cockpit_ritual/cockpit_ritual.service';
import { CockpitMeetingService } from '../cockpit_meeting/cockpit_meeting.service';
import { CockpitActionPlanService } from '../cockpit_action_plan/cockpit_action_plan.service';

type PeriodKey = 'week' | 'month' | 'year';

function calendarBounds(periodKey: PeriodKey, ref: Date): { fromIso: string; toIso: string } {
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

@Injectable()
export class CockpitReportService {
  constructor(
    private readonly kpiService: CockpitKpiService,
    private readonly ritualService: CockpitRitualService,
    private readonly meetingService: CockpitMeetingService,
    private readonly actionPlanService: CockpitActionPlanService,
  ) {}

  async buildStrategicPdf(params: { area?: string; period?: string }): Promise<Buffer> {
    const period = (['week', 'month', 'year'].includes(params.period ?? '')
      ? params.period
      : 'month') as PeriodKey;
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
      const doc = new PDFDocument({ size: 'A4', margin: 48 });
      const chunks: Buffer[] = [];
      doc.on('data', (c) => chunks.push(c as Buffer));
      doc.on('error', reject);
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      doc.fontSize(18).text('Cockpit estratégico', { align: 'center' });
      doc.moveDown(0.5);
      doc
        .fontSize(10)
        .fillColor('#444')
        .text(
          `Emitido em ${ref.toLocaleString('pt-BR')} · Período: ${period} · Área: ${area ?? 'Todas'}`,
          { align: 'center' },
        );
      doc.fillColor('#000');
      doc.moveDown(1.2);

      doc.fontSize(13).text('KPIs', { underline: true });
      doc.moveDown(0.3);
      doc.fontSize(9);
      if (!kpis.length) doc.text('Nenhum KPI no escopo.');
      else {
        for (const k of kpis.slice(0, 40)) {
          doc.text(
            `• ${k.name} (${k.area}) — ${k.status} · desvio ${k.deviation_pct?.toFixed?.(1) ?? k.deviation_pct}%`,
          );
        }
        if (kpis.length > 40) doc.text(`… e mais ${kpis.length - 40} KPIs.`);
      }
      doc.moveDown(0.8);

      doc.fontSize(13).text('Rituais ativos', { underline: true });
      doc.moveDown(0.3);
      doc.fontSize(9);
      if (!rituals.length) doc.text('Nenhum ritual.');
      else {
        for (const r of rituals.slice(0, 30)) {
          doc.text(`• ${r.name} — ${r.area} · ${r.freq}`);
        }
      }
      doc.moveDown(0.8);

      doc.fontSize(13).text('Reuniões no período', { underline: true });
      doc.moveDown(0.3);
      doc.fontSize(9);
      if (!meetings.length) doc.text('Nenhuma reunião registrada no intervalo.');
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
      if (!pend.length) doc.text('Nenhum plano pendente listado.');
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
}
