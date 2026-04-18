import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateCockpitMeetingDTO {
  @IsOptional()
  @IsString()
  ritual_id?: string | null;

  @IsOptional()
  @IsString()
  occurred_at?: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  duration_min?: number;

  @IsOptional()
  @IsString()
  state?: string;
}

