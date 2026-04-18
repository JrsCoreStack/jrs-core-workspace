import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { AuthGuard } from '../../guards/auth.guard';
import { CurrentUserId } from '../../decorators/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { CockpitKpiService } from './cockpit_kpi.service';
import { CreateCockpitKpiDTO } from './dtos/create';
import { UpdateCockpitKpiDTO } from './dtos/update';
import { CockpitKpiEntity } from './entities/cockpit_kpi.entity';
import { IsArray, IsNumber, IsOptional, IsString, Matches, MaxLength, validate } from 'class-validator';

@ApiTags('Cockpit – KPIs')
@ApiBearerAuth()
@Controller('cockpit/kpis')
export class CockpitKpiController {
  constructor(private readonly service: CockpitKpiService) {}

  @Post()
  @ApiOperation({ summary: 'Criar KPI' })
  @ApiResponse({ status: 201, description: 'KPI criado com sucesso' })
  create(@Body() body: CreateCockpitKpiDTO): Promise<CockpitKpiEntity> {
    return this.service.create(body);
  }

  @Post('stale-check')
  @ApiOperation({ summary: 'Executar verificação de KPIs desatualizados (stale check)' })
  @ApiResponse({ status: 201, schema: { properties: { scanned: { type: 'number' }, staleUpdated: { type: 'number' }, notificationsCreated: { type: 'number' } } } })
  runStaleCheck(): Promise<{ scanned: number; staleUpdated: number; notificationsCreated: number }> {
    return this.service.runStaleCheckAndNotify();
  }

  @Get()
  @ApiOperation({ summary: 'Listar KPIs' })
  @ApiQuery({ name: 'q', required: false, description: 'Pesquisar por nome' })
  @ApiQuery({ name: 'area', required: false })
  @ApiQuery({ name: 'ritual_id', required: false })
  @ApiQuery({ name: 'meeting_id', required: false })
  @ApiResponse({ status: 200, description: 'Lista de KPIs' })
  list(
    @Query('q') q?: string,
    @Query('area') area?: string,
    @Query('ritual_id') ritual_id?: string,
    @Query('meeting_id') meeting_id?: string,
  ): Promise<any[]> {
    return this.service.findAll({ q, area, ritual_id, meeting_id });
  }

  @Get(':id/results/:resultId/attachment')
  @ApiOperation({ summary: 'Download de evidência do resultado' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'resultId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Arquivo de evidência' })
  async downloadEvidence(
    @Param('id') kpiId: string,
    @Param('resultId') resultId: string,
  ): Promise<StreamableFile> {
    const { stream, fileName, mime } = await this.service.openEvidenceFile(kpiId, resultId);
    return new StreamableFile(stream, {
      type: mime,
      disposition: `attachment; filename="${encodeURIComponent(fileName)}"`,
    });
  }

  @Post(':id/results/:resultId/attachment')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 15 * 1024 * 1024 } }))
  @ApiOperation({ summary: 'Upload de evidência para resultado de KPI' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'resultId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Evidência anexada' })
  async uploadEvidence(
    @Param('id') kpiId: string,
    @Param('resultId') resultId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    if (!file?.buffer?.length) throw new BadRequestException('Arquivo obrigatório.');
    return this.service.attachEvidenceFile(kpiId, resultId, file);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar KPI por ID (detalhe)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Detalhe do KPI' })
  @ApiResponse({ status: 404, description: 'KPI não encontrado' })
  get(@Param('id') id: string): Promise<any> {
    return this.service.findDetailById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar KPI' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'KPI atualizado' })
  update(@Param('id') id: string, @Body() body: UpdateCockpitKpiDTO): Promise<CockpitKpiEntity> {
    return this.service.update(id, body);
  }

  @Delete(':id/results/:resultId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Remover resultado de KPI (soft delete)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'resultId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, schema: { properties: { ok: { type: 'boolean' } } } })
  async removeResult(
    @Param('id') kpiId: string,
    @Param('resultId') resultId: string,
    @CurrentUserId() userId: string,
  ): Promise<{ ok: true }> {
    await this.service.softDeleteResult(kpiId, resultId, userId);
    return { ok: true };
  }

  @Post(':id/results')
  @ApiOperation({ summary: 'Adicionar resultado ao KPI' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['period_label', 'value'],
      properties: {
        period_label: { type: 'string', example: '2024-01' },
        value: { type: 'number', example: 85.5 },
        target: { type: 'number', nullable: true, example: 100 },
        period_start: { type: 'string', example: '2024-01-01', nullable: true },
        evidence_url: { type: 'string', nullable: true },
        evidence_note: { type: 'string', nullable: true },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Resultado adicionado' })
  async addResult(
    @Param('id') id: string,
    @Body()
    body: {
      period_label: string;
      value: number;
      target?: number | null;
      period_start?: string | null;
      evidence_url?: string | null;
      evidence_note?: string | null;
    },
  ): Promise<any> {
    class AddResultDTO {
      @IsString()
      @MaxLength(32)
      period_label: string;

      @IsNumber()
      value: number;

      @IsOptional()
      @IsNumber()
      target?: number | null;

      @IsOptional()
      @IsString()
      @Matches(/^\d{4}-\d{2}-\d{2}$/)
      period_start?: string;

      @IsOptional()
      @IsString()
      @MaxLength(2048)
      evidence_url?: string;

      @IsOptional()
      @IsString()
      @MaxLength(500)
      evidence_note?: string;
    }
    const dto = Object.assign(new AddResultDTO(), body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const msgs = errors.flatMap((e) => Object.values(e.constraints || {}));
      throw new BadRequestException(`Dados inválidos: ${msgs.join(', ')}`);
    }
    return this.service.addResult(id, body);
  }

  @Put(':id/rituals')
  @ApiOperation({ summary: 'Vincular rituais ao KPI' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({ schema: { properties: { ritual_ids: { type: 'array', items: { type: 'string' } } } } })
  @ApiResponse({ status: 200, schema: { properties: { ok: { type: 'boolean' } } } })
  async setRitualLinks(
    @Param('id') id: string,
    @Body() body: { ritual_ids: string[] },
  ): Promise<{ ok: true }> {
    class LinkRitualsDTO {
      @IsArray()
      ritual_ids: string[];
    }
    const dto = Object.assign(new LinkRitualsDTO(), body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const msgs = errors.flatMap((e) => Object.values(e.constraints || {}));
      throw new BadRequestException(`Dados inválidos: ${msgs.join(', ')}`);
    }
    await this.service.linkRituals(id, body.ritual_ids ?? []);
    return { ok: true };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar KPI' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, schema: { properties: { message: { type: 'string' } } } })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.service.delete(id);
    return { message: 'KPI deletado com sucesso' };
  }
}
