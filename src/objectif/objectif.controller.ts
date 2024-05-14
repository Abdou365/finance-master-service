import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Objectif } from '@prisma/client';
import { UpdateObjcetifDto } from './dto/update-objcetif.dto';
import { ObjectifService } from './objectif.service';

@Controller('objectif')
export class ObjectifController {
  constructor(private readonly objcetifService: ObjectifService) {}

  @Post()
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
  async findAll(
    @Param('userId') userId: string,
    @Param('accountId') accountId: string,
  ) {
    return await this.objcetifService.findAll({
      userId,
      accountId,
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
