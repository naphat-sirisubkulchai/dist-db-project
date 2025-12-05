import { Elysia, t } from 'elysia';
import { postController } from '../controllers/post.controller';
import { jwtPlugin } from '../middleware/auth';
import { getUserFromToken } from '../utils/auth-helper';

// Public and optional-auth routes
export const postRoutes = new Elysia({ prefix: '/posts' })
  .use(jwtPlugin)
  .get('/', async ({ query }) => {
    return await postController.getAllPosts(query);
  })
  .get('/user/:userId', async ({ params: { userId }, query }) => {
    return await postController.getPostsByUser(userId, query.page, query.limit);
  })
  .get('/id/:id', async ({ params: { id }, jwt, headers }: any) => {
    // Manually extract user from JWT if present
    let userId: string | undefined;
    const auth = headers.authorization;

    if (auth && auth.startsWith('Bearer ')) {
      const token = auth.substring(7);
      try {
        const payload = await jwt.verify(token);
        if (payload && payload.userId) {
          userId = payload.userId;
        }
      } catch (error) {
        // Token invalid, continue without user
      }
    }

    return await postController.getPostById(id, userId);
  })
  .get('/:slug', async ({ params: { slug }, jwt, headers }: any) => {
    // Manually extract user from JWT if present
    let userId: string | undefined;
    const auth = headers.authorization;

    if (auth && auth.startsWith('Bearer ')) {
      const token = auth.substring(7);
      try {
        const payload = await jwt.verify(token);
        if (payload && payload.userId) {
          userId = payload.userId;
        }
      } catch (error) {
        // Token invalid, continue without user
      }
    }

    return await postController.getPostBySlug(slug, userId);
  });

// Protected routes requiring authentication
export const postProtectedRoutes = new Elysia({ prefix: '/posts' })
  .use(jwtPlugin)
  .get(
    '/feed',
    async ({ jwt, headers, query }: any) => {
      const user = await getUserFromToken(jwt, headers);
      return await postController.getFeed(user.userId, query.page, query.limit);
    }
  )
  .post(
    '/',
    async ({ jwt, headers, body }: any) => {
      const user = await getUserFromToken(jwt, headers);
      return await postController.createPost(user.userId, body);
    },
    {
      body: t.Object({
        title: t.String({ minLength: 1, maxLength: 200 }),
        content: t.String({ minLength: 1 }),
        tags: t.Optional(t.Array(t.String())),
        coverImage: t.Optional(t.String()),
        published: t.Optional(t.Boolean()),
      }),
    }
  )
  .get('/my/drafts', async ({ jwt, headers, query }: any) => {
    const user = await getUserFromToken(jwt, headers);
    return await postController.getUserDrafts(user.userId, query.page, query.limit);
  })
  .put(
    '/:id',
    async ({ jwt, headers, params: { id }, body }: any) => {
      const user = await getUserFromToken(jwt, headers);
      return await postController.updatePost(id, user.userId, body);
    },
    {
      body: t.Object({
        title: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
        content: t.Optional(t.String({ minLength: 1 })),
        tags: t.Optional(t.Array(t.String())),
        coverImage: t.Optional(t.String()),
        published: t.Optional(t.Boolean()),
      }),
    }
  )
  .delete('/:id', async ({ jwt, headers, params: { id } }: any) => {
    const user = await getUserFromToken(jwt, headers);
    return await postController.deletePost(id, user.userId);
  })
  .post('/:id/like', async ({ jwt, headers, params: { id } }: any) => {
    const user = await getUserFromToken(jwt, headers);
    return await postController.likePost(id, user.userId);
  })
  .post('/:id/save', async ({ jwt, headers, params: { id } }: any) => {
    const user = await getUserFromToken(jwt, headers);
    return await postController.savePost(id, user.userId);
  })
  .get('/saved', async ({ jwt, headers, query }: any) => {
    const user = await getUserFromToken(jwt, headers);
    return await postController.getSavedPosts(user.userId, query.page, query.limit);
  });
