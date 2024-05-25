import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class ItemService {
  db = new PrismaClient();
  item = this.db.item;

  async upsert(data: Prisma.ItemUpsertArgs) {
    return this.item.upsert(data);
  }

  findAll = async () => {
    return this.item.findMany();
  };

  findAllByAccount = async (where: Prisma.ItemWhereInput) => {
    return this.item.findMany({ where });
  };

  findAllItemCategory = async (accountId: string) => {
    const res: { category: string }[] = await this.db.$queryRawUnsafe(`
    select category
    from "public"."Item"
    where "Item"."accountId" = '${accountId}'
    group By category
    `);

    return res.map((cat) => cat.category);
  };
}
