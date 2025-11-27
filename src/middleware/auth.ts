import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { config } from '../config/env';

export const jwtPlugin = new Elysia().use(
  jwt({
    name: 'jwt',
    secret: config.jwt.secret,
  })
);

export const authPlugin = new Elysia()
  .use(jwtPlugin)
  .derive(async ({ jwt, headers }) => {
    const auth = headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return { user: null };
    }

    const token = auth.substring(7);
    const payload = await jwt.verify(token);

    if (!payload) {
      return { user: null };
    }

    return { user: payload as { userId: string; username: string } };
  });

export const requireAuth = new Elysia({ name: 'requireAuth' })
  .use(jwtPlugin)
  .derive(async ({ jwt, headers }) => {
    const auth = headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new Error('Unauthorized');
    }

    const token = auth.substring(7);
    const payload = await jwt.verify(token);

    if (!payload) {
      throw new Error('Unauthorized');
    }

    return { user: payload as { userId: string; username: string } };
  });
