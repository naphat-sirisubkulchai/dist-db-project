import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { config } from '../config/env';

export const jwtPlugin = new Elysia().use(
  jwt({
    name: 'jwt',
    secret: config.jwt.secret,
  })
);

export const authPlugin = new Elysia({ name: 'authPlugin' })
  .use(jwtPlugin)
  .derive(async ({ jwt, headers }: any) => {
    const auth = headers.authorization;
    console.log('=== AUTH PLUGIN CALLED ===');
    console.log('Auth header:', auth);

    if (!auth || !auth.startsWith('Bearer ')) {
      console.log('No auth header or invalid format');
      return { user: null };
    }

    const token = auth.substring(7);
    const payload = await jwt.verify(token);
    console.log('JWT payload:', payload);

    if (!payload) {
      console.log('Invalid token');
      return { user: null };
    }

    console.log('User authenticated:', payload);
    return { user: payload as { userId: string; username: string } };
  });

export const requireAuth = new Elysia({ name: 'requireAuth' })
  .use(jwtPlugin)
  .derive(async ({ jwt, headers }: any) => {
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
