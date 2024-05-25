import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { ObjectifService } from 'src/objectif/objectif.service';

@Module({
  controllers: [AccountController],
  providers: [AccountService, ObjectifService],
})
export class AccountModule {}
