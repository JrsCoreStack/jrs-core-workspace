import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CockpitMeetingService } from './cockpit_meeting.service';
import { CreateCockpitMeetingDTO } from './dtos/create';
import { CockpitMeetingEntity } from './entities/cockpit_meeting.entity';

@Controller('cockpit/meetings')
export class CockpitMeetingController {
  constructor(private readonly service: CockpitMeetingService) {}

  @Post()
  create(@Body() body: CreateCockpitMeetingDTO): Promise<CockpitMeetingEntity> {
    return this.service.create(body);
  }

  @Get()
  list(
    @Query('ritualId') ritualId?: string,
    @Query('area') area?: string,
    @Query('occurred_from') occurred_from?: string,
    @Query('occurred_to') occurred_to?: string,
    @Query('q') q?: string,
  ): Promise<CockpitMeetingEntity[]> {
    return this.service.findAll({ ritualId, area, occurred_from, occurred_to, q });
  }

  @Get(':id/diff/:otherId')
  diff(
    @Param('id') id: string,
    @Param('otherId') otherId: string,
  ): ReturnType<CockpitMeetingService['diffMeetings']> {
    return this.service.diffMeetings(id, otherId);
  }

  @Get(':id')
  get(@Param('id') id: string): Promise<CockpitMeetingEntity> {
    return this.service.findById(id);
  }

  @Post(':id/ata')
  attachAta(@Param('id') id: string, @Body() body: any): Promise<CockpitMeetingEntity> {
    return this.service.attachAta(id, body);
  }
}

