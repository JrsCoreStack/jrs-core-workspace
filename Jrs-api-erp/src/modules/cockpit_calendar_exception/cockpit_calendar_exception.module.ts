import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CockpitCalendarExceptionEntity } from './entities/cockpit_calendar_exception.entity';
import { CockpitCalendarExceptionController } from './cockpit_calendar_exception.controller';
import { CockpitCalendarExceptionService } from './cockpit_calendar_exception.service';

@Module({
  imports: [TypeOrmModule.forFeature([CockpitCalendarExceptionEntity])],
  controllers: [CockpitCalendarExceptionController],
  providers: [CockpitCalendarExceptionService],
  exports: [CockpitCalendarExceptionService],
})
export class CockpitCalendarExceptionModule {}

