import { faker } from '@faker-js/faker';
import { Item, Objectif, PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const initiateDb = async () => {
  try {
    const newUser = await db.user.create({
      data: {
        email: 'test@test.fr',
        Authentication: {
          create: {
            password: 'password',
          },
        },
        Account: {
          create: [
            {
              title: 'accountTest',
              description: 'testAccount',
            },
          ],
        },
      },
      include: {
        Account: true,
        Authentication: true,
      },
    });
    return newUser;
  } catch (error) {
    console.error('Error populating the database:', error);
  }
};

export const injectItem = async ({
  accountId,
  userId,
  title,
  description,
  category,
  date,
  value,
  isExpense = true,
}: Partial<Item>) => {
  const item = await db.item.create({
    data: {
      title: title || faker.commerce.productName(),
      description: description || faker.commerce.productDescription(),
      value: value || 30,
      userId,
      accountId,
      category: category || 'Test',
      date: date || new Date(),
      isExpense,
    },
  });
  return item;
};

export const injectObjectif = async ({
  accountId,
  userId,
  title = faker.commerce.productName(),
  description = faker.commerce.productDescription(),
  targetAmount = 100,
  categories = ['Test'],
  type = 'income',
}: Partial<Objectif>) => {
  const objectif = await db.objectif.create({
    data: {
      title,
      description,
      targetAmount,
      userId,
      accountId,
      categories,
      type,
    },
  });
  return objectif;
};

export const generateItems = ({
  userId,
  accountId,
  count = 5,
  onlyExpenses = false,
}: {
  userId: string;
  accountId: string;
  count?: number;
  onlyExpenses?: boolean;
}) => {
  const items = Array.from({ length: count }, () => ({
    userId,
    accountId,
    title: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    value: faker.number.float({ min: 1, max: 1000 }),
    category: 'Test',
    date: new Date(),
    isExpense: onlyExpenses ? true : faker.datatype.boolean(),
  }));
  return items;
};

export const injectItems = async ({
  accountId,
  userId,
  items = [],
}: {
  accountId: string;
  userId: string;
  items?: Partial<Item>[];
}) => {
  const injectedItems = await Promise.all(
    items.map(async item => {
      return await injectItem({ accountId, userId, ...item });
    })
  );
  return injectedItems;
};

export const truncareDb = async () => {
  try {
    await db.item.deleteMany({ where: {} });
    await db.objectif.deleteMany({ where: {} });
    await db.account.deleteMany({ where: {} });
    await db.objectif.deleteMany({ where: {} });
    await db.authentication.deleteMany({ where: {} });
    await db.user.deleteMany({ where: {} });
  } catch (error) {
    console.error('Error truncating the database:', error);
  } finally {
    await db.$disconnect();
  }
};

const injectData = async () => {
  const res = await initiateDb();
  const account = res?.Account[0];

  return {
    id: res?.id,
    account: account,
    users: res,
  };
};
export default injectData;
