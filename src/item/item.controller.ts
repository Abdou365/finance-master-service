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
import { pick } from 'lodash';
import { ResponseInterceptor } from '../interceptor/response.interceptor';
import { MESSAGE_SUCCESSFETCH } from '../interceptor/response.messages';
import { CreateItemDto } from './dto/create-item.dto';
import { ItemService } from './item.service';

@Controller('item')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post()
  async upsert(@Body() body: CreateItemDto, @Req() req: Request) {
    if (
      (req.signedCookies['user'].role !== 'admin' ||
        req.signedCookies['user'].role !== 'premium') &&
      body.count > 100
    ) {
      throw new BadRequestException(
        'You have reached the limit of items you can upload'
      );
    }

    const update = body.items.map(async (data: any) => {
      const currentItems: Item = pick(
        {
          value: 0,
          isExpense: false,
          status: 'published',
          ...data,
        },
        'accountId',
        'category',
        'createdAt',
        'date',
        'description',
        'id',
        'status',
        'title',
        'updatedAt',
        'userId',
        'value',
        'isExpense'
      );
      return await this.itemService.upsert({
        where: { id: data.id },
        create: currentItems,
        update: currentItems,
      });
    });
  }

  @Get()
  async findAll() {
    return this.itemService.findAll();
  }

  @UseInterceptors(new ResponseInterceptor(MESSAGE_SUCCESSFETCH))
  @Get('/all/:accountId')
  findByAccount(
    @Param('accountId', ParseUUIDPipe) accountId: string,
    @Req() req: Request
  ) {
    const { page } = req.query;

    return this.itemService.findAllByAccount({
      where: { accountId, status: 'published' },
      skip: +page || 0,
      orderBy: { createdAt: 'desc' },
    });
  }
  @Get('/category/:accountId')
  async findItemsCategory(
    @Param('accountId', ParseUUIDPipe) accountId: string
  ) {
    return await this.itemService.findAllItemCategory(accountId);
  }
}
