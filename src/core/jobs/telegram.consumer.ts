import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { TelegramService } from '../services/telegram/telegram.service';

@Processor('telegram')
export class TelegramConsumer {
  constructor(private readonly telegramService: TelegramService) {}

  @Process('send')
  processSend(job: Job) {
    this.telegramService.sendMessage(job.data as string);
  }
}
