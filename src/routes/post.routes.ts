import { Elysia, t } from 'elysia';
import { postController } from '../controllers/post.controller';
import { authPlugin, jwtPlugin } from '../middleware/auth';
import { getUserFromToken } from '../utils/auth-helper';

export const postRoutes = new Elysia({ prefix: '/posts' })
  .use(authPlugin)
  .get('/', async ({ query }) => {
    return await postController.getAllPosts(query);
  })
  .use(jwtPlugin)
  .get(
    '/feed',
    async ({ jwt, headers, query }) => {
      const user = await getUserFromToken(jwt, headers);
      return await postController.getFeed(user.userId, query.page, query.limit);
    }
  )
  .get('/:slug', async ({ params: { slug } }) => {
    return await postController.getPostBySlug(slug);
  })
  .post(
    '/',
    async ({ jwt, headers, body }) => {
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
  .get('/my/drafts', async ({ jwt, headers, query }) => {
    const user = await getUserFromToken(jwt, headers);
    return await postController.getUserDrafts(user.userId, query.page, query.limit);
  })
  .put(
    '/:id',
    async ({ jwt, headers, params: { id }, body }) => {
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
  .delete('/:id', async ({ jwt, headers, params: { id } }) => {
    const user = await getUserFromToken(jwt, headers);
    return await postController.deletePost(id, user.userId);
  })
  .post('/:id/like', async ({ jwt, headers, params: { id } }) => {
    const user = await getUserFromToken(jwt, headers);
    return await postController.likePost(id, user.userId);
  });
