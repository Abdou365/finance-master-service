import { MailerService } from '@nestjs-modules/mailer';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MockConfigService, MockMailerService } from '../test/mock';
import setupEnvironment from "../test/setup";
import injectData, { injectItems, truncareDb } from '../test/syncDB';
import { wait } from '../test/test.utils';
import { CreateItemDto } from './dto/create-item.dto';

let accountId;
let userId ;



describe('ItemController', () => {
  let controller: ItemController;

  beforeAll(async () => {
    setupEnvironment();
  });
  
  beforeEach(async () => {
        let sync = await injectData();
        wait();
    userId = sync.id;
    accountId = sync.account.id;
    
    
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
    await injectItems({accountId, userId});
    const result = await controller.findAll();
    expect(result).toHaveLength(1);        
  });

  describe('findAll', ()=>{
    it('should return an array of items', async () => {
      await injectItems({accountId, userId});
      wait()
      const result = await controller.findAll();
      expect(result).toHaveLength(1);        
    });

    it('should return an array of items by account', async () => {
      await injectItems({accountId, userId});
      const req : any = {
        query: {  
          page: 0
        }
      }
      wait()
      const result = await controller.findByAccount(accountId, req);
      expect(result.items).toHaveLength(1);        
    });
  
  })

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
       await  wait() 
       const items = await controller.findAll();        
         expect(items).toHaveLength(1); 
         expect(items[0].title).toBe("test");     
       
           
    })

    it('should update item', async () => {
      const newItem = await injectItems({accountId, userId});
      const body : CreateItemDto = {
        count: 1,
        items: [{
          id: newItem.id,
          accountId,
          userId,
          title: "test modified",
          description: "test modified",
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
      setTimeout(() => {
        expect(items).toHaveLength(1);
        expect(items[0].title).toBe("test modified");
      } , 1000);
  })


  // it(" should fix date format if it's not correct ", async ()=>{
  //   const body : CreateItemDto = {
  //     count: 1,
  //     items: [{
  //       id: crypto.randomUUID(),
  //       accountId,
  //       userId,
  //       title: "test",
  //       description: "test",
  //       value : 100,
  //       status: "published",
  //       category: "Test",
  //       createdAt: new Date(),
  //       updatedAt: new Date(),
  //       date: "2021-12-12",
  //       isExpense: false,

  //     },  {
  //       id: crypto.randomUUID(),
  //       accountId,
  //       userId,
  //       title: "test",
  //       description: "test",
  //       value : 100,
  //       status: "published",
  //       category: "Test",
  //       createdAt: new Date(),
  //       updatedAt: new Date(),
  //       date: "ljlljl",
  //       isExpense: false
  //     }]
  //   }
  //   const req : any = {
  //     signedCookies: {
  //       user: {
  //         role: "admin"
  //       }
  //     }
  //   }

  //   await controller.upsert(body, req);
  //   const items = await controller.findAll();

    
  //   setTimeout(() => {
  //     expect(items).toHaveLength(2);
  //     expect(items[0].date).toBe("2021-12-12T00:00:00.000Z");
  //     expect(items[1].date).toBe("2021-12-12T00:00:00.000Z");
  //   }, 1000);

  // })

  })
  

  afterEach(async () => {
    truncareDb();});
});
