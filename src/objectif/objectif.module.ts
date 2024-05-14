import { Module } from '@nestjs/common';
import { ObjectifService } from './objectif.service';
import { ObjectifController } from './objectif.controller';

@Module({
  controllers: [ObjectifController],
  providers: [ObjectifService],
})
export class ObjectifModule {}
