import { Elysia, t } from 'elysia';
import { commentController } from '../controllers/comment.controller';
import { jwtPlugin } from '../middleware/auth';
import { getUserFromToken } from '../utils/auth-helper';

export const commentRoutes = new Elysia({ prefix: '/comments' })
  .use(jwtPlugin)
  .get('/post/:postId', async ({ params: { postId }, query, jwt, headers }: any) => {
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

    return await commentController.getPostComments(postId, userId, query.page, query.limit);
  })
  .get('/:commentId/replies', async ({ params: { commentId }, query }) => {
    return await commentController.getCommentReplies(commentId, query.page, query.limit);
  });

// Protected routes that require authentication
export const commentProtectedRoutes = new Elysia({ prefix: '/comments' })
  .use(jwtPlugin)
  .post(
    '/',
    async ({ jwt, headers, body }: any) => {
      const user = await getUserFromToken(jwt, headers);
      return await commentController.createComment({
        postId: body.postId,
        authorId: user.userId,
        content: body.content,
        parentCommentId: body.parentCommentId,
      });
    },
    {
      body: t.Object({
        postId: t.String(),
        content: t.String({ minLength: 1, maxLength: 1000 }),
        parentCommentId: t.Optional(t.String()),
      }),
    }
  )
  .put(
    '/:id',
    async ({ jwt, headers, params: { id }, body }: any) => {
      const user = await getUserFromToken(jwt, headers);
      return await commentController.updateComment(id, user.userId, body.content);
    },
    {
      body: t.Object({
        content: t.String({ minLength: 1, maxLength: 1000 }),
      }),
    }
  )
  .delete('/:id', async ({ jwt, headers, params: { id } }: any) => {
    const user = await getUserFromToken(jwt, headers);
    return await commentController.deleteComment(id, user.userId);
  })
  .post('/:id/like', async ({ jwt, headers, params: { id } }: any) => {
    const user = await getUserFromToken(jwt, headers);
    return await commentController.likeComment(id, user.userId);
  });
