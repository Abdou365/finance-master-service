import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { groupBy, partition, sumBy } from 'lodash';
import { UpdateObjcetifDto } from './dto/update-objcetif.dto';

@Injectable()
export class ObjectifService {
  private objeectif = new PrismaClient().objectif;
  private db = new PrismaClient();

  async create(upsertData: Prisma.ObjectifUpsertArgs) {
    const res = await this.objeectif.upsert(upsertData);
    console.log(res);

    return res;
  }

  async findAll(where: Prisma.ObjectifWhereInput) {
    const objectifs = await this.objeectif.findMany({ where });

    if (objectifs.length === 0) {
      return [];
    }

    const items = await this.db.item.findMany({
      where: { status: 'published', accountId: objectifs[0].accountId },
      select: {
        id: true,
        category: true,
        value: true,
        date: true,
        isExpense: true,
      },
    });

    const [expense, incomes] = partition(items, (item) => item.isExpense);

    const expenseByCategory = groupBy(expense, 'category');

    const newObj = objectifs.map((objectif) => {
      if (objectif.type === 'savings') {
        if (objectif.categories.length === 0) {
          if (objectif.from && objectif.to) {
            const currentAmount = sumBy(
              expense.filter(
                (item) =>
                  objectif.from <= item.date && objectif.to >= item.date,
              ),
              'value',
            );
            return {
              ...objectif,
              currentAmount,
              progress: (currentAmount / objectif.targetAmount) * 100,
            };
          }
          const currentAmount = sumBy(expense, 'value');
          return {
            ...objectif,
            currentAmount,
            progress: (currentAmount / objectif.targetAmount) * 100,
          };
        }

        if (objectif.from && objectif.to) {
          const currentAmount = sumBy(
            objectif.categories
              .map((category) => expenseByCategory[category])
              .flat()
              .filter(
                (item) =>
                  objectif.from <= item?.date && objectif.to >= item?.date,
              ),
            'value',
          );
          return {
            ...objectif,
            currentAmount,
            progress: (currentAmount / objectif.targetAmount) * 100,
          };
        }
        const currentAmount = sumBy(
          objectif.categories
            .map((category) => expenseByCategory[category])
            .flat(),
          'value',
        );
        return {
          ...objectif,
          currentAmount,
          progress: (currentAmount / objectif.targetAmount) * 100,
        };
      }
      if (objectif.type === 'income') {
        if (objectif.categories.length === 0) {
          if (objectif.from && objectif.to) {
            const currentAmount = sumBy(
              incomes.filter(
                (item) =>
                  objectif.from <= item.date && objectif.to >= item.date,
              ),
              'value',
            );
            return {
              ...objectif,
              currentAmount,
              progress: (currentAmount / objectif.targetAmount) * 100,
            };
          }
          const currentAmount = sumBy(incomes, 'value');
          return {
            ...objectif,
            currentAmount,
            progress: (currentAmount / objectif.targetAmount) * 100,
          };
        }

        if (objectif.from && objectif.to) {
          const currentAmount = sumBy(
            incomes.filter(
              (item) =>
                objectif.categories.includes(item.category) &&
                objectif.from <= item.date &&
                objectif.to >= item.date,
            ),
            'value',
          );
          return {
            ...objectif,
            currentAmount,
            progress: (currentAmount / objectif.targetAmount) * 100,
          };
        }
        const currentAmount = sumBy(
          incomes.filter((item) => objectif.categories.includes(item.category)),
          'value',
        );
        return {
          ...objectif,
          currentAmount,
          progress: (currentAmount / objectif.targetAmount) * 100,
        };
      }

      return { ...objectif, currentAmount: 0, progress: 0 };
    });

    return newObj;
  }

  findOne(id: number) {
    return `This action returns a #${id} objcetif`;
  }

  update(id: number, updateObjcetifDto: UpdateObjcetifDto) {
    return `This action updates a #${id} objcetif`;
  }

  remove(id: number) {
    return `This action removes a #${id} objcetif`;
  }
}
