import { Module } from '@nestjs/common';
import { CockpitReportController } from './cockpit_report.controller';
import { CockpitReportService } from './cockpit_report.service';
import { CockpitKpiModule } from '../cockpit_kpi/cockpit_kpi.module';
import { CockpitRitualModule } from '../cockpit_ritual/cockpit_ritual.module';
import { CockpitMeetingModule } from '../cockpit_meeting/cockpit_meeting.module';
import { CockpitActionPlanModule } from '../cockpit_action_plan/cockpit_action_plan.module';

@Module({
  imports: [CockpitKpiModule, CockpitRitualModule, CockpitMeetingModule, CockpitActionPlanModule],
  controllers: [CockpitReportController],
  providers: [CockpitReportService],
})
export class CockpitReportModule {}
