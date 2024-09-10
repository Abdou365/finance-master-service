import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Objectif } from '@prisma/client';
import {
  MESSAGE_SUCCESSCREATE,
  MESSAGE_SUCCESSFETCH,
} from '../interceptor/response.messages';
import { ObjectifService } from './objectif.service';
import { ResponseInterceptor } from '../interceptor/response.interceptor';
import { CreateObjcetifDto } from './dto/create-objcetif.dto';

@Controller('objectif')
export class ObjectifController {
  constructor(private readonly objcetifService: ObjectifService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @UseInterceptors(new ResponseInterceptor(MESSAGE_SUCCESSCREATE))
  create(
    @Body()
    createObjcetifDto: CreateObjcetifDto
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
