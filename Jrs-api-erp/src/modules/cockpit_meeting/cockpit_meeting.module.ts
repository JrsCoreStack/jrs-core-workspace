import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CockpitMeetingEntity } from './entities/cockpit_meeting.entity';
import { CockpitMeetingController } from './cockpit_meeting.controller';
import { CockpitMeetingService } from './cockpit_meeting.service';

@Module({
  imports: [TypeOrmModule.forFeature([CockpitMeetingEntity])],
  controllers: [CockpitMeetingController],
  providers: [CockpitMeetingService],
  exports: [CockpitMeetingService],
})
export class CockpitMeetingModule {}

