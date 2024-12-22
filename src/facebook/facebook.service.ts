import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class FacebookService {
  private readonly FB_TOKEN_KEY = 'FB_ACCESS_TOKEN';

  constructor(private readonly redisService: RedisService) {}

  async getAccessToken(): Promise<string> {
    let token = await this.redisService.get(this.FB_TOKEN_KEY);
    if (!token) {
      token = process.env.FB_ACCESS_TOKEN;
      await this.redisService.set(this.FB_TOKEN_KEY, token, 3600); // TTL 1 giờ
    }
    return token;
  }

  async refreshAccessToken(): Promise<void> {
    const appId = process.env.FB_APP_ID;
    const appSecret = process.env.FB_APP_SECRET;

    try {
      const response = await axios.get(
        `https://graph.facebook.com/v17.0/oauth/access_token`,
        {
          params: {
            grant_type: 'fb_exchange_token',
            client_id: appId,
            client_secret: appSecret,
            fb_exchange_token: await this.getAccessToken(),
          },
        },
      );

      const newToken = response.data.access_token;
      await this.redisService.set(
        this.FB_TOKEN_KEY,
        newToken,
        60 * 60 * 24 * 59,
      ); // TTL 59 ngày
      console.log('Access token refreshed:', newToken);
    } catch (error) {
      console.error('Error refreshing access token:', error.message);
    }
  }

  async getNewVideoLink(videoId: string): Promise<string | null> {
    const url = `${process.env.FB_GRAPH_API}/${videoId}`;
    const accessToken = await this.getAccessToken();

    try {
      const response = await axios.get(url, {
        params: {
          fields: 'source',
          access_token: accessToken,
        },
      });
      console.log(response.data);
      return response.data.source || null;
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('Access token expired. Refreshing...');
        await this.refreshAccessToken();
        return this.getNewVideoLink(videoId);
      }
      console.error(
        `Error fetching video link for ID ${videoId}:`,
        error.message,
      );
      return null;
    }
  }
}
