import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import jwt from '@elysiajs/jwt';
import { staticPlugin } from '@elysiajs/static';
import { config } from './config/env';
import { connectDatabase } from './config/database';
import { authRoutes } from './routes/auth.routes';
import { postRoutes, postProtectedRoutes } from './routes/post.routes';
import { commentRoutes, commentProtectedRoutes } from './routes/comment.routes';
import { userRoutes } from './routes/user.routes';
import { notificationController } from './controllers/notification.controller';
import { uploadController } from './controllers/upload.controller';
import { wsManager } from './utils/websocket';

// Connect to database
await connectDatabase();

const app = new Elysia()
  .use(
    cors({
      origin: true,
      credentials: true,
    })
  )
  .use(
    swagger({
      documentation: {
        info: {
          title: 'Blog API Documentation',
          version: '1.0.0',
          description: 'Medium-like blog platform API built with Elysia and MongoDB',
        },
        tags: [
          { name: 'Auth', description: 'Authentication endpoints' },
          { name: 'Posts', description: 'Blog post endpoints' },
          { name: 'Comments', description: 'Comment endpoints' },
          { name: 'Users', description: 'User endpoints' },
          { name: 'Notifications', description: 'Notification endpoints' },
        ],
      },
    })
  )
  .onError(({ code, error, set }) => {
    console.error('Error:', error);

    // Get error message safely
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage === 'Unauthorized') {
      set.status = 401;
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    if (code === 'VALIDATION') {
      set.status = 400;
      return {
        success: false,
        error: 'Validation error',
        details: errorMessage,
      };
    }

    if (code === 'NOT_FOUND') {
      set.status = 404;
      return {
        success: false,
        error: 'Not found',
      };
    }

    set.status = 500;
    return {
      success: false,
      error: errorMessage || 'Internal server error',
    };
  })
  .get('/', () => ({
    message: 'Blog API is running',
    version: '1.0.0',
    docs: '/swagger',
  }))
  .get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }))
  .use(staticPlugin({
    assets: 'uploads',
    prefix: '/uploads',
  }))
  .use(authRoutes)
  .use(postRoutes)
  .use(postProtectedRoutes)
  .use(commentRoutes)
  .use(commentProtectedRoutes)
  .use(userRoutes)
  .use(uploadController)
  .use(notificationController)
  .use(
    jwt({
      name: 'jwtWs',
      secret: config.jwt.secret,
    })
  )
  .ws('/ws', {
    beforeHandle: async ({ query, jwtWs }: any) => {
      const token = query.token;

      if (!token) {
        return;
      }

      try {
        const payload = await jwtWs.verify(token);

        if (payload && payload.userId) {
          return { userId: payload.userId };
        }
      } catch (error) {
        console.error('WebSocket auth error:', error);
      }
    },
    open(ws: any) {
      const userId = ws.data?.userId;

      if (userId) {
        wsManager.addConnection(userId, ws);
        ws.send(
          JSON.stringify({
            type: 'connected',
            message: 'Connected to notification stream',
          })
        );
      } else {
        // Close connection if not authenticated
        ws.close();
      }
    },
    message(_ws: any, _message: any) {
      // Handle incoming messages if needed
    },
    close(ws: any) {
      const userId = ws.data?.userId;
      if (userId) {
        wsManager.removeConnection(userId, ws);
      }
    },
  })
  .listen(config.port);

console.log(`🚀 Server is running at http://localhost:${app.server?.port}`);
console.log(`📚 API Documentation available at http://localhost:${app.server?.port}/swagger`);
