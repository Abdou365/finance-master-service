import { Test, TestingModule } from '@nestjs/testing';
import { ObjectifService } from './objectif.service';

describe('ObjcetifService', () => {
  let service: ObjectifService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ObjectifService],
    }).compile();

    service = module.get<ObjectifService>(ObjectifService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
