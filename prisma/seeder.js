const { faker } = require('@faker-js/faker');
const { PrismaClient } = require('@prisma/client');

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

const EXPENSE_TITLES = Object.keys(TITLE_CATEGORY_MAP).filter(
  (title) => TITLE_CATEGORY_MAP[title] !== 'Income',
);

const INCOME_TITLES = Object.keys(TITLE_CATEGORY_MAP).filter(
  (title) => TITLE_CATEGORY_MAP[title] === 'Income',
);

const createItemsList = (titles, isExpense) => {
  return titles.map((title) => ({
    title,
    description: faker.lorem.paragraph(20),
    isExpense,
    category: TITLE_CATEGORY_MAP[title] || 'Other',
  }));
};

const EXPENSE_ITEMS = createItemsList(EXPENSE_TITLES, true);
const INCOME_ITEMS = createItemsList(INCOME_TITLES, false);

const ALL_ITEMS = [...EXPENSE_ITEMS, ...INCOME_ITEMS];

const userIds = ['373254dc-876a-469a-86e3-57eabeae1f3e'];

const randomDate = (start, end) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
};

const generateItems = (nb, accountIds) => {
  const items = [];
  for (let i = 0; i < nb; i++) {
    const randomItem =
      ALL_ITEMS[faker.number.int({ min: 0, max: ALL_ITEMS.length - 1 })];
    const value = parseFloat(faker.finance.amount({ min: 1, max: 1000 }));
    const date = randomDate(new Date('2022-01-01'), new Date('2024-05-13'));
    const userId =
      userIds[faker.number.int({ min: 0, max: userIds.length - 1 })];
    const accountId =
      accountIds[faker.number.int({ min: 0, max: accountIds.length - 1 })];

    const item = {
      id: faker.string.uuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
      title: randomItem.title,
      description: randomItem.description,
      value: value,
      category: randomItem.category,
      isExpense: randomItem.isExpense,
      date,
      accountId,
      userId,
      status: 'published',
    };

    items.push(item);
  }
  return items;
};

const initiateDb = async () => {
  try {
    const accounts = await db.account.findMany();
    const accountIds = accounts.map((a) => a.id);
    const generatedItems = generateItems(2000, accountIds);

    await db.item.createMany({ data: generatedItems });
    console.log('Database populated successfully');
  } catch (error) {
    console.error('Error populating the database:', error);
  } finally {
    await db.$disconnect();
  }
};

initiateDb();
