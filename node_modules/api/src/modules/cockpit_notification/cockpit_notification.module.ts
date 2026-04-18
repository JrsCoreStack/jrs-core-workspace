import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CockpitNotificationEntity } from './entities/cockpit_notification.entity';
import { CockpitNotificationController } from './cockpit_notification.controller';
import { CockpitNotificationService } from './cockpit_notification.service';

@Module({
  imports: [TypeOrmModule.forFeature([CockpitNotificationEntity])],
  controllers: [CockpitNotificationController],
  providers: [CockpitNotificationService],
  exports: [CockpitNotificationService],
})
export class CockpitNotificationModule {}

