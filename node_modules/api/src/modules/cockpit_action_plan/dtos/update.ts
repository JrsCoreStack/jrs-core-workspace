import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCockpitActionPlanDTO {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  area?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  owner_name?: string;

  @IsOptional()
  @IsString()
  due_date?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  ritual_id?: string | null;

  @IsOptional()
  @IsString()
  meeting_id?: string | null;

  @IsOptional()
  @IsString()
  depends_on_plan_id?: string | null;
}

