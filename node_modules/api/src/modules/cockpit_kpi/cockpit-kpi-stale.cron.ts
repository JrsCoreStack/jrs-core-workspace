import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CockpitKpiService } from './cockpit_kpi.service';

/** Verifica KPIs sem lançamento no ritmo da frequência e gera notificações (dedup 5 dias). */
@Injectable()
export class CockpitKpiStaleCron {
  private readonly log = new Logger(CockpitKpiStaleCron.name);

  constructor(private readonly kpiService: CockpitKpiService) {}

  /** 08:00 horário do servidor — ajuste TZ do host ou desative e use só POST /cockpit/kpis/stale-check */
  @Cron('0 8 * * *')
  async handleDailyStaleCheck(): Promise<void> {
    try {
      const r = await this.kpiService.runStaleCheckAndNotify();
      if (r.notificationsCreated > 0 || r.staleUpdated > 0) {
        this.log.log(
          `stale-check: scanned=${r.scanned} staleUpdated=${r.staleUpdated} notifications=${r.notificationsCreated}`,
        );
      }
    } catch (e) {
      this.log.warn(`stale-check failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}
