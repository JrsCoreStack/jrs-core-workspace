import { IsEmail, IsEnum, IsString, Validate } from 'class-validator';
import { AccountType } from 'src/utils/enums/account_type.enum';
import { AccountLevel } from 'src/utils/enums/account_level.enum';

export class CreateAccountDTO {
  @IsString()
  name: string;
  @IsString()
  code: string
  @IsEmail(
    {},
    {
      message: 'E-mail inválido',
    },
  )
  email: string;
  @IsEnum(AccountType)
  type: AccountType;
  @IsEnum(AccountLevel)
  level: AccountLevel;
  created_at: Date;
  updated_at: Date;
}
