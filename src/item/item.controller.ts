import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Item } from '@prisma/client';
import { ItemService } from './item.service';

@Controller('item')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post()
  upsert(@Body() datas: Item[]) {
    const update = datas.map(
      async (data) =>
        await this.itemService.upsert({
          where: { id: data.id },
          create: data,
          update: data,
        }),
    );

    return update;
  }

  @Get()
  findAll() {
    return this.itemService.findAll();
  }
  @Get('/:accountId')
  findByAccount(@Param() params: { accountId: string }) {
    return this.itemService.findAllByAccount({ accountId: params.accountId });
  }
}
