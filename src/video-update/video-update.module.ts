import { Module } from '@nestjs/common';
import { VideoUpdateService } from './video-update.service';
import { FacebookModule } from '../facebook/facebook.module';
import { GoogleSheetsModule } from '../google-sheets/google-sheets.module';

@Module({
  imports: [FacebookModule, GoogleSheetsModule],
  providers: [VideoUpdateService],
  exports: [VideoUpdateService],
})
export class VideoUpdateModule {}
