import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCockpitKpiDTO {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  metric?: string;

  @IsOptional()
  @IsString()
  month_goal?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  unit?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  area?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  code_ref?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  kpi_type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  aggregation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  input_frequency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  owner_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  owner_role?: string | null;

  @IsOptional()
  @IsBoolean()
  is_cockpit?: boolean;

  @IsOptional()
  @IsString()
  annual_goal?: string;

  @IsOptional()
  @IsString()
  ritual_id?: string | null;

  @IsOptional()
  @IsString()
  meeting_id?: string | null;

  @IsOptional()
  @IsString()
  critical_deviation_threshold_pct?: string;

  @IsOptional()
  @IsString()
  attention_deviation_threshold_pct?: string;
}

