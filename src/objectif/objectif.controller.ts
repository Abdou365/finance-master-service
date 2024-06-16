import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { Objectif } from '@prisma/client';
import { ResponseInterceptor } from 'src/interceptor/response.interceptor';
import {
  MESSAGE_SUCCESSCREATE,
  MESSAGE_SUCCESSFETCH,
} from 'src/interceptor/response.messages';
import { UpdateObjcetifDto } from './dto/update-objcetif.dto';
import { ObjectifService } from './objectif.service';

@Controller('objectif')
export class ObjectifController {
  constructor(private readonly objcetifService: ObjectifService) {}

  @Post()
  @UseInterceptors(new ResponseInterceptor(MESSAGE_SUCCESSCREATE))
  create(
    @Body()
    createObjcetifDto: Objectif,
  ) {
    return this.objcetifService.create({
      where: { id: createObjcetifDto.id },
      create: createObjcetifDto,
      update: createObjcetifDto,
    });
  }

  @Get('all/:userId/:accountId')
  @UseInterceptors(new ResponseInterceptor(MESSAGE_SUCCESSFETCH))
  async findAll(
    @Param('userId') userId: string,
    @Param('accountId') accountId: string,
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
    @Param('accountId') accountId: string,
  ) {
    return await this.objcetifService.findAll({
      userId,
      accountId,
      status: 'active' || 'completed',
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.objcetifService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateObjcetifDto: UpdateObjcetifDto,
  ) {
    return this.objcetifService.update(+id, updateObjcetifDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.objcetifService.remove(+id);
  }
}
