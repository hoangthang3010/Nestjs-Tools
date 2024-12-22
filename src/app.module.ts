import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { RedisModule } from './redis/redis.module';
import { VideoUpdateModule } from './video-update/video-update.module';
import { GoogleSheetsModule } from './google-sheets/google-sheets.module';
import { FacebookModule } from './facebook/facebook.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ShopeeAffiliateService } from './shopee-affiliate/shopee-affiliate.service';
import { ShopeeAffiliateController } from './shopee-affiliate/shopee-affiliate.controller';
import { NotificationModule } from './notification/notification.module';

import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // RedisModule,
    FacebookModule,
    GoogleSheetsModule,
    VideoUpdateModule,
    NotificationModule,
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController, ShopeeAffiliateController],
  providers: [AppService, ShopeeAffiliateService],
})
export class AppModule {}

// import { Module } from '@nestjs/common';
// import { ScheduleModule } from '@nestjs/schedule';
// import { ConfigModule } from '@nestjs/config';
// import { FacebookService } from './facebook/facebook.service';
// import { GoogleSheetsService } from './google-sheets/google-sheets.service';
// import { VideoUpdateService } from './video-update/video-update.service';
// import { RedisService } from './redis/redis.service';

// @Module({
//   imports: [ScheduleModule.forRoot(), ConfigModule.forRoot()],
//   providers: [
//     FacebookService,
//     GoogleSheetsService,
//     VideoUpdateService,
//     RedisService,
//   ],
// })
// export class AppModule {}
