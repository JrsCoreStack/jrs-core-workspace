import { IsString } from 'class-validator';

export class CreateStatementTypeDTO {
  @IsString()
  name: string;
  @IsString()
  description: string;
  created_at: Date;
  updated_at: Date;
}
