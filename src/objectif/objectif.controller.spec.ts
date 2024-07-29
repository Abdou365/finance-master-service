import { Test, TestingModule } from '@nestjs/testing';
import setupEnvironment from '../test/setup';
import injectData, {
  generateItems,
  injectItems,
  injectObjectif,
  truncateDb,
} from '../test/syncDB';
import { ObjectifController } from './objectif.controller';
import { ObjectifService } from './objectif.service';

let userId;
let accountId;

describe('ObjcetifController', () => {
  let controller: ObjectifController;

  beforeAll(async () => {
    setupEnvironment();
  });

  beforeEach(async () => {
    const userAndAccount = await injectData();
    userId = userAndAccount.id;
    accountId = userAndAccount.account.id;

    const items = await injectItems({
      accountId: userAndAccount.account.id,
      userId: userAndAccount.id,
      items: generateItems({
        userId: userAndAccount.id,
        accountId: userAndAccount.account.id,
      }),
    });

    const objectif = await injectObjectif({
      accountId: userAndAccount.account.id,
      userId: userAndAccount.id,
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

    expect(objectifs.objectifs).toHaveLength(1);
  });

  afterEach(async () => {
    await truncateDb();
  });
});
