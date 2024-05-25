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
import { UpdateObjcetifDto } from './dto/update-objcetif.dto';
import { ObjectifService } from './objectif.service';
import { ResponseInterceptor } from 'src/interceptor/response.interceptor';
import { SUCCESSCREATE, SUCCESSFETCH } from 'src/interceptor/response.messages';

@Controller('objectif')
export class ObjectifController {
  constructor(private readonly objcetifService: ObjectifService) {}

  @Post()
  @UseInterceptors(new ResponseInterceptor(SUCCESSCREATE))
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
  @UseInterceptors(new ResponseInterceptor(SUCCESSFETCH))
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
