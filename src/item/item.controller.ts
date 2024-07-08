import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseInterceptors
} from '@nestjs/common';
import { Request } from 'express';
import { CreateItemDto } from './dto/create-item.dto';
import { ItemService } from './item.service';
import { ResponseInterceptor } from '../interceptor/response.interceptor';
import { MESSAGE_SUCCESSFETCH } from '../interceptor/response.messages';

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
        'You have reached the limit of items you can upload',
      );
    }

    const update =  body.items.map(
      async (data : any) =>
        await this.itemService.upsert({
          where: { id: data.id },
          create: data,
          update: data,
        }),
    );    

  }

  @Get()
 async findAll() {
    return this.itemService.findAll();
  }

  @UseInterceptors(new ResponseInterceptor(MESSAGE_SUCCESSFETCH))
  @Get('/all/:accountId')
  findByAccount(
    @Param('accountId', ParseUUIDPipe) accountId: string,
    @Req() req: Request,
  ) {
    const { page} = req.query;

    return this.itemService.findAllByAccount({
      where: { accountId, status: 'published' },
      skip: +page || 0,
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
