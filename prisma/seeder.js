import csv from 'csv-parser';
import { createReadStream } from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const seedData = async () => {
  const resultsItems = [];
  const resultsAccount = [];

  // account
  await createReadStream('account_rows.csv', 'utf-8')
    .on('data', (data) => {
      const newData = data.split('\n');
      const other = newData.map((d) => d.split(','));
      const other2 = other
        .map((o, i) => {
          if (i === 0) {
            return `insert into public."Item" (${o.join(',')}) value`;
          }
          return `(${o.map((e) => `'${e}'`)}),`;
        })
        .join('\n');
      resultsAccount.push(other2);
    })
    .on('end', () => {
      // prisma.account.createMany({ data: resultsAccount });
      console.log(resultsAccount);
    });

  // items
  // await createReadStream('item_rows.csv')
  //   .pipe(csv())
  //   .on('data', (data) => resultsItems.push(data))
  //   .on('end', () => {
  //     // prisma.item.createMany({ data: resultsItems });
  //     console.log(resultsItems);
  //   });
};

seedData();
