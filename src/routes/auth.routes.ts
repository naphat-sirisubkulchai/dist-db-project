import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { authController } from '../controllers/auth.controller';
import { jwtPlugin } from '../middleware/auth';
import { config } from '../config/env';
import { getUserFromToken } from '../utils/auth-helper';

export const authRoutes = new Elysia({ prefix: '/auth' })
  .use(
    jwt({
      name: 'jwt',
      secret: config.jwt.secret,
    })
  )
  .post(
    '/register',
    async ({ body, jwt }: any) => {
      return await authController.register(body, jwt);
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        username: t.String({ minLength: 3, maxLength: 30 }),
        password: t.String({ minLength: 6 }),
        name: t.Optional(t.String({ maxLength: 100 })),
      }),
    }
  )
  .post(
    '/login',
    async ({ body, jwt }: any) => {
      return await authController.login(body, jwt);
    },
    {
      body: t.Object({
        emailOrUsername: t.String(),
        password: t.String(),
      }),
    }
  )
  .use(jwtPlugin)
  .get('/me', async ({ jwt, headers }: any) => {
    const user = await getUserFromToken(jwt, headers);
    return await authController.getMe(user.userId);
  })
  .put(
    '/profile',
    async ({ jwt, headers, body }: any) => {
      const user = await getUserFromToken(jwt, headers);
      return await authController.updateProfile(user.userId, body);
    },
    {
      body: t.Object({
        name: t.Optional(t.String({ maxLength: 100 })),
        bio: t.Optional(t.String({ maxLength: 500 })),
        avatar: t.Optional(t.String()),
      }),
    }
  )
  .put(
    '/password',
    async ({ jwt, headers, body }: any) => {
      const user = await getUserFromToken(jwt, headers);
      return await authController.changePassword(user.userId, body.oldPassword, body.newPassword);
    },
    {
      body: t.Object({
        oldPassword: t.String(),
        newPassword: t.String({ minLength: 6 }),
      }),
    }
  );
