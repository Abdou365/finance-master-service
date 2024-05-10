import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Account } from '@prisma/client';
import { AccountService } from './account.service';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  create(@Body() data: Account) {
    console.log(data);

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
  @Get('dashboard/:id')
  async findOne(@Param() param: { id: string }) {
    return await this.accountService.findOneById(param.id);
  }
  @Get('title')
  async findAllCompact() {
    return await this.accountService.findAllTitle();
  }
}
