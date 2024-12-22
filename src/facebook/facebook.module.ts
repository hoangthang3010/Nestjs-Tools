import { Module } from '@nestjs/common';
import { FacebookService } from './facebook.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [FacebookService],
  exports: [FacebookService],
})
export class FacebookModule {}
