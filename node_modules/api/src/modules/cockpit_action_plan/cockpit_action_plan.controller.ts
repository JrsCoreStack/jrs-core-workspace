import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CockpitActionPlanService } from './cockpit_action_plan.service';
import { CreateCockpitActionPlanDTO } from './dtos/create';
import { UpdateCockpitActionPlanDTO } from './dtos/update';
import { AddCockpitActionPlanCommentDTO } from './dtos/add-comment';
import { CockpitActionPlanEntity } from './entities/cockpit_action_plan.entity';

@ApiTags('Cockpit – Planos de Ação')
@ApiBearerAuth()
@Controller('cockpit/action-plans')
export class CockpitActionPlanController {
  constructor(private readonly service: CockpitActionPlanService) {}

  @Post()
  create(@Body() body: CreateCockpitActionPlanDTO): Promise<CockpitActionPlanEntity> {
    return this.service.create(body);
  }

  @Get('dashboard/summary')
  dashboardSummary(
    @Query('ritual_id') ritual_id?: string,
    @Query('meeting_id') meeting_id?: string,
  ): ReturnType<CockpitActionPlanService['dashboardSummary']> {
    return this.service.dashboardSummary({ ritual_id, meeting_id });
  }

  @Get()
  list(
    @Query('q') q?: string,
    @Query('area') area?: string,
    @Query('status') status?: string,
    @Query('due') due?: 'any' | 'today' | 'overdue',
    @Query('priority') priority?: string,
    @Query('today') todayIso?: string,
    @Query('ritual_id') ritual_id?: string,
    @Query('meeting_id') meeting_id?: string,
  ): Promise<CockpitActionPlanEntity[]> {
    return this.service.findAll({ q, area, status, due, priority, todayIso, ritual_id, meeting_id });
  }

  @Get(':id')
  get(@Param('id') id: string): Promise<CockpitActionPlanEntity> {
    return this.service.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateCockpitActionPlanDTO): Promise<CockpitActionPlanEntity> {
    return this.service.update(id, body);
  }

  @Post(':id/comments')
  addComment(@Param('id') id: string, @Body() body: AddCockpitActionPlanCommentDTO): Promise<CockpitActionPlanEntity> {
    return this.service.addComment(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.service.delete(id);
    return { message: 'Plano de ação deletado com sucesso' };
  }
}

