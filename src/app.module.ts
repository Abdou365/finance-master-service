import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import configuration from 'config/configuration';
import { AccountModule } from './account/account.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { ItemModule } from './item/item.module';
import { NotificationModule } from './notification/notification.module';
import { ObjectifModule } from './objectif/objectif.module';

@Module({
  imports: [
    AccountModule,
    ItemModule,
    ObjectifModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: [`.env.${process.env.NODE_ENV}`],
      expandVariables: true,
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (ConfigService: ConfigService) => {
        return {
          defaults: {
            from: `"No Reply" <${ConfigService.get('mail.user')}>`,
          },
          transport: {
            service: 'gmail',
            host: ConfigService.get('mail.host'),
            port: ConfigService.get('mail.port'),
            requireTLS: true,
            secure: true,
            auth: {
              user: ConfigService.get('mail.user'),
              pass: ConfigService.get('mail.pass'),
            },
          },
        };
      },
    }),
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    JwtService,
    ConfigService,
  ],
})
export class AppModule {}
