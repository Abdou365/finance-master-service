import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { Item } from '@prisma/client';
import { Request } from 'express';
import { ResponseInterceptor } from 'src/interceptor/response.interceptor';
import { MESSAGE_SUCCESSFETCH } from 'src/interceptor/response.messages';
import { ItemService } from './item.service';

@Controller('item')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post()
  upsert(@Body() datas: { items: Item[]; count: number }, @Req() req: Request) {
    if (
      (req.signedCookies['user'].role !== 'admin' ||
        req.signedCookies['user'].role !== 'premium') &&
      datas.count > 100
    ) {
      throw new BadRequestException(
        'You have reached the limit of items you can upload',
      );
    }

    const update = datas.items.map(
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

  @UseInterceptors(new ResponseInterceptor(MESSAGE_SUCCESSFETCH))
  @Get('/all/:accountId')
  findByAccount(
    @Param('accountId', ParseUUIDPipe) accountId: string,
    @Req() req: Request,
  ) {
    const { page, limit = 0 } = req.query;

    return this.itemService.findAllByAccount({
      where: { accountId, status: 'published' },
      skip: +page || 0,
      // take: +limit || 0,
      orderBy: { createdAt: 'desc' },
    });
  }
  @Get('/category/:accountId')
  async findItemsCategory(
    @Param('accountId', ParseUUIDPipe) accountId: string,
  ) {
    return await this.itemService.findAllItemCategory(accountId);
  }
}
