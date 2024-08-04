import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { partition, sum, sumBy } from 'lodash';
import { UpdateObjcetifDto } from './dto/update-objcetif.dto';
import { computeObjectif } from './objectif.utils';

@Injectable()
export class ObjectifService {
  private objeectif = new PrismaClient().objectif;
  private db = new PrismaClient();

  async upsert(upsertData: Prisma.ObjectifUpsertArgs) {
    const res = await this.objeectif.upsert(upsertData);
    return res;
  }

  async findAll(where: Prisma.ObjectifWhereInput) {
    const rawObjectifs = await this.objeectif.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { title: 'asc' }],
    });

    if (rawObjectifs.length === 0) {
      return [];
    }

    const items = await this.db.item.findMany({
      where: { status: 'published', accountId: rawObjectifs[0].accountId },
      select: {
        id: true,
        category: true,
        value: true,
        date: true,
        isExpense: true,
      },
    });

    const objectifs = computeObjectif(rawObjectifs, items);

    const [savings, incomes] = partition(
      objectifs,
      objectif => objectif.type === 'savings'
    );

    const [savingsCompleted, savingsOpened] = partition(
      savings,
      objectif => objectif.progress === 100
    );

    const [incomesCompleted, incomesOpened] = partition(
      incomes,
      objectif => objectif.progress === 100
    );

    return {
      savings,
      incomes,
      summary: {
        objectifs: {
          completed: savingsCompleted.length + incomesCompleted.length,
          opened: savingsOpened.length + incomesOpened.length,
          total: objectifs.length,
          progress: sumBy(objectifs, 'progress') / (objectifs.length || 1),
        },
        savings: {
          completed: savingsCompleted.length,
          opened: savingsOpened.length,
          total: savings.length,
          progress: sumBy(savings, 'progress') / (savings.length || 1),
        },
        incomes: {
          completed: incomesCompleted.length,
          opened: incomesOpened.length,
          total: incomes.length,
          progress: sumBy(incomes, 'progress') / (incomes.length || 1),
        },
      },
    };
  }
}
