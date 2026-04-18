import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAccountEntity } from './entities/user_account.entity';
import { UserAccountController } from './user_account.controller';
import { UserAccountService } from './user_account.service';
import { AuthModule } from '../auth/auth.module';
import { RoleEntity } from '../role/entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserAccountEntity, RoleEntity]),
    AuthModule,
  ],
  controllers: [UserAccountController],
  providers: [UserAccountService],
  exports: [UserAccountService],
})
export class UserAccountModule {}
