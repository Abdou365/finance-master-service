const { faker } = require('@faker-js/faker');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const db = new PrismaClient();

const CATEGORIES = [
  'Food',
  'Transport',
  'Entertainment',
  'Utilities',
  'Health',
  'Income',
  'Other',
];

const TITLE_CATEGORY_MAP = {
  // Expense titles
  'Déjeuner au restaurant': 'Food',
  "Achats d'épicerie": 'Food',
  'Café du matin': 'Food',
  'Repas rapide': 'Food',
  'Frais de transport': 'Transport',
  'Carburant pour voiture': 'Transport',
  'Frais de stationnement': 'Transport',
  "Facture d'électricité": 'Utilities',
  'Facture de téléphone': 'Utilities',
  'Abonnement Internet': 'Utilities',
  'Sortie cinéma': 'Entertainment',
  'Achat de vêtements': 'Other',
  'Achat de cadeaux': 'Other',
  'Achat de livres': 'Other',
  'Assurance habitation': 'Utilities',
  'Frais médicaux': 'Health',
  'Frais de santé': 'Health',
  'Consultation médicale': 'Health',
  'Frais de santé mentale': 'Health',
  'Frais de réparation plomberie': 'Utilities',
  'Frais de fournitures de bureau': 'Other',
  'Frais de vacances': 'Entertainment',
  'Frais de réparation de toiture': 'Utilities',
  'Frais de repas en famille': 'Food',
  'Frais de réparation de fenêtre': 'Utilities',
  'Frais de réparation de climatisation': 'Utilities',
  'Frais de repas en entreprise': 'Food',
  // Income titles
  'Salaire mensuel': 'Income',
  'Remboursement de prêt': 'Income',
  'Revenus de location': 'Income',
  "Remboursement d'impôt": 'Income',
  "Vente d'articles en ligne": 'Income',
  "Remboursement d'assurance": 'Income',
  "Prime de fin d'année": 'Income',
  "Dividendes d'actions": 'Income',
  'Remboursement de dépôt de garantie': 'Income',
  'Gain de loterie': 'Income',
  Bonus: 'Income',
  'Remboursement de frais médicaux': 'Income',
  'Remboursement de frais de déplacement': 'Income',
  'Remboursement de frais de repas': 'Income',
  'Remboursement de frais de formation': 'Income',
  'Revenus de partenariat': 'Income',
  'Revenus publicitaires': 'Income',
  'Remboursement de frais de santé': 'Income',
  'Remboursement de frais de voyage': 'Income',
  'Revenus de location de voiture': 'Income',
  'Revenus de location de vacances': 'Income',
  'Remboursement de frais de téléphone': 'Income',
  'Remboursement de frais de carburant': 'Income',
  'Remboursement de frais de loyer': 'Income',
  'Revenus de parrainage': 'Income',
  "Revenus d'affiliation": 'Income',
  'Remboursement de frais bancaires': 'Income',
  'Revenus de cours en ligne': 'Income',
  'Revenus de coaching': 'Income',
  'Revenus de consulting': 'Income',
  'Revenus de vente de formations': 'Income',
  'Revenus de conférences': 'Income',
  'Revenus de sponsoring': 'Income',
  'Revenus de vente de produits numériques': 'Income',
  'Revenus de vente de produits physiques': 'Income',
  'Revenus de vente de services': 'Income',
  'Revenus de vente de livres': 'Income',
  'Revenus de vente de musique': 'Income',
  'Revenus de vente de vêtements': 'Income',
  "Revenus de vente d'accessoires": 'Income',
  'Revenus de vente de bijoux': 'Income',
  "Revenus de vente d'appareils électroniques": 'Income',
  'Revenus de vente de meubles': 'Income',
  'Revenus de vente de gadgets': 'Income',
  "Revenus de vente d'outils": 'Income',
  'Revenus de vente de produits de beauté': 'Income',
  'Revenus de vente de produits de santé': 'Income',
  'Revenus de vente de produits de bien-être': 'Income',
  'Revenus de vente de produits de sport': 'Income',
  'Revenus de vente de produits pour animaux de compagnie': 'Income',
  'Revenus de vente de produits pour bébés': 'Income',
  'Revenus de vente de produits pour enfants': 'Income',
  'Revenus de vente de produits pour adultes': 'Income',
  'Revenus de vente de produits pour seniors': 'Income',
  'Revenus de vente de produits pour hommes': 'Income',
  'Revenus de vente de produits pour femmes': 'Income',
  'Revenus de vente de produits pour couples': 'Income',
  'Revenus de vente de produits pour familles': 'Income',
  'Revenus de vente de produits pour célibataires': 'Income',
  'Revenus de vente de produits pour étudiants': 'Income',
  'Revenus de vente de produits pour professionnels': 'Income',
  'Revenus de vente de produits pour amateurs': 'Income',
  'Revenus de vente de produits pour experts': 'Income',
  'Revenus de vente de produits pour débutants': 'Income',
};

