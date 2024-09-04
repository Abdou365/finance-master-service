import { Item, Objectif } from '@prisma/client';
import { computeObjectif, calculateCurrentAmount } from './objectif.utils';
import { faker, ne } from '@faker-js/faker';

const userId = 'userId';
const accountId = 'accountId';

const items: Partial<Item>[] = [
  {
    id: '1',
    accountId: 'accountId',
    userId: 'userId',
    createdAt: new Date(),
    updatedAt: new Date(),
    category: 'category1',
    value: 100,
    date: new Date('2022-01-01'), // 1st January 2022
    isExpense: true,
    status: 'published',
    title: 'Item 1',
    description: '',
  },
  {
    id: '2',
    accountId: 'accountId',
    userId: 'userId',
    createdAt: new Date(),
    updatedAt: new Date(),
    category: 'category2',
    value: 200,
    date: new Date('2022-01-15'), // 15th January 2022
    isExpense: true,
    status: 'published',
    title: 'Item 2',
    description: '',
  },
  {
    id: '3',
    accountId: 'accountId',
    userId: 'userId',
    createdAt: new Date(),
    updatedAt: new Date(),
    category: 'category3',
    value: 300,
    date: new Date('2022-02-01'), // 1st February 2022
    isExpense: false,
    status: 'published',
    title: 'Item 3',
    description: '',
  },
  {
    id: '4',
    accountId,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: 'category3',
    value: 300,
    date: new Date('2022-01-15'), // 15th January 2022
    isExpense: false,
    status: 'published',
    title: 'Item 4',
    description: '',
  },
  {
    id: '5',
    accountId,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: 'category2',
    value: 300,
    date: new Date(new Date().valueOf() + 60 * 1000 * 60 * 24 * 7), // 7 days from now
    isExpense: true,
    status: 'published',
    title: 'Item 5',
    description: '',
  },
  {
    id: '6',
    accountId,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: 'category1',
    value: 300,
    date: new Date(new Date().valueOf() - 60 * 1000 * 60 * 24 * 2), // 2 days ago
    isExpense: true,
    status: 'published',
    title: 'Item 6',
    description: '',
  },
];

const objectifs: Objectif[] = [
  {
    recurrence: null,
    recurrenceInterval: 2,
    type: 'savings',
    categories: ['category1', 'category2'],
    from: new Date('2022-01-01'),
    to: new Date('2022-01-31'),
    targetAmount: 1000,
    isRecurrent: false,
    id: faker.string.uuid(),
    accountId,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    title: faker.lorem.sentence(),
    description: faker.lorem.sentence(),
    deadline: undefined,
    isCompleted: false,
    status: 'active',
  },
  {
    recurrence: null,
    type: 'income',
    from: new Date('2022-01-01'),
    to: new Date('2022-01-31'),
    targetAmount: 1000,
    isRecurrent: false,
    id: faker.string.uuid(),
    accountId,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    title: faker.lorem.sentence(),
    description: faker.lorem.sentence(),
    deadline: undefined,
    isCompleted: false,
    status: 'active',
    recurrenceInterval: null,
    categories: ['category3'],
  },
  {
    recurrence: 'week',
    recurrenceInterval: 1,
    type: 'savings',
    categories: ['category1', 'category2'],
    from: null,
    to: null,
    targetAmount: 1000,
    isRecurrent: true,
    id: faker.string.uuid(),
    accountId,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    title: faker.lorem.sentence(),
    description: faker.lorem.sentence(),
    deadline: undefined,
    isCompleted: false,
    status: 'active',
  },
];

describe('computeObjectif', () => {
  it('should compute savings objectif from 1st January 2022 to 31th January 2022', () => {
    const expectedObjectifs = {
      type: 'savings',
      categories: ['category1', 'category2'],
      from: new Date('2022-01-01'),
      to: new Date('2022-01-31'),
      targetAmount: 1000,
      currentAmount: 300,
      progress: 100,
    };
    const computedObjectifs = computeObjectif(objectifs, items);

    expect(computedObjectifs[0]).toEqual(
      expect.objectContaining(expectedObjectifs)
    );
  });
});

it('should compute income objectif from 1st January 2022 to 31th January 2022', () => {
  const expectedObjectifs = {
    type: 'income',
    categories: ['category3'],
    from: new Date('2022-01-01'),
    to: new Date('2022-01-31'),
    currentAmount: 300,
    progress: 30,
  };
  const computedObjectifs = computeObjectif(objectifs, items);

  expect(computedObjectifs[1]).toEqual(
    expect.objectContaining(expectedObjectifs)
  );
});
