import { Controller, Get, Logger } from '@nestjs/common';
import { GoogleSheetsService } from '../google-sheets/google-sheets.service';
import { NotificationService } from '../notification/notification.service';

@Controller('google-sheet')
export class GoogleSheetsController {
  private readonly logger = new Logger(GoogleSheetsController.name);

  constructor(
    private readonly googleSheetsService: GoogleSheetsService,
    private readonly notificationService: NotificationService,
  ) {}

  @Get('report')
  async getConversionReport() {
    const data = await this.googleSheetsService.getData();
    return data;
  }
  @Get()
  getUsers(): string {
    return 'This action returns all users';
  }
}
