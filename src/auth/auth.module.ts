import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { jwtExpiresIn, jwtSecrets } from './constants';
import { Encryption } from './encryption.service';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { NotificationService } from 'src/notification/notification.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtSecrets.access_token,
      signOptions: { expiresIn: jwtExpiresIn.acces_token },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    Encryption,
    NotificationService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
