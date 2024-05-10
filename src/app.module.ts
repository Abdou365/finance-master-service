import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountModule } from './account/account.module';
import { ItemModule } from './item/item.module';

@Module({
  imports: [AccountModule, ItemModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
