import { Elysia, t } from 'elysia';
import { commentController } from '../controllers/comment.controller';
import { jwtPlugin } from '../middleware/auth';
import { getUserFromToken } from '../utils/auth-helper';

export const commentRoutes = new Elysia({ prefix: '/comments' })
  .get('/post/:postId', async ({ params: { postId }, query }) => {
    return await commentController.getPostComments(postId, query.page, query.limit);
  })
  .get('/:commentId/replies', async ({ params: { commentId }, query }) => {
    return await commentController.getCommentReplies(commentId, query.page, query.limit);
  })
  .use(jwtPlugin)
  .post(
    '/',
    async ({ jwt, headers, body }) => {
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
    async ({ jwt, headers, params: { id }, body }) => {
      const user = await getUserFromToken(jwt, headers);
      return await commentController.updateComment(id, user.userId, body.content);
    },
    {
      body: t.Object({
        content: t.String({ minLength: 1, maxLength: 1000 }),
      }),
    }
  )
  .delete('/:id', async ({ jwt, headers, params: { id } }) => {
    const user = await getUserFromToken(jwt, headers);
    return await commentController.deleteComment(id, user.userId);
  })
  .post('/:id/like', async ({ jwt, headers, params: { id } }) => {
    const user = await getUserFromToken(jwt, headers);
    return await commentController.likeComment(id, user.userId);
  });
