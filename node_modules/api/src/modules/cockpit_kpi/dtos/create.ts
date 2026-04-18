import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCockpitKpiDTO {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @MaxLength(255)
  metric: string;

  @IsString()
  month_goal: string; // aceita string para numeric

  @IsOptional()
  @IsString()
  @MaxLength(32)
  unit?: string;

  @IsString()
  @MaxLength(64)
  area: string;

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

  @IsString()
  @MaxLength(255)
  owner_name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  owner_role?: string | null;

  @IsOptional()
  @IsBoolean()
  is_cockpit?: boolean;

  @IsString()
  annual_goal: string; // aceita string para numeric

  @IsOptional()
  @IsString()
  ritual_id?: string | null;

  @IsOptional()
  @IsString()
  meeting_id?: string | null;

  /** Limite positivo em %: status crítico se desvio &lt; -valor (padrão 15). */
  @IsOptional()
  @IsString()
  critical_deviation_threshold_pct?: string;

  /** Faixa de atenção (≤ crítico): padrão 5. */
  @IsOptional()
  @IsString()
  attention_deviation_threshold_pct?: string;
}

