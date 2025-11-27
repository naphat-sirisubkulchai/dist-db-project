import { Elysia } from 'elysia';
import { userController } from '../controllers/user.controller';
import { authPlugin, jwtPlugin } from '../middleware/auth';
import { getUserFromToken } from '../utils/auth-helper';

export const userRoutes = new Elysia({ prefix: '/users' })
  .use(authPlugin)
  .get('/search', async ({ query }) => {
    if (!query.q) {
      throw new Error('Search query is required');
    }
    return await userController.searchUsers(query.q, query.page, query.limit);
  })
  .get('/:username', async ({ params: { username }, jwt, headers }) => {
    // Try to get user if logged in, otherwise pass undefined
    let currentUserId: string | undefined;
    try {
      const auth = headers.authorization;
      if (auth && auth.startsWith('Bearer ')) {
        const token = auth.substring(7);
        const payload = await jwt.verify(token);
        if (payload && typeof payload === 'object' && 'userId' in payload) {
          currentUserId = payload.userId as string;
        }
      }
    } catch (error) {
      // User not logged in, continue without userId
    }
    return await userController.getUserProfile(username, currentUserId);
  })
  .get('/:username/followers', async ({ params: { username }, query }) => {
    return await userController.getFollowers(username, query.page, query.limit);
  })
  .get('/:username/following', async ({ params: { username }, query }) => {
    return await userController.getFollowing(username, query.page, query.limit);
  })
  .use(jwtPlugin)
  .post('/:username/follow', async ({ jwt, headers, params: { username } }) => {
    const user = await getUserFromToken(jwt, headers);
    return await userController.followUser(user.userId, username);
  });
