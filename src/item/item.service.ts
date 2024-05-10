import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class ItemService {
  account = new PrismaClient().item;

  async upsert(data: Prisma.ItemUpsertArgs) {
    return this.account.upsert(data);
  }

  findAll = async () => {
    return this.account.findMany();
  };

  findAllByAccount = async (where: Prisma.ItemWhereInput) => {
    return this.account.findMany({ where });
  };
}
