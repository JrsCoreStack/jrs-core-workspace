import { Module } from '@nestjs/common';
import { TwoFactorController } from './two_factor.controller';
import { TwoFactorService } from './two_factor.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [TwoFactorController],
  providers: [TwoFactorService],
  exports: [TwoFactorService],
})
export class TwoFactorModule {}
