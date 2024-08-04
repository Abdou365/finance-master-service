import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { Objectif } from '@prisma/client';
import {
  MESSAGE_SUCCESSCREATE,
  MESSAGE_SUCCESSFETCH,
} from '../interceptor/response.messages';
import { ObjectifService } from './objectif.service';
import { ResponseInterceptor } from '../interceptor/response.interceptor';

@Controller('objectif')
export class ObjectifController {
  constructor(private readonly objcetifService: ObjectifService) {}

  @Post()
  @UseInterceptors(new ResponseInterceptor(MESSAGE_SUCCESSCREATE))
  create(
    @Body()
    createObjcetifDto: Objectif
  ) {
    return this.objcetifService.upsert({
      where: { id: createObjcetifDto.id },
      create: createObjcetifDto,
      update: createObjcetifDto,
    });
  }

  @Get('all/:userId/:accountId')
  @UseInterceptors(new ResponseInterceptor(MESSAGE_SUCCESSFETCH))
  async findAll(
    @Param('userId') userId: string,
    @Param('accountId') accountId: string
  ) {
    return await this.objcetifService.findAll({
      userId,
      accountId,
      status: 'active' || 'completed',
    });
  }

  @Post('delete/:userId/:accountId')
  @UseInterceptors(new ResponseInterceptor(MESSAGE_SUCCESSFETCH))
  async bulkDelete(
    @Param('userId') userId: string,
    @Param('accountId') accountId: string
  ) {
    return await this.objcetifService.findAll({
      userId,
      accountId,
      status: 'active' || 'completed',
    });
  }
}
