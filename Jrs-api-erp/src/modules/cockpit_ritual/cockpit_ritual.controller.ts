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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { CockpitRitualService } from './cockpit_ritual.service';
import { CreateCockpitRitualDTO } from './dtos/create';
import { UpdateCockpitRitualDTO } from './dtos/update';
import { CockpitRitualEntity } from './entities/cockpit_ritual.entity';
import { IsArray, IsString, validate } from 'class-validator';

@ApiTags('Cockpit – Rituais')
@ApiBearerAuth()
@Controller('cockpit/rituals')
export class CockpitRitualController {
  constructor(private readonly service: CockpitRitualService) {}

  @Post()
  @ApiOperation({ summary: 'Criar ritual de cockpit' })
  @ApiResponse({ status: 201, description: 'Ritual criado com sucesso' })
  create(@Body() body: CreateCockpitRitualDTO): Promise<CockpitRitualEntity> {
    return this.service.create(body);
  }

  @Get('export/ics')
  @Header('Content-Type', 'text/calendar; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="cockpit-rituais.ics"')
  @ApiOperation({ summary: 'Exportar rituais em formato iCal (.ics)' })
  @ApiQuery({ name: 'area', required: false, description: 'Filtrar por área' })
  @ApiResponse({ status: 200, description: 'Arquivo .ics', content: { 'text/calendar': {} } })
  exportIcs(@Query('area') area?: string): Promise<string> {
    return this.service.buildIcsFeed(area);
  }

  @Get()
  @ApiOperation({ summary: 'Listar rituais' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'area', required: false })
  @ApiQuery({ name: 'freq', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'all'] })
  @ApiResponse({ status: 200, description: 'Lista de rituais' })
  findAll(
    @Query('q') q?: string,
    @Query('area') area?: string,
    @Query('freq') freq?: string,
    @Query('status') status?: 'active' | 'inactive' | 'all',
  ): Promise<CockpitRitualEntity[]> {
    return this.service.findAll({ q, area, freq, status });
  }

  @Get(':id/kpis')
  @ApiOperation({ summary: 'KPIs vinculados ao ritual' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, schema: { properties: { kpi_ids: { type: 'array', items: { type: 'string' } } } } })
  async getLinkedKpis(@Param('id') id: string): Promise<{ kpi_ids: string[] }> {
    const kpi_ids = await this.service.findLinkedKpiIds(id);
    return { kpi_ids };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar ritual por ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Ritual encontrado' })
  @ApiResponse({ status: 404, description: 'Ritual não encontrado' })
  findById(@Param('id') id: string): Promise<CockpitRitualEntity> {
    return this.service.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar ritual' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Ritual atualizado' })
  update(@Param('id') id: string, @Body() body: UpdateCockpitRitualDTO): Promise<CockpitRitualEntity> {
    return this.service.update(id, body);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicar ritual' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Ritual duplicado' })
  duplicate(@Param('id') id: string): Promise<CockpitRitualEntity> {
    return this.service.duplicate(id);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Arquivar ritual' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Ritual arquivado' })
  archive(@Param('id') id: string): Promise<CockpitRitualEntity> {
    return this.service.setActive(id, false);
  }

  @Patch(':id/reactivate')
  @ApiOperation({ summary: 'Reativar ritual' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Ritual reativado' })
  reactivate(@Param('id') id: string): Promise<CockpitRitualEntity> {
    return this.service.setActive(id, true);
  }

  @Put(':id/kpis')
  @ApiOperation({ summary: 'Vincular KPIs ao ritual' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({ schema: { properties: { kpi_ids: { type: 'array', items: { type: 'string' } } } } })
  @ApiResponse({ status: 200, schema: { properties: { ok: { type: 'boolean' } } } })
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
