import { Item, Objectif } from '@prisma/client';
import { groupBy, partition, sumBy } from 'lodash';
import * as date from 'date-fns';

const everyMondayOfTheyear = () => {
  const year = new Date().getFullYear();
  const d = new Date(year, 0, 1);
  const days = [];
  while (d.getFullYear() === year) {
    if (d.getDay() === 1) {
      days.push(new Date(d));
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
};

const everyFirstOfTheMonth = () => {
  const year = new Date().getFullYear();
  const days = [];
  for (let i = 0; i < 12; i++) {
    days.push(new Date(year, i, 1));
  }
  return days;
};

const everyFirstOfTheYear = () => {
  const year = new Date().getFullYear();
  return new Date(year, 0, 1);
};

const nextWeek = () => {
  return date.add(new Date(), { weeks: 1 });
};

const nearestMonday = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(now.setDate(diff));
};

const nearestNextWeek = number => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? 1 : 8);
  return new Date(now.setDate(diff + 7 * (number - 1)));
};

export const getCurrentInterval = (recurrence, recurrenceInterval) => {
  const before = [];
  const after = [];

  if (recurrence === 'year') {
    return {
      from: everyFirstOfTheYear(),
      to: nextWeek(),
    };
  }
  const rec = {
    weeks: everyMondayOfTheyear(),
    months: everyFirstOfTheMonth(),
    years: everyFirstOfTheYear(),
    week: everyMondayOfTheyear(),
    month: everyFirstOfTheMonth(),
    year: everyFirstOfTheYear(),
  };

  for (let index = 0; index < rec[recurrence].length; index++) {
    const week = rec[recurrence][index];
    if (index % recurrenceInterval === 0) {
      if (date.isBefore(week, new Date())) {
        before.push(week);
      } else {
        after.push(week);
      }
    }
  }
  return {
    from: before[before.length - 1],
    to: after[0],
  };
};

function calculateProgress(
  currentAmount: number,
  targetAmount: number,
  type?: string
): number {
  const progress = (currentAmount / targetAmount) * 100;
  if (type === 'savings') {
    return currentAmount < targetAmount
      ? 100
      : (targetAmount / currentAmount) * 100;
  }
  return progress > 100 ? 100 : progress;
}

export function calculateCurrentAmount(
  items: Partial<Item>[],
  categories: string[],
  from?: Date,
  to?: Date
): number {
  const groupedItems = groupBy(items, 'category');
  const filteredItems =
    categories.length === 0
      ? items
      : categories.map(category => groupedItems[category]).flat();
  return sumBy(
    filteredItems.filter(
      item => !from || !to || (item?.date >= from && item?.date <= to)
    ),
    'value'
  );
}

/**
 * Computes the objectif for each item in the given array of objectifs.
 *
 * @param objectifs - An array of objectifs.
 * @param items - An array of items.
 * @returns An array of objectifs with updated currentAmount and progress.
 */
export const computeObjectif = (
  objectifs: Objectif[],
  items: Partial<Item>[]
) =>
  // map over each objectif
  objectifs.map(objectif => {
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

    // partition items into expenses and incomes
    const [expense, incomes] = partition(items, item => item.isExpense);
    // get relevant items based on the objectif type
    const relevantItems = type === 'savings' ? expense : incomes;

    let currentAmount = 0;

    if (isRecurrent && recurrence && recurrenceInterval > 0) {
      const { from, to } = getCurrentInterval(recurrence, recurrenceInterval);

      currentAmount = calculateCurrentAmount(
        relevantItems,
        categories,
        from,
        to
      );
    } else if (from && to) {
      currentAmount = calculateCurrentAmount(
        relevantItems,
        categories,
        from,
        to
      );
    } else {
      currentAmount = calculateCurrentAmount(relevantItems, categories);
    }

    return {
      ...objectif,
      currentAmount: +currentAmount,
      progress: calculateProgress(currentAmount, targetAmount, type),
    };
  });
