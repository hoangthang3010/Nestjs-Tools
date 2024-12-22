import { Test, TestingModule } from '@nestjs/testing';
import { ShopeeAffiliateService } from './shopee-affiliate.service';

describe('ShopeeAffiliateService', () => {
  let service: ShopeeAffiliateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShopeeAffiliateService],
    }).compile();

    service = module.get<ShopeeAffiliateService>(ShopeeAffiliateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
