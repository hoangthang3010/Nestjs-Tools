import { Injectable } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class TelegramService {
  private readonly bot: any;

  constructor() {
    this.bot = new TelegramBot(process.env['TELEGRAM_TOKEN'] || '');
  }

  sendMessage(message: string) {
    console.log(process.env['TELEGRAM_CHAT_ID']);
    this.bot.sendMessage(process.env['TELEGRAM_CHAT_ID'] || '', message);
  }
}
