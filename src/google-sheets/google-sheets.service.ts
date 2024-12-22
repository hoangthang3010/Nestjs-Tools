import { Injectable, OnModuleInit } from '@nestjs/common';
import { google, sheets_v4 } from 'googleapis';

@Injectable()
export class GoogleSheetsService implements OnModuleInit {
  private sheets: sheets_v4.Sheets;

  async initialize() {
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      credentials: {
        type: 'service_account',
        project_id: 'crafty-clover-279805',
        private_key_id: process.env.GOOGLE_SHEET_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_SHEET_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: 'hoangthang@crafty-clover-279805.iam.gserviceaccount.com',
        client_id: '105383820069747456819',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url:
          'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url:
          'https://www.googleapis.com/robot/v1/metadata/x509/hoangthang%40crafty-clover-279805.iam.gserviceaccount.com',
        universe_domain: 'googleapis.com',
      } as any,
    });

    // Lấy client xác thực
    const authClientObject = await auth.getClient();

    // Khởi tạo Google Sheets API client
    this.sheets = google.sheets({
      version: 'v4',
      auth: authClientObject as any,
    });
  }

  async updateSheet(data: any[][]): Promise<void> {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = 'video';

    if (!this.sheets) {
      console.error('Google Sheets client is not initialized.');
      return;
    }

    try {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: {
          values: data,
        },
      });
      console.log('Google Sheet updated successfully');
    } catch (error) {
      console.error('Error updating Google Sheet:', error.message);
    }
  }

  async markMessageSent(data: string): Promise<void> {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = 'shopee';

    if (!this.sheets) {
      console.error('Google Sheets client is not initialized.');
      return;
    }

    try {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['date_send'], [data]],
        },
      });
      console.log('Google Sheet updated successfully');
    } catch (error) {
      console.error('Error updating Google Sheet:', error.message);
    }
  }
  async hasSentMessageToday() {
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1; // Tháng trong JavaScript bắt đầu từ 0
    const year = currentDate.getFullYear();

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = 'shopee';

    const data = await this.sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    console.log(data.data.values, ' - ', `${day}/${month}/${year}`);

    return data.data.values?.[1]?.[0] === `${day}/${month}/${year}`;
  }
  onModuleInit() {
    this.initialize(); // Gọi khởi tạo ngay khi module được khởi tạo
  }
}
