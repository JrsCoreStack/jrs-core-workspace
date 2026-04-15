import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { CockpitNotificationService } from './cockpit_notification.service';
import { CreateCockpitNotificationDTO } from './dtos/create';
import { UpdateCockpitNotificationDTO } from './dtos/update';
import { CockpitNotificationEntity } from './entities/cockpit_notification.entity';

@Controller('cockpit/notifications')
export class CockpitNotificationController {
  constructor(private readonly service: CockpitNotificationService) {}

  @Post()
  create(@Body() body: CreateCockpitNotificationDTO): Promise<CockpitNotificationEntity> {
    return this.service.create(body);
  }

  @Get()
  list(
    @Query('q') q?: string,
    @Query('source') source?: string,
    @Query('severity') severity?: string,
    @Query('only_unread') only_unread?: string,
    @Query('limit') limit?: string,
  ): Promise<CockpitNotificationEntity[]> {
    return this.service.findAll({
      q,
      source,
      severity,
      only_unread: only_unread === 'true' || only_unread === '1',
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get(':id')
  get(@Param('id') id: string): Promise<CockpitNotificationEntity> {
    return this.service.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateCockpitNotificationDTO): Promise<CockpitNotificationEntity> {
    return this.service.update(id, body);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string): Promise<CockpitNotificationEntity> {
    return this.service.setRead(id, true);
  }

  @Patch(':id/unread')
  markUnread(@Param('id') id: string): Promise<CockpitNotificationEntity> {
    return this.service.setRead(id, false);
  }

  @Post('mark-all-read')
  markAllRead(): Promise<{ ok: true; updated: number }> {
    return this.service.markAllAsRead();
  }

  @Delete('clear')
  clearAll(): Promise<{ ok: true; deleted: number }> {
    return this.service.clearAll();
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.service.delete(id);
    return { message: 'Notificação deletada com sucesso' };
  }
}

