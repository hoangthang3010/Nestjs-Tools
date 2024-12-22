import { Test, TestingModule } from '@nestjs/testing';
import { VideoUpdateService } from './video-update.service';

describe('VideoUpdateService', () => {
  let service: VideoUpdateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideoUpdateService],
    }).compile();

    service = module.get<VideoUpdateService>(VideoUpdateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