const generateId = () => faker.string.uuid();

const userIds = Array.from({ length: 10 }, generateId);

const generateRandomDate = () =>
  randomDate(
    new Date(new Date().setFullYear(new Date().getFullYear() - 2)),
    new Date(),
  );

const randomDate = (start, end) => {
  const date = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
  return date.toISOString();
};

const randomFutureDate = (start) => {
  const today = new Date(start);
  const futureDate = new Date(
    today.setMonth(today.getMonth() + faker.number.int({ min: 1, max: 12 })),
  );
  return futureDate.toISOString();
};

const encrypt = (data) => {
  const salt = bcrypt.genSaltSync(12);
  return bcrypt.hashSync(data, salt);
};

const createUsers = (id) => {
  return {
    id,
    email: faker.internet.email(),
  };
};

const createAuthentications = (id) => {
  return {
    id,
    password: encrypt('password'),
    userId: id,
  };
};

const createAccounts = (userId) => {
  const numAccounts = faker.number.int({ min: 5, max: 15 });
  return Array.from({ length: numAccounts }, () => ({
    id: faker.string.uuid(),
    createdAt: generateRandomDate(),
    updatedAt: generateRandomDate(),
    title: faker.finance.accountName(),
    description: faker.lorem.paragraph(),
    userId,
    // status: faker.helpers.arrayElement(['published', 'archived', 'deleted']),
  }));
};

const createItems = (accountIds, userId) => {
  const numItems = faker.number.int({ min: 150, max: 1500 });
  return accountIds.flatMap((accountId) =>
    Array.from({ length: numItems }, () => {
      const id = faker.string.uuid();
      const title = faker.helpers.arrayElement(Object.keys(TITLE_CATEGORY_MAP));
      return {
        id: id,
        createdAt: generateRandomDate(),
        updatedAt: generateRandomDate(),
        title: title,
        description: faker.lorem.sentences(2),
        value: faker.number.float({ min: 10, max: 1500, fractionDigits: 2 }),
        category: TITLE_CATEGORY_MAP[title],
        isExpense: TITLE_CATEGORY_MAP[title] !== 'Income',
        date: randomDate(new Date('2022-01-01'), new Date('2024-12-31')),
        accountId,
        userId,
        // status: faker.helpers.arrayElement([
        //   'published',
        //   'archived',
        //   'deleted',
        // ]),
      };
    }),
  );
};

const createObjectives = (accountIds, userId) => {
  return accountIds.flatMap((accountId) =>
    Array.from({ length: faker.number.int({ min: 1, max: 20 }) }, () => ({
      id: faker.string.uuid(),
      createdAt: generateRandomDate(),
      updatedAt: generateRandomDate(),
      title: faker.finance.transactionType(),
      description: faker.lorem.sentences(1),
      from: generateRandomDate(),
      to: randomFutureDate(new Date()),
      deadline: randomFutureDate(new Date()),
      userId,
      targetAmount: faker.number.float({
        min: 10,
        max: 50000,
        fractionDigits: 2,
      }),
      categories: faker.helpers.shuffle(CATEGORIES).slice(0, 3),
      recurrence: faker.helpers.arrayElement([
        null,
        'day',
        'week',
        'month',
        'year',
      ]),
      recurrenceInterval: faker.number.int({ min: 1, max: 12 }),
      isCompleted: faker.datatype.boolean(),
      type: faker.helpers.arrayElement(['savings', 'income']),
      accountId,
    })),
  );
};

const initiateDb = async () => {
  try {
    userIds.map(async (id) => {
      const users = createUsers(id);
      await db.user.createMany({ data: users });

      const authentications = createAuthentications(id);
      await db.authentication.createMany({ data: authentications });

      const accounts = createAccounts(id);
      await db.account.createMany({ data: accounts });
      const accountIds = accounts.map((a) => a.id);

      const items = createItems(accountIds, id);
      await db.item.createMany({ data: items });

      const objectives = createObjectives(accountIds, id);
      await db.objectif.createMany({ data: objectives });
    });
  } catch (error) {
    console.error('Error populating the database:', error);
  } finally {
    await db.$disconnect();
  }
};

initiateDb();
