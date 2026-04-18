import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccountEntity } from './entities/bank_account.entity';
import { BankAccountController } from './bank_account.controller';
import { BankAccountService } from './bank_account.service';
import { AuthModule } from '../auth/auth.module';
import { AccountModule } from '../account/account.module';

@Module({
  imports: [TypeOrmModule.forFeature([BankAccountEntity]), AccountModule, AuthModule],
  controllers: [BankAccountController],
  providers: [BankAccountService],
  exports: [BankAccountService],
})
export class BankAccountModule {}
