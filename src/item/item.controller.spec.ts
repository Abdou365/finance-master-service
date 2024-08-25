import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MockConfigService, MockMailerService } from '../test/mock';
import setupEnvironment from '../test/setup';
import injectData, { injectItems, truncareDb } from '../test/syncDB';
import { wait } from '../test/test.utils';
import { CreateItemDto } from './dto/create-item.dto';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { da } from '@faker-js/faker';

let accountId;
let userId;

describe('ItemController', () => {
  let controller: ItemController;

  beforeAll(async () => {
    setupEnvironment();
  });

  beforeEach(async () => {
    let sync = await injectData();
    userId = sync?.id;
    accountId = sync.account?.id;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemController],
      providers: [
        ItemService,
        { provide: MailerService, useClass: MockMailerService },
        { provide: ConfigService, useClass: MockConfigService },
      ],
    }).compile();

    controller = module.get<ItemController>(ItemController);
    await wait();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return an array of items', async () => {
    await injectItems({ accountId, userId });
    const result = await controller.findAll();
    expect(result).toHaveLength(1);
  });

  describe('findAll', () => {
    it('should return an array of items', async () => {
      await injectItems({ accountId, userId });
      const result = await controller.findAll();
      expect(result).toHaveLength(1);
    });

    it('should return an array of items by account', async () => {
      await injectItems({ accountId, userId });
      const req: any = {
        query: {
          page: 0,
        },
      };
      const result = await controller.findByAccount(accountId, req);
      expect(result.items).toHaveLength(1);
    });
  });

  describe('upsert', () => {
    it('should create item', async () => {
      const body: any = {
        count: 1,
        items: [
          {
            id: crypto.randomUUID(),
            accountId,
            userId,
            title: 'test',
            description: 'test',
            value: 100,
            status: 'published',
            category: 'Test',
            createdAt: new Date(),
            updatedAt: new Date(),
            date: new Date().toISOString(),
            isExpense: false,
          },
        ],
      };
      const req: any = {
        signedCookies: {
          user: {
            role: 'admin',
          },
        },
      };

      await controller.upsert(body, req);
      await wait();
      const items = await controller.findAll();
      expect(items).toHaveLength(1);
      expect(items[0].title).toBe('test');
    });

    it('should update item', async () => {
      const newItem = await injectItems({ accountId, userId });
      const body: CreateItemDto = {
        count: 1,
        items: [
          {
            id: newItem.id,
            accountId,
            userId,
            title: 'test modified',
            description: 'test modified',
            value: 100,
            status: 'published',
            category: 'Test',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            date: new Date().toISOString(),
            isExpense: false,
          },
        ],
      };
      const req: any = {
        signedCookies: {
          user: {
            role: 'admin',
          },
        },
      };

      await controller.upsert(body, req);
      await wait();
      const items = await controller.findAll();
      expect(items).toHaveLength(1);
      expect(items[0].title).toBe('test modified');
    });
  });

  afterEach(async () => {
    truncareDb();
  });
  afterAll(async () => {
    truncareDb();
  });
});
