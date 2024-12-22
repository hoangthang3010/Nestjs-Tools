import { Controller, Get, Logger } from '@nestjs/common';
import { ShopeeAffiliateService } from './shopee-affiliate.service';

@Controller('shopee-affiliate')
export class ShopeeAffiliateController {
  private readonly logger = new Logger(ShopeeAffiliateController.name);

  constructor(
    private readonly shopeeAffiliateService: ShopeeAffiliateService,
  ) {}

  @Get('conversion-report')
  async getConversionReport() {
    this.logger.debug(
      'Đang gọi API Shopee Affiliate để lấy báo cáo chuyển đổi',
    );

    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1; // Tháng trong JavaScript bắt đầu từ 0
    const year = currentDate.getFullYear();

    try {
      const response = await this.shopeeAffiliateService.getConversionReport(
        day,
        month,
        year,
      );
      return response; // Trả về kết quả từ dịch vụ
    } catch (error) {
      this.logger.error('Lỗi khi gọi API Shopee Affiliate:', error.message);
      throw error; // Throw lỗi để controller có thể xử lý
    }
  }
}
