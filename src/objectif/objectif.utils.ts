import { Item, Objectif } from '@prisma/client';
import { groupBy, partition, sumBy } from 'lodash';

function calculateProgress(
  currentAmount: number,
  targetAmount: number,
): number {
  let progress = (currentAmount / targetAmount) * 100;
  return progress > 100 ? 100 : progress;
}
export const computeObjectif = (
  objectifs: Objectif[],
  items: Partial<Item>[],
) =>
  objectifs.map((objectif) => {
    const [expense, incomes] = partition(items, (item) => item.isExpense);

    const expenseByCategory = groupBy(expense, 'category');

    if (objectif.type === 'savings') {
      if (objectif.categories.length === 0) {
        if (objectif.from && objectif.to) {
          const currentAmount = sumBy(
            expense.filter(
              (item) => objectif.from <= item.date && objectif.to >= item.date,
            ),
            'value',
          );
          return {
            ...objectif,
            currentAmount,
            progress: calculateProgress(currentAmount, objectif.targetAmount),
          };
        }
        const currentAmount = sumBy(expense, 'value');
        return {
          ...objectif,
          currentAmount,
          progress: calculateProgress(currentAmount, objectif.targetAmount),
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
          progress: calculateProgress(currentAmount, objectif.targetAmount),
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
        progress: calculateProgress(currentAmount, objectif.targetAmount),
      };
    }
    if (objectif.type === 'income') {
      if (objectif.categories.length === 0) {
        if (objectif.from && objectif.to) {
          const currentAmount = sumBy(
            incomes.filter(
              (item) => objectif.from <= item.date && objectif.to >= item.date,
            ),
            'value',
          );
          return {
            ...objectif,
            currentAmount,
            progress: calculateProgress(currentAmount, objectif.targetAmount),
          };
        }
        const currentAmount = sumBy(incomes, 'value');
        return {
          ...objectif,
          currentAmount,
          progress: calculateProgress(currentAmount, objectif.targetAmount),
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
          progress: calculateProgress(currentAmount, objectif.targetAmount),
        };
      }
      const currentAmount = sumBy(
        incomes.filter((item) => objectif.categories.includes(item.category)),
        'value',
      );
      return {
        ...objectif,
        currentAmount,
        progress: calculateProgress(currentAmount, objectif.targetAmount),
      };
    }

    return { ...objectif, currentAmount: 0, progress: 0 };
  });
