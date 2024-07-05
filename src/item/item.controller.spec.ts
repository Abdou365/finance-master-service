import { Test, TestingModule } from '@nestjs/testing';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import  setupEnvironment from "../test/setup"
import { MockConfigService, MockMailerService } from '../test/mock';
import { PrismaClient } from '@prisma/client';
import { CreateItemDto } from './dto/create-item.dto';
import syncDb, { truncareDb } from '../test/syncDB';

const accountId = crypto.randomUUID();
let userId ;



describe('ItemController', () => {
  let controller: ItemController;

  beforeAll(async () => {
    setupEnvironment();
  });
  
  beforeEach(async () => {
        let sync = await syncDb();
    userId = sync.userId;
    console.log(sync.users);
    
    
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemController],
      providers: [
        ItemService,
        { provide: MailerService, useClass: MockMailerService },
        { provide: ConfigService, useClass: MockConfigService }, 
      ],
    }).compile();
    
    controller = module.get<ItemController>(ItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  

  it('should return an array of items', async () => {
    const result = await controller.findAll();    
    console.log(result);
    
  });

  describe("upsert", ()=>{
    it("should create item", async ()=> {
      const body : CreateItemDto = {
        count: 1,
        items: [{
          id: crypto.randomUUID(),
          accountId,
          userId,
          title: "test",
          description: "test",
          value : 100,
          status: "published",
          category: "Test",
          createdAt: new Date(),
          updatedAt: new Date(),
          date: new Date().toISOString(),
          isExpense: false,

        }]
      }
const req : any = {
  signedCookies: {
    user: {
      role: "admin"
    }
  }
}


       await controller.upsert(body, req);
       const items = await controller.findAll();

        expect(items).toEqual([body.items[0]]);      
    })
  })
  

  afterEach(async () => {
    truncareDb();});
});
