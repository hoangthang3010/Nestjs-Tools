import { Injectable } from '@nestjs/common';
// import { Cron } from '@nestjs/schedule';
import { FacebookService } from '../facebook/facebook.service';
import { GoogleSheetsService } from '../google-sheets/google-sheets.service';

@Injectable()
export class VideoUpdateService {
  private videos = [{ id: '1', videoId: '1095260062242510' }];

  constructor(
    private readonly facebookService: FacebookService,
    private readonly googleSheetsService: GoogleSheetsService,
  ) {}

  // @Cron(process.env.CRON_SCHEDULE || '*/1 * * * *')
  async updateVideos() {
    console.log('Cron job started: Updating expired videos');

    const updatedData: any[][] = [['ID', 'Video ID', 'New Link']];
    for (const video of this.videos) {
      const newLink = await this.facebookService.getNewVideoLink(video.videoId);
      updatedData.push([video.id, video.videoId, newLink || 'Error']);
    }

    await this.googleSheetsService.updateSheet(updatedData);
  }
}
