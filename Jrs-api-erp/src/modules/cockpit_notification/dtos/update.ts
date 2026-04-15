import { IsBoolean, IsIn, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import type { CockpitNotificationSeverity, CockpitNotificationSource } from '../entities/cockpit_notification.entity';

export class UpdateCockpitNotificationDTO {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsIn(['critical', 'alert', 'info'])
  severity?: CockpitNotificationSeverity;

  @IsOptional()
  @IsIn(['action_plan', 'kpi', 'ritual', 'meeting', 'calendar', 'system'])
  source?: CockpitNotificationSource;

  @IsOptional()
  @IsString()
  link_url?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  link_label?: string | null;

  @IsOptional()
  @IsBoolean()
  is_read?: boolean;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

