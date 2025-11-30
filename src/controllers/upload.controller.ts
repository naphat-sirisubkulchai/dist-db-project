import { Elysia, t } from 'elysia';
import { jwtPlugin } from '../middleware/auth';
import { getUserFromToken } from '../utils/auth-helper';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!existsSync(UPLOAD_DIR)) {
  await mkdir(UPLOAD_DIR, { recursive: true });
}

export const uploadController = new Elysia({ prefix: '/upload' })
  .use(jwtPlugin)
  .post(
    '/image',
    async ({ jwt, headers, body, set }: any) => {
      try {
        // Verify authentication
        const user = await getUserFromToken(jwt, headers);

        if (!body.image) {
          set.status = 400;
          return {
            success: false,
            error: 'No image file provided',
          };
        }

        const file = body.image;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
          set.status = 400;
          return {
            success: false,
            error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.',
          };
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
          set.status = 400;
          return {
            success: false,
            error: 'File too large. Maximum size is 5MB.',
          };
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = file.name.split('.').pop() || 'jpg';
        const filename = `${timestamp}-${randomString}.${extension}`;
        const filepath = path.join(UPLOAD_DIR, filename);

        // Save file
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await writeFile(filepath, buffer);

        // Return URL
        const imageUrl = `/uploads/${filename}`;

        return {
          success: true,
          data: {
            url: imageUrl,
            filename,
          },
        };
      } catch (error: any) {
        console.error('Upload error:', error);
        set.status = 500;
        return {
          success: false,
          error: error.message || 'Failed to upload image',
        };
      }
    },
    {
      body: t.Object({
        image: t.File({
          type: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
          maxSize: 5 * 1024 * 1024, // 5MB
        }),
      }),
      detail: {
        tags: ['Upload'],
        summary: 'Upload cover image',
        description: 'Upload an image file for post cover (max 5MB, JPEG/PNG/GIF/WebP)',
      },
    }
  );
