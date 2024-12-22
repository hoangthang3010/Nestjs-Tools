import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class NotificationService {
    constructor(@InjectQueue('telegram') private telegramQueue: Queue) {}

    async sendMessageToTelegram(text: string, delay = 10_000): Promise<void> {
        await this.telegramQueue.add('send', text, {
            removeOnComplete: true,
            delay,
        });
    }
}
