import { Controller, Get, Logger } from '@nestjs/common';
import { ShopeeAffiliateService } from './shopee-affiliate.service';
import { GoogleSheetsService } from '../google-sheets/google-sheets.service';
import { NotificationService } from '../notification/notification.service';

@Controller('shopee-affiliate')
export class ShopeeAffiliateController {
  private readonly logger = new Logger(ShopeeAffiliateController.name);

  constructor(
    private readonly shopeeAffiliateService: ShopeeAffiliateService,
    private readonly googleSheetsService: GoogleSheetsService,
    private readonly notificationService: NotificationService,
  ) {}

  @Get('conversion-report')
  async getConversionReport() {
    this.logger.debug(
      'Đang gọi API Shopee Affiliate để lấy báo cáo chuyển đổi',
    );

    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    try {
      const response = await this.shopeeAffiliateService.getConversionReport(
        day,
        month,
        year,
      );
      const responseCalculateTotals =
        this.shopeeAffiliateService.calculateTotals(response);
      this.logger.debug(responseCalculateTotals);
      console.log('test log');

      if (!responseCalculateTotals.hasToday) return;

      if (await this.googleSheetsService.hasSentMessageToday()) {
        console.log('Hôm nay đã gửi tin nhắn, không gửi nữa.');
        return;
      }

      // if (await this.redisService.hasSentMessageToday()) {
      //   console.log('Hôm nay đã gửi tin nhắn, không gửi nữa.');
      //   return;
      // }

      await this.notificationService.sendMessageToTelegram(
        `Hoa hồng của ngày ${day - 1}/${month}/${year} đã có rồi bạn ơi 😊😊
Tổng hoa hồng ngày hôm nay là: ${this.shopeeAffiliateService
          .calculateTotals(response)
          .totalcommissionDay.toLocaleString('vi-VN', {
            style: 'currency',
            currency: 'VND',
          })}
Tổng số đơn hàng ngày hôm nay là: ${responseCalculateTotals.totalRecordsDay} đơn
----------------
Tổng hoa hồng tháng này là: ${responseCalculateTotals.totalcommissionMonth.toLocaleString(
          'vi-VN',
          {
            style: 'currency',
            currency: 'VND',
          },
        )}
        `,
      );
      await this.googleSheetsService.markMessageSent(`${day}/${month}/${year}`);
      // await this.redisService.markMessageSent();
    } catch (error) {
      this.logger.error('Lỗi khi gọi API Shopee Affiliate:', error.message);
    }
  }
  @Get()
  getUsers(): string {
    return 'This action returns all users';
  }
}
