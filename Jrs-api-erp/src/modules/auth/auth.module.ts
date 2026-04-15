import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { UserAccountModule } from '../user_account/user_account.module';
import { AccountModule } from '../account/account.module';
import { AuthGuard } from 'src/guards/auth.guard';
import { TwoFactorModule } from '../two_factor/two_factor.module';
import { PermissionModule } from '../permission/permission.module';

@Module({
  imports: [
    forwardRef(() => UserAccountModule),
    AccountModule,
    UserModule,
    TwoFactorModule,
    forwardRef(() => PermissionModule),
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
