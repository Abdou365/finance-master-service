import { Injectable } from '@nestjs/common';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { Prisma, PrismaClient } from '@prisma/client';
import { log } from 'console';
import { formatDate } from 'date-fns';
import { cp } from 'fs';
import { groupBy, orderBy, partition, sumBy, uniq } from 'lodash';
import { format, sep } from 'path';
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

    log(data);
    return data;
  };

  // La fonction findCurrentAll est une fonction asynchrone qui prend un identifiant d'utilisateur en entrée.
  // Elle exécute une requête SQL brute pour récupérer des informations sur tous les comptes associés à cet utilisateur.

  // La requête SQL fait ce qui suit :
  // 1. Sélectionne les colonnes id, title, description et userId de la table Account.
  // 2. Compte le nombre total d'éléments associés à chaque compte (colonne itemCount).
  // 3. Compte le nombre d'éléments qui sont des dépenses (colonne expenseCount) et ceux qui sont des paiements (colonne paymentCount).
  // 4. Calcule la somme totale des valeurs pour les dépenses (colonne expenseSum) et les paiements (colonne paymentSum).
  // 5. Calcule le solde du compte en soustrayant la somme des dépenses de la somme des paiements (colonne balance).

  // La requête joint la table Account à la table Item sur la colonne accountId, mais seulement pour les éléments dont le statut est 'published'.
  // Enfin, la requête regroupe les résultats par id, title, description et userId de la table Account.

  // La fonction renvoie ensuite les données récupérées.
  /**
   * Retrieves current account information for a given user ID.
   * @param id - The ID of the user.
   * @returns A Promise that resolves to the current account information.
   */
  findCurrentAll = async (id: string) => {
    // Execute a raw SQL query to retrieve account information for the given user ID.
    // Execute a raw SQL query to retrieve account information for the given user ID using Prisma's $queryRaw as a tagged template function.
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
WHERE "Account"."userId" = ${id}
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
      const expenseItems = items?.filter(i => i.isExpense);
      const itemsbyCategory = groupBy(expenseItems, 'category');
      const categories = Object.keys(itemsbyCategory);

      return [...categories].map(value => {
        return { name: value, value: sumBy(itemsbyCategory[value], 'value') };
      });
    };

    const summarize = items => {
      const [decaiss, encaiss] = partition(items, e => e.isExpense);
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
      objectif => objectif.progress === 100
    );

    const dateFilteredData = {
      month: filterByDate({
        name: 'date',
        items: res.Item,
        separateBy: 'month',
        limit: 3,
      }).graph,
      year: filterByDate({
        name: 'date',
        items: res.Item,
        separateBy: 'year',
        limit: 1,
      }).graph,
      day: filterByDate({
        name: 'date',
        items: res.Item,
        separateBy: 'day',
        limit: 7,
      }).graph,
    };

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
      comparison: dateFilteredData,
    };
  };

  findAllTitle = async (id: string) => {
    return this.account.findMany({
      select: { id: true, title: true },
      where: { userId: id },
    });
  };

  /**
   * Deletes an account and its associated items.
   *
   * @param userId - The ID of the user who owns the account.
   * @param id - The ID of the account to be deleted.
   * @returns The deleted account.
   * @throws ExceptionsHandler if an error occurs during deletion.
   */
  delete = async (userId: string, id: string) => {
    try {
      const account = await this.account.delete({
        where: { userId, id },
        include: { Item: true },
      });
      const deletedItems = account.Item;
      const deletedItemsId = deletedItems.map(item => item.id);
      await this.item.deleteMany({ where: { id: { in: deletedItemsId } } });
      return account;
    } catch (error) {
      console.error('Error deleting account:', error);
      throw new ExceptionsHandler(error);
    }
  };
}

const getDateList = ({ limit, separateBy }) => {
  switch (separateBy) {
    case 'year':
      return Array.from({ length: limit || 5 }, (_, i) =>
        formatDate(new Date(new Date().getFullYear() - i, 0, 1), 'yyyy')
      );
    case 'month':
      return Array.from({ length: limit || 5 }, (_, i) =>
        formatDate(
          new Date(new Date().getFullYear(), new Date().getMonth() - i, 1),
          'yyyy-MM'
        )
      );
    case 'day':
      return Array.from({ length: limit || 5 }, (_, i) =>
        formatDate(
          new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate() - i
          ),
          'yyyy-MM-dd'
        )
      );
    default:
      return [];
  }
};

export const filterByDate = ({
  name,
  items,
  separateBy,
  limit,
}: {
  name: string;
  items?: Record<string, any>[];
  separateBy: 'year' | 'month' | 'day';
  limit?: number;
}) => {
  // const dates = uniq(
  //   items?.map(item => {
  //     if (separateBy == 'year') {
  //       return new Date(item[name]).getFullYear().toString();
  //     } else if (separateBy === 'month') {
  //       return `${new Date(item[name]).getFullYear().toString()}-${(
  //         new Date(item[name]!).getMonth() + 1
  //       )
  //         .toString()
  //         .padStart(2, '0')}`;
  //     } else {
  //       const formattedDate = formatDate(new Date(item[name]), 'yyyy-MM-dd');
  //       return formattedDate;
  //     }
  //   })
  // )
  //   .sort((a: any, b: any) => {
  //     return new Date(b).getTime() - new Date(a).getTime();
  //   })
  //   .slice(0, limit || 5);

  const dates = getDateList({ limit, separateBy });
  const output: Record<string, any> = {};
  const formatted: {
    name: string;
    cashing: number;
    payment: number;
    amt: number;
  }[] = [];

  for (const date of dates) {
    const regex = new RegExp(date);
    const filteredItem = items?.filter(i =>
      regex.test(new Date(i[name]).toISOString())
    );
    const [paymentList, cashingList] = partition(filteredItem, 'isExpense');

    const cashing = sumBy(cashingList, 'value');
    const payment = sumBy(paymentList, 'value');
    output[date] = filteredItem;
    formatted.push({ name: date, cashing, payment, amt: 0 });
  }

  return { byKey: output, graph: orderBy(formatted, 'name', 'asc') };
};
