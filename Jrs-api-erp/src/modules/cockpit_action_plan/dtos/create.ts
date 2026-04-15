import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCockpitActionPlanDTO {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsString()
  @MaxLength(32)
  status: string;

  @IsString()
  @MaxLength(64)
  area: string;

  @IsString()
  @MaxLength(255)
  owner_name: string;

  @IsString()
  due_date: string; // YYYY-MM-DD

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

