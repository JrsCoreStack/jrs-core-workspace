import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCockpitCalendarExceptionDTO {
  @IsOptional()
  @IsString()
  ritual_id?: string | null;

  @IsString()
  occurrence_date: string; // YYYY-MM-DD

  @IsString()
  @MaxLength(32)
  exception_type: string;

  @IsOptional()
  @IsString()
  notes?: string | null;
}

