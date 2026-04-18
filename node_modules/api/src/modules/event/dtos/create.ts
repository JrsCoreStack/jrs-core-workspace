import { IsDate, IsNumber, IsString, IsUUID } from "class-validator";

export class CreateEventDTO {
  @IsString()
  name: string;
  @IsNumber()
  id_reference: number;
  @IsString()
  @IsUUID()
  account_id: string;  
  @IsDate()
  start_date: Date;
  @IsDate()
  end_date: Date;
  created_at: Date;
  updated_at: Date;
}
