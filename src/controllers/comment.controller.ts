import { commentService } from '../services/comment.service';

export class CommentController {
  async getPostComments(postId: string, userId?: string, page?: string, limit?: string) {
    const comments = await commentService.getPostComments(postId, userId, page, limit);
    return {
      success: true,
      data: comments,
    };
  }

  async getCommentReplies(commentId: string, page?: string, limit?: string) {
    const replies = await commentService.getCommentReplies(commentId, page, limit);
    return {
      success: true,
      data: replies,
    };
  }

  async createComment(data: {
    postId: string;
    authorId: string;
    content: string;
    parentCommentId?: string;
  }) {
    const comment = await commentService.createComment(
      data.postId,
      data.authorId,
      data.content,
      data.parentCommentId
    );
    return {
      success: true,
      data: comment,
    };
  }

  async updateComment(commentId: string, authorId: string, content: string) {
    const comment = await commentService.updateComment(commentId, authorId, content);
    return {
      success: true,
      data: comment,
    };
  }

  async deleteComment(commentId: string, authorId: string) {
    const result = await commentService.deleteComment(commentId, authorId);
    return {
      success: true,
      data: result,
    };
  }

  async likeComment(commentId: string, userId: string) {
    const result = await commentService.likeComment(commentId, userId);
    return {
      success: true,
      data: result,
    };
  }
}

export const commentController = new CommentController();
