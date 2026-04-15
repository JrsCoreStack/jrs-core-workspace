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
import { AuthGuard } from '../../guards/auth.guard';
import { CurrentUserId } from '../../decorators/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { CockpitKpiService } from './cockpit_kpi.service';
import { CreateCockpitKpiDTO } from './dtos/create';
import { UpdateCockpitKpiDTO } from './dtos/update';
import { CockpitKpiEntity } from './entities/cockpit_kpi.entity';
import { IsArray, IsNumber, IsOptional, IsString, Matches, MaxLength, validate } from 'class-validator';

@Controller('cockpit/kpis')
export class CockpitKpiController {
  constructor(private readonly service: CockpitKpiService) {}

  @Post()
  create(@Body() body: CreateCockpitKpiDTO): Promise<CockpitKpiEntity> {
    return this.service.create(body);
  }

  /** Dispara a verificação de stale (mesma lógica do cron diário). Útil para testes ou job externo. */
  @Post('stale-check')
  runStaleCheck(): Promise<{ scanned: number; staleUpdated: number; notificationsCreated: number }> {
    return this.service.runStaleCheckAndNotify();
  }

  @Get()
  list(
    @Query('q') q?: string,
    @Query('area') area?: string,
    @Query('ritual_id') ritual_id?: string,
    @Query('meeting_id') meeting_id?: string,
  ): Promise<any[]> {
    return this.service.findAll({ q, area, ritual_id, meeting_id });
  }

  @Get(':id/results/:resultId/attachment')
  async downloadEvidence(@Param('id') kpiId: string, @Param('resultId') resultId: string): Promise<StreamableFile> {
    const { stream, fileName, mime } = await this.service.openEvidenceFile(kpiId, resultId);
    return new StreamableFile(stream, {
      type: mime,
      disposition: `attachment; filename="${encodeURIComponent(fileName)}"`,
    });
  }

  @Post(':id/results/:resultId/attachment')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 15 * 1024 * 1024 } }))
  async uploadEvidence(
    @Param('id') kpiId: string,
    @Param('resultId') resultId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    if (!file?.buffer?.length) throw new BadRequestException('Arquivo obrigatório.');
    return this.service.attachEvidenceFile(kpiId, resultId, file);
  }

  @Get(':id')
  get(@Param('id') id: string): Promise<any> {
    return this.service.findDetailById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateCockpitKpiDTO): Promise<CockpitKpiEntity> {
    return this.service.update(id, body);
  }

  @Delete(':id/results/:resultId')
  @UseGuards(AuthGuard)
  async removeResult(
    @Param('id') kpiId: string,
    @Param('resultId') resultId: string,
    @CurrentUserId() userId: string,
  ): Promise<{ ok: true }> {
    await this.service.softDeleteResult(kpiId, resultId, userId);
    return { ok: true };
  }

  @Post(':id/results')
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

      /** YYYY-MM-DD — início do período; se omitido, é inferido do period_label */
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
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.service.delete(id);
    return { message: 'KPI deletado com sucesso' };
  }
}

