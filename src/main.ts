import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { PNG } from 'pngjs';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

import axios from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';
import * as sharp from 'sharp';
import * as express from 'express';
import { join } from 'path';

const tsFilePath = path.resolve(__dirname, '../public/output_000.ts');
const pngFilePath = path.resolve(__dirname, '../public/output.png');

async function uploadToServer(imagePath: string): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(imagePath));

    const response = await axios.post(
      'http://localhost:3001/upload',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      },
    );

    return response.data.url; // Nhận URL public từ server
  } catch (error) {
    console.error('❌ Lỗi khi upload ảnh lên server:', error.message);
    throw error;
  }
}

async function uploadToTikTok(imagePath: string) {
  console.log(imagePath);

  try {
    const response = await axios.post(
      'https://open.tiktokapis.com/v2/post/publish/content/init/',
      {
        post_info: {
          title: 'Embedded TS in PNG',
          description: 'Testing #TSinPNG',
          disable_comment: false,
          privacy_level: 'PUBLIC_TO_EVERYONE',
          auto_add_music: false,
        },
        source_info: {
          source: 'PULL_FROM_URL',
          photo_cover_index: 1,
          photo_images: [imagePath],
        },
        post_mode: 'DIRECT_POST',
        media_type: 'PHOTO',
      },
      {
        headers: {
          Authorization: `Bearer clt.2.NViVdO34HLqHpbPmvXKJGm1W6tJ7FkwcA4xauzPJQHIMumdXBb2AhTHON2m3zCbFZ8IzKFl0_uWtqAxEIx7t8Q*1`, // Thay YOUR_ACCESS_TOKEN bằng token thật
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('✅ Ảnh đã được tải lên TikTok:', response.data);
  } catch (error) {
    console.error(
      '❌ Lỗi khi tải ảnh lên TikTok:',
      error.response?.data || error.message,
    );
  }
}

async function embedTsInPng() {
  try {
    await sharp({
      create: {
        width: 1,
        height: 1,
        channels: 3,
        background: { r: 255, g: 255, b: 255 },
      },
    })
      .png()
      .toFile(pngFilePath);

    const pngBuffer = fs.readFileSync(pngFilePath);
    const tsBuffer = fs.readFileSync(tsFilePath);

    const combinedBuffer = Buffer.concat([pngBuffer, tsBuffer]);
    fs.writeFileSync(pngFilePath, combinedBuffer);

    console.log('✅ Đã nhúng file TS vào PNG thành công!');
    const imageUrl = await uploadToServer(pngFilePath);
    console.log('📤 Ảnh đã upload lên server:', imageUrl);
    await uploadToTikTok(imageUrl);
  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}

// async function extractTsFromPng() {
//   try {
//     const pngBuffer = fs.readFileSync(pngFilePath);

//     // Xác định độ dài phần PNG
//     const pngEndIndex =
//       pngBuffer.indexOf(
//         Buffer.from([0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82]),
//       ) + 8;
//     if (pngEndIndex < 8) throw new Error('Không tìm thấy header PNG hợp lệ!');

//     // Cắt lấy phần TS từ sau header PNG
//     const tsBuffer = pngBuffer.slice(pngEndIndex);
//     fs.writeFileSync(outputTsFilePath, tsBuffer);

//     console.log('✅ Đã trích xuất file video thành công:', outputTsFilePath);
//   } catch (error) {
//     console.error('❌ Lỗi:', error);
//   }
// }

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });

  embedTsInPng();
  // extractTsFromPng();

  app.use('/public', express.static(join(__dirname, '..', 'public')));

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
