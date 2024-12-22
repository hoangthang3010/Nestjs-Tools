import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import * as crypto from 'crypto';

import { NotificationService } from '../notification/notification.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class ShopeeAffiliateService {
  constructor(
    private readonly redisService: RedisService,
    private readonly notificationService: NotificationService,
  ) {}

  private readonly logger = new Logger(ShopeeAffiliateService.name);

  // Đặt cron job để gọi API mỗi 30 phút
  @Cron(process.env.CRON_SCHEDULE || '*/1 * * * *')
  async handleCron() {
    if (await this.redisService.hasSentMessageToday()) {
      console.log('Hôm nay đã gửi tin nhắn, không gửi nữa.');
      return;
    }

    this.logger.debug(
      'Đang gọi API Shopee Affiliate để lấy báo cáo chuyển đổi',
    );

    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1; // Tháng trong JavaScript bắt đầu từ 0
    const year = currentDate.getFullYear();

    try {
      const response = await this.getConversionReport(day, month, year);
      const responseCalculateTotals = this.calculateTotals(response);
      this.logger.debug(responseCalculateTotals);
      if (!responseCalculateTotals.hasToday) return;
      await this.notificationService.sendMessageToTelegram(
        `Hoa hồng của ngày ${day - 1}/${month}/${year} đã có rồi bạn ơi 😊😊
Tổng hoa hồng ngày hôm nay là: ${this.calculateTotals(
          response,
        ).totalcommissionDay.toLocaleString('vi-VN', {
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
      await this.redisService.markMessageSent();
    } catch (error) {
      this.logger.error('Lỗi khi gọi API Shopee Affiliate:', error.message);
    }
  }

  public async getConversionReport(day: number, month: number, year: number) {
    const appId = process.env.SHOPEE_APP_ID;
    const secret = process.env.SHOPEE_SECRET;
    const timestamp = Math.floor(Date.now() / 1000);
    const path = '/graphql';

    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    const purchaseTimeStart = Math.floor(startOfMonth.getTime() / 1000); // Tính giây bắt đầu tháng
    const purchaseTimeEnd = Math.floor(endOfMonth.getTime() / 1000); // Tính giây kết thúc tháng

    const payload = JSON.stringify({
      query: `{
        conversionReport(
          limit: 1000000,
          purchaseTimeStart: ${purchaseTimeStart || new Date(year, month - 1, day - 1).getTime() / 1000},
          purchaseTimeEnd: ${purchaseTimeEnd || new Date(year, month - 1, day).getTime() / 1000}
        ) {
          nodes {
            purchaseTime
            orders {
              orderId
              orderStatus
              shopType
              items {
                itemId
                itemName
                itemPrice
                itemCommission
                itemSellerCommission
                itemShopeeCommissionCapped
              }
            }
          }
        }
      }`,
    });

    const factor = appId + timestamp.toString() + payload + secret;
    const signature = this.generateSignature(factor);

    const authorizationHeader = `SHA256 Credential=${appId}, Timestamp=${timestamp}, Signature=${signature}`;

    const url = `https://open-api.affiliate.shopee.vn${path}`;

    try {
      const response = await axios.post(url, payload, {
        headers: {
          Authorization: authorizationHeader,
          'Content-Type': 'application/json',
        },
      });
      console.log('73: ', response.data);
      return response.data.data.conversionReport.nodes;
    } catch (error) {
      console.error('Lỗi khi gọi API Shopee Affiliate:', error.message);
      throw error;
    }
  }

  private generateSignature(factor: string): string {
    return crypto.createHash('sha256').update(factor).digest('hex');
  }

  private calculateTotals(data: any[]) {
    let totalShopeeCommissionCappedDay = 0;
    let totalItemPriceDay = 0;
    let totalRecordsDay = 0;
    let totalShopeeCommissionCappedMonth = 0;
    let totalItemPriceMonth = 0;
    let totalRecordsMonth = 0;
    let hasToday;

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate() - 1;

    for (let i = 0; i < data.length; i++) {
      const record = data[i];
      const purchaseDate = new Date(record.purchaseTime * 1000);

      if (
        purchaseDate.getDate() === currentDay &&
        purchaseDate.getMonth() === currentMonth
      ) {
        totalRecordsDay++;
        for (const order of record.orders) {
          for (const item of order.items) {
            totalShopeeCommissionCappedDay +=
              parseFloat(item.itemShopeeCommissionCapped) +
              parseFloat(item.itemSellerCommission);
            totalItemPriceDay += parseFloat(item.itemPrice);
          }
        }
        hasToday = true;
      }

      if (purchaseDate.getMonth() === currentMonth) {
        totalRecordsMonth++;
        for (const order of record.orders) {
          for (const item of order.items) {
            totalShopeeCommissionCappedMonth +=
              parseFloat(item.itemShopeeCommissionCapped) +
              parseFloat(item.itemSellerCommission);
            totalItemPriceMonth += parseFloat(item.itemPrice);
          }
        }
      }
    }

    const totalcommissionDay = totalShopeeCommissionCappedDay; // Calculate total commission for the day
    const totalcommissionMonth = totalShopeeCommissionCappedMonth; // Calculate total commission for the month

    return {
      hasToday,
      totalcommissionDay,
      totalItemPriceDay,
      totalRecordsDay,
      totalcommissionMonth,
      totalItemPriceMonth,
      totalRecordsMonth,
    };
  }
}

//   public async getConversionReport(day: number, month: number, year: number) {
//     const appId = process.env.SHOPEE_APP_ID;
//     const secret = process.env.SHOPEE_SECRET;
//     const timestamp = Math.floor(Date.now() / 1000);
//     const path = '/v2/affiliate/report/get';

//     const payload = JSON.stringify({
//       query: `{conversionReport(purchaseTimeStart: ${timestamp - 3600}, purchaseTimeEnd: ${timestamp}, scrollId: "") {...}}`,
//     });

//     const signatureString = `${appId}${timestamp}${payload}${secret}`;
//     const signature = this.generateSignature(signatureString);

//     const authorizationHeader = `SHA256 Credential=${appId}, Timestamp=${timestamp}, Signature=${signature}`;

//     const params = {
//       app_id: appId,
//       timestamp,
//       sign: signature,
//       date: `${year}-${month}-${day}`,
//     };

//     const url = `https://open-api.affiliate.shopee.vn${path}`;

//     try {
//       const response = await axios.get(url, {
//         params,
//         headers: { Authorization: authorizationHeader },
//       });
//       return response.data;
//     } catch (error) {
//       this.logger.error('Lỗi khi gọi API Shopee Affiliate:', error.message);
//       throw error;
//     }
//   }

//   private generateSignature(baseString: string): string {
//     return crypto.createHash('sha256').update(baseString).digest('hex');
//   }
// }
