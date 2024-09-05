import { Test, TestingModule } from '@nestjs/testing';
import setupEnvironment from '../test/setup';
import injectData, {
  generateItems,
  injectItems,
  injectObjectif,
  truncareDb,
} from '../test/syncDB';
import { wait } from '../test/test.utils';
import { ObjectifController } from './objectif.controller';
import { ObjectifService } from './objectif.service';

let userId = null;
let accountId = null;

describe('ObjcetifController', () => {
  let controller: ObjectifController;

  beforeAll(async () => {
    setupEnvironment();
  });

  beforeEach(async () => {
    const userAndAccount = await injectData();

    userId = userAndAccount.id;
    accountId = userAndAccount.account?.id;

    await injectItems({
      accountId,
      userId,
      items: generateItems({
        userId,
        accountId,
      }),
    });

    await injectObjectif({
      accountId,
      userId,
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ObjectifController],
      providers: [ObjectifService],
    }).compile();

    controller = module.get<ObjectifController>(ObjectifController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should show all objectifs', async () => {
    const objectifs: any = await controller.findAll(userId, accountId);

    expect(objectifs?.incomes).toHaveLength(1);
    expect(objectifs?.savings).toHaveLength(0);
  });

  afterEach(async () => {
    await truncareDb();
  });
  afterAll(async () => {
    await truncareDb();
  });
});
