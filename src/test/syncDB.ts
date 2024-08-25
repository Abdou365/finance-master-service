import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

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

const injectData = async () => {
  const res = await initiateDb();
  const account = res?.Account[0];

  return {
    id: res?.id,
    account: account,
    users: res,
  };
};

export const injectItems = async ({ accountId, userId }) => {
  const item = await db.item.create({
    data: {
      title: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      value: 30,
      userId,
      accountId,
      date: new Date(),
    },
  });
  return item;
};

export const truncareDb = async () => {
  try {
    await db.item.deleteMany({ where: {} });
    await db.objectif.deleteMany({ where: {} });
    await db.account.deleteMany({ where: {} });
    await db.authentication.deleteMany({ where: {} });
    await db.user.deleteMany({ where: {} });
  } catch (error) {
    console.error('Error truncating the database:', error);
  } finally {
    await db.$disconnect();
  }
};

export default injectData;
