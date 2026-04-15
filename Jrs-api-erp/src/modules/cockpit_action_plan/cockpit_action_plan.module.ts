import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CockpitActionPlanEntity } from './entities/cockpit_action_plan.entity';
import { CockpitActionPlanController } from './cockpit_action_plan.controller';
import { CockpitActionPlanService } from './cockpit_action_plan.service';
import { CockpitNotificationEntity } from '../cockpit_notification/entities/cockpit_notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CockpitActionPlanEntity, CockpitNotificationEntity])],
  controllers: [CockpitActionPlanController],
  providers: [CockpitActionPlanService],
  exports: [CockpitActionPlanService],
})
export class CockpitActionPlanModule {}

