import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CockpitKpiEntity } from './entities/cockpit_kpi.entity';
import { CockpitKpiResultEntity } from './entities/cockpit_kpi_result.entity';
import { CockpitKpiGoalVersionEntity } from './entities/cockpit_kpi_goal_version.entity';
import { CockpitKpiController } from './cockpit_kpi.controller';
import { CockpitKpiService } from './cockpit_kpi.service';
import { CockpitKpiStaleCron } from './cockpit-kpi-stale.cron';
import { CockpitNotificationModule } from '../cockpit_notification/cockpit_notification.module';
import { UserEntity } from '../user/entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CockpitKpiEntity, CockpitKpiResultEntity, CockpitKpiGoalVersionEntity, UserEntity]),
    AuthModule,
    CockpitNotificationModule,
  ],
  controllers: [CockpitKpiController],
  providers: [CockpitKpiService, CockpitKpiStaleCron],
  exports: [CockpitKpiService],
})
export class CockpitKpiModule {}

