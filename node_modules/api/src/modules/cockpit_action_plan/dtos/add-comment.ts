import { IsOptional, IsString, MaxLength, IsUUID } from 'class-validator';

export class AddCockpitActionPlanCommentDTO {
  @IsString()
  @MaxLength(4000)
  text: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  by?: string;

  @IsOptional()
  @IsUUID()
  parent_id?: string | null;
}
