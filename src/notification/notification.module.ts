import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { TelegramService } from '../core/services/telegram/telegram.service';
import { TelegramConsumer } from '../core/jobs/telegram.consumer';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'telegram',
    }),
  ],

  providers: [NotificationService, TelegramService, TelegramConsumer],

  exports: [NotificationService],
})
export class NotificationModule {}
