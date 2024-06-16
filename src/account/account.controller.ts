import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { Account } from '@prisma/client';
import { ResponseInterceptor } from 'src/interceptor/response.interceptor';
import { MESSAGE_SUCCESSCREATE } from 'src/interceptor/response.messages';
import { AccountService } from './account.service';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @UseInterceptors(new ResponseInterceptor(MESSAGE_SUCCESSCREATE))
  @Post()
  create(@Body() data: Account) {
    return this.accountService.upsert({
      where: { id: data?.id },
      create: data,
      update: data,
    });
  }

  @Get()
  async findAll() {
    return await this.accountService.findAll();
  }
  @Get('all/:id')
  async findCurrentAll(@Param('id', ParseUUIDPipe) id: string) {
    return await this.accountService.findCurrentAll(id);
  }
  @Get('dashboard/:id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.accountService.findOneById(id);
  }
  @Get('title/:id')
  async findAllCompact(@Param('id', ParseUUIDPipe) id: string) {
    return await this.accountService.findAllTitle(id);
  }
}
