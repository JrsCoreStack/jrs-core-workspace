import { Controller, Get, Header, Query, StreamableFile } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CockpitReportService } from './cockpit_report.service';

@ApiTags('Cockpit – Relatórios')
@ApiBearerAuth()
@Controller('cockpit/report')
export class CockpitReportController {
  constructor(private readonly report: CockpitReportService) {}

  @Get('estrategico.pdf')
  @Header('Content-Disposition', 'attachment; filename="cockpit-estrategico.pdf"')
  async strategicPdf(
    @Query('area') area?: string,
    @Query('period') period?: string,
  ): Promise<StreamableFile> {
    const buf = await this.report.buildStrategicPdf({ area, period });
    return new StreamableFile(buf, { type: 'application/pdf' });
  }
}
