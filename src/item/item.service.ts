import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class ItemService {
  constructor(private mail: MailerService) {}
  private readonly db = new PrismaClient();
  item = this.db.item;

  async upsert(data: Prisma.ItemUpsertArgs) {
    return this.item.upsert(data);
  }

  findAll = async () => {
    return this.item.findMany();
  };

  findAllByAccount = async (args: Prisma.ItemFindManyArgs) => {
    const items = await this.item.findMany(args);
    const count = await this.item.count({
      where: { status: 'published', accountId: args.where.accountId },
    });

    return {
      items,
      count,
      pageCount: Math.round(count / (args?.take / 2)) + 1,
    };
  };

  findAllItemCategory = async (accountId: string) => {
    const res: { category: string }[] = await this.db.$queryRawUnsafe(`
    select category
    from "public"."Item"
    where "Item"."accountId" = '${accountId}' and "Item"."status" = 'published'
    group By category
    `);

    return res.map((cat) => cat.category);
  };
}
