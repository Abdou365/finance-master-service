import { Test, TestingModule } from '@nestjs/testing';
import { ObjectifController } from './objectif.controller';
import { ObjectifService } from './objectif.service';

describe('ObjcetifController', () => {
  let controller: ObjectifController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ObjectifController],
      providers: [ObjectifService],
    }).compile();

    controller = module.get<ObjectifController>(ObjectifController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
