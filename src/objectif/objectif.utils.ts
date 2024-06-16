import { Item, Objectif } from '@prisma/client';
import { groupBy, partition, sumBy } from 'lodash';

function calculateProgress(
  currentAmount: number,
  targetAmount: number,
  type?: string,
): number {
  // let progress = (currentAmount / targetAmount) * 100;
  // return progress > 100 ? 100 : progress;

  const progress = (currentAmount / targetAmount) * 100;
  return progress > 100 ? 100 : progress;
}

function getTimeAgo(interval: number, unit: string): number {
  const multiplier = {
    day: 1000 * 60 * 60 * 24,
    week: 1000 * 60 * 60 * 24 * 7,
    month: 1000 * 60 * 60 * 24 * 30,
    year: 1000 * 60 * 60 * 24 * 365,
  }[unit];
  return new Date().valueOf() - multiplier * interval;
}

function filterItemsByDate(
  items: Partial<Item>[],
  from: Date,
  to: Date,
): Partial<Item>[] {
  return items.filter(
    (item) => new Date(item.date) >= from && new Date(item?.date) <= to,
  );
}

function calculateCurrentAmount(
  items: Partial<Item>[],
  categories: string[],
  from?: Date,
  to?: Date,
): number {
  const groupedItems = groupBy(items, 'category');
  const filteredItems =
    categories.length === 0
      ? items
      : categories.map((category) => groupedItems[category]).flat();
  return sumBy(
    filteredItems.filter(
      (item) => !from || !to || (item?.date >= from && item?.date <= to),
    ),
    'value',
  );
}

export const computeObjectif = (
  objectifs: Objectif[],
  items: Partial<Item>[],
) =>
  objectifs.map((objectif) => {
    const {
      recurrence,
      recurrenceInterval = 1,
      type,
      categories,
      from,
      to,
      targetAmount,
      isRecurrent,
    } = objectif;

    const [expense, incomes] = partition(items, (item) => item.isExpense);
    const relevantItems = type === 'savings' ? expense : incomes;

    let currentAmount = 0;

    if (isRecurrent && recurrence && recurrenceInterval > 0) {
      const interval = recurrenceInterval - 1;
      const timeAgo = getTimeAgo(interval, recurrence);
      currentAmount = calculateCurrentAmount(
        relevantItems,
        categories,
        new Date(timeAgo),
        new Date(),
      );
    } else if (from && to) {
      currentAmount = calculateCurrentAmount(
        relevantItems,
        categories,
        from,
        to,
      );
    } else {
      currentAmount = calculateCurrentAmount(relevantItems, categories);
    }

    return {
      ...objectif,
      currentAmount,
      progress: calculateProgress(currentAmount, targetAmount, type),
    };
  });
