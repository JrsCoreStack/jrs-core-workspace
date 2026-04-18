import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { AccountModule } from '../account/account.module';
import { AuthGuard } from 'src/guards/auth.guard';
import { TwoFactorModule } from '../two_factor/two_factor.module';

@Module({
  imports: [
    AccountModule,
    UserModule,
    TwoFactorModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: {
          expiresIn: process.env.JWT_EXPIRATION_TIME,
        },
      }),
    }),
  ],
  providers: [AuthService, AuthGuard],
  controllers: [AuthController],
  exports: [JwtModule, AuthService, AuthGuard],
})
export class AuthModule {}
