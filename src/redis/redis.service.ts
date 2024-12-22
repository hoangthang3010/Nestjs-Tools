import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService {
  private redis: Redis;

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST') || '127.0.0.1',
      port: Number(this.configService.get('REDIS_PORT')) || 6379,
    });
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redis.set(key, value, 'EX', ttl);
    } else {
      await this.redis.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async hasSentMessageToday(): Promise<boolean> {
    const todayKey = `sent_today:${new Date().toISOString().split('T')[0]}`;
    const exists = await this.redis.exists(todayKey);
    return exists === 1;
  }

  async markMessageSent(): Promise<void> {
    const todayKey = `sent_today:${new Date().toISOString().split('T')[0]}`;
    await this.redis.set(todayKey, 'true', 'EX', 172800); // TTL: 1 ngày
  }
}
