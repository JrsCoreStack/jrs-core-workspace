import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDTO } from './dtos/create';
import { EventEntity } from './entities/event.entity';
import { AuthGuard } from 'src/guards/auth.guard';
import { AccountGuard } from 'src/guards/account.guard';
import { CurrentAccountId } from 'src/decorators/account.decorator';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  async create(@Body() createEvent: CreateEventDTO): Promise<EventEntity> {
    return this.eventService.create(createEvent);
  }

  @UseGuards(AuthGuard, AccountGuard)
  @Get()
  async findAll(
    @CurrentAccountId() account_id: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('event_name') event_name?: string,
  ): Promise<{
    data: EventEntity[];
    total: number;
  }> {
    return this.eventService.findAll(account_id, limit, offset, event_name);
  }
}
