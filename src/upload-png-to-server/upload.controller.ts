import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  Res,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { Response } from 'express';

@Controller('upload')
export class UploadController {
  private uploadDir = path.resolve(__dirname, '../public');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: path.resolve(__dirname, '../public'),
        filename: (_, file, cb) => {
          cb(null, file.originalname);
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file: any) {
    return {
      url: `http://localhost:3001/upload/${file.filename}`, // URL công khai để gửi lên TikTok
    };
  }

  @Get(':filename')
  getFile(@Res() res: Response, @Param('filename') filename: string) {
    const filePath = path.join(this.uploadDir, filename);

    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    } else {
      return res.status(404).json({ message: 'File not found' });
    }
  }
}
