import { Injectable } from '@nestjs/common';
import { Item, Prisma, PrismaClient } from '@prisma/client';
import { groupBy, partition, sum, sumBy } from 'lodash';
import { ObjectifService } from 'src/objectif/objectif.service';
import { computeObjectif } from 'src/objectif/objectif.utils';

@Injectable()
export class AccountService {
  db = new PrismaClient();
  account = this.db.account;
  item = this.db.item;

  upsert = (data: Prisma.AccountUpsertArgs) => {
    return this.account.upsert(data);
  };

  findAll = async () => {
    const data = await this.db.$queryRaw`
SELECT 
    "Account"."id",
    "Account"."title",  -- Include the account name
    "Account"."description",  -- Include the account email
    "Account"."userId",  -- Include the account email
    COUNT("Item"."id")::int AS "itemCount",  -- Count only items that joined successfully
    COUNT(CASE WHEN "isExpense" = true THEN 1 ELSE NULL END)::int AS "expenseCount",
    COUNT(CASE WHEN "isExpense" = false THEN 1 ELSE NULL END)::int AS "paymentCount",
    COALESCE(SUM(CASE WHEN "isExpense" = true THEN "value" ELSE 0 END), 0)::int AS "expenseSum",
    COALESCE(SUM(CASE WHEN "isExpense" = false THEN "value" ELSE 0 END), 0)::int AS "paymentSum",
    (COALESCE(SUM(CASE WHEN "isExpense" = false THEN "value" ELSE 0 END), 0) - 
     COALESCE(SUM(CASE WHEN "isExpense" = true THEN "value" ELSE 0 END), 0))::int AS "balance"
FROM public."Account"
LEFT JOIN public."Item" ON "Account"."id" = "Item"."accountId" AND "Item"."status" = 'published'  
GROUP BY "Account"."id", "Account"."title", "Account"."description", "Account"."userId";
        `;

    return data;
  };

  findOneById = async (id: string) => {
    const res = await this.account.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        userId: true,
        Item: {
          select: {
            id: true,
            title: true,
            date: true,
            value: true,
            isExpense: true,
            category: true,
          },
          where: { status: 'published' },
          orderBy: { date: 'asc' },
        },
        Objectif: {
          where: { status: 'active' || 'completed' },
        },
      },
    });

    const repartition = (items: any[]) => {
      const expenseItems = items?.filter((i) => i.isExpense);
      const itemsbyCategory = groupBy(expenseItems, 'category');
      const categories = Object.keys(itemsbyCategory);

      return [...categories].map((value) => {
        return { name: value, value: sumBy(itemsbyCategory[value], 'value') };
      });
    };

    const summarize = (items) => {
      const [decaiss, encaiss] = partition(items, (e) => e.isExpense);
      const sommeEncaiss = sumBy(encaiss, 'value');
      const sommeDecaiss = sumBy(decaiss, 'value');

      return {
        sumPayment: sommeEncaiss,
        sumExpense: sommeDecaiss,
        balance: sommeEncaiss - sommeDecaiss,
      };
    };

    const objectifs = computeObjectif(res.Objectif, res.Item);
    const [completed, opened] = partition(
      objectifs,
      (objectif) => objectif.progress === 100,
    );

    return {
      ...res,
      expenseRepartition: repartition(res.Item),
      summarize: summarize(res.Item),
      Item: res.Item.slice(0, 5),
      Objectif: {
        completed: completed.length,
        opened: opened.length,
        total: objectifs.length,
        progress: sumBy(objectifs, 'progress') / (objectifs.length || 1),
      },
    };
  };

  findAllTitle = async () => {
    return this.account.findMany({ select: { id: true, title: true } });
  };
}
