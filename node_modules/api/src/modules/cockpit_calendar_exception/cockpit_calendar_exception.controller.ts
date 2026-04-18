import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CockpitCalendarExceptionService } from './cockpit_calendar_exception.service';
import { CreateCockpitCalendarExceptionDTO } from './dtos/create';
import { CockpitCalendarExceptionEntity } from './entities/cockpit_calendar_exception.entity';

@ApiTags('Cockpit ñ Calend·rio')
@ApiBearerAuth()
@Controller('cockpit/calendar/exceptions')
export class CockpitCalendarExceptionController {
  constructor(private readonly service: CockpitCalendarExceptionService) {}

  @Post()
  create(@Body() body: CreateCockpitCalendarExceptionDTO): Promise<CockpitCalendarExceptionEntity> {
    return this.service.create(body);
  }

  @Get()
  list(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('ritual_id') ritual_id?: string,
  ): Promise<CockpitCalendarExceptionEntity[]> {
    return this.service.findAll({ from, to, ritual_id });
  }

  @Get(':id')
  get(@Param('id') id: string): Promise<CockpitCalendarExceptionEntity> {
    return this.service.findById(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: CreateCockpitCalendarExceptionDTO,
  ): Promise<CockpitCalendarExceptionEntity> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.service.delete(id);
    return { message: 'Exce√ß√£o deletada com sucesso' };
  }
}

