import { Test, TestingModule } from '@nestjs/testing';
import { MockMailerService } from '../test/mock';
import { ItemService } from './item.service';
import { MailerService } from '@nestjs-modules/mailer';

describe('ItemService', () => {
  let service: ItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: MailerService, useClass: MockMailerService },
        ItemService,
      ],
    }).compile();

    service = module.get<ItemService>(ItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
