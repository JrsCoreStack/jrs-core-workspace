import { IsArray, IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import type { CockpitParticipant } from '../entities/cockpit_ritual.entity';

export class UpdateCockpitRitualDTO {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  area?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  freq?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  owner_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  schedule?: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  duration_min?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  kpi_count?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  tracked_sessions?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  total_sessions?: number;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  tracking_label?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  next_label?: string;

  @IsOptional()
  @IsArray()
  participants?: CockpitParticipant[];

  @IsOptional()
  @IsInt()
  @Min(0)
  extra_participants?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsString()
  last_not_tracked_date?: string | null;
}

