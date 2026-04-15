import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Put,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { CockpitRitualService } from './cockpit_ritual.service';
import { CreateCockpitRitualDTO } from './dtos/create';
import { UpdateCockpitRitualDTO } from './dtos/update';
import { CockpitRitualEntity } from './entities/cockpit_ritual.entity';
import { IsArray, IsString, validate } from 'class-validator';

@Controller('cockpit/rituals')
export class CockpitRitualController {
  constructor(private readonly service: CockpitRitualService) {}

  @Post()
  create(@Body() body: CreateCockpitRitualDTO): Promise<CockpitRitualEntity> {
    return this.service.create(body);
  }

  @Get('export/ics')
  @Header('Content-Type', 'text/calendar; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="cockpit-rituais.ics"')
  exportIcs(@Query('area') area?: string): Promise<string> {
    return this.service.buildIcsFeed(area);
  }

  @Get()
  findAll(
    @Query('q') q?: string,
    @Query('area') area?: string,
    @Query('freq') freq?: string,
    @Query('status') status?: 'active' | 'inactive' | 'all',
  ): Promise<CockpitRitualEntity[]> {
    return this.service.findAll({ q, area, freq, status });
  }

  @Get(':id/kpis')
  async getLinkedKpis(@Param('id') id: string): Promise<{ kpi_ids: string[] }> {
    const kpi_ids = await this.service.findLinkedKpiIds(id);
    return { kpi_ids };
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<CockpitRitualEntity> {
    return this.service.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateCockpitRitualDTO): Promise<CockpitRitualEntity> {
    return this.service.update(id, body);
  }

  @Post(':id/duplicate')
  duplicate(@Param('id') id: string): Promise<CockpitRitualEntity> {
    return this.service.duplicate(id);
  }

  @Patch(':id/archive')
  archive(@Param('id') id: string): Promise<CockpitRitualEntity> {
    return this.service.setActive(id, false);
  }

  @Patch(':id/reactivate')
  reactivate(@Param('id') id: string): Promise<CockpitRitualEntity> {
    return this.service.setActive(id, true);
  }

  @Put(':id/kpis')
  async setKpiLinks(
    @Param('id') id: string,
    @Body() body: { kpi_ids: string[] },
  ): Promise<{ ok: true }> {
    class LinkKpisDTO {
      @IsArray()
      @IsString({ each: true })
      kpi_ids: string[];
    }
    const dto = Object.assign(new LinkKpisDTO(), body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const msgs = errors.flatMap((e) => Object.values(e.constraints || {}));
      throw new BadRequestException(`Dados inválidos: ${msgs.join(', ')}`);
    }
    await this.service.linkKpis(id, body.kpi_ids ?? []);
    return { ok: true };
  }
}

