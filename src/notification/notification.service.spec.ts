import { Test, TestingModule } from '@nestjs/testing';
import { MockMailerService } from '../test/mock';
import { NotificationService } from './notification.service';
import { MailerService } from '@nestjs-modules/mailer';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: MailerService, useClass: MockMailerService },
        NotificationService,
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
