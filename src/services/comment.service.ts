import { commentRepository } from '../repositories/comment.repository';
import { postRepository } from '../repositories/post.repository';
import { validatePagination, createPaginationResponse } from '../utils/helpers';

export class CommentService {
  async createComment(
    postId: string,
    authorId: string,
    content: string,
    parentCommentId?: string
  ) {
    // Verify post exists
    const post = await postRepository.findById(postId, true);
    if (!post) {
      throw new Error('Post not found');
    }

    // If it's a reply, verify parent comment exists
    if (parentCommentId) {
      const parentComment = await commentRepository.findById(parentCommentId);
      if (!parentComment) {
        throw new Error('Parent comment not found');
      }
    }

    const comment = await commentRepository.create({
      content,
      author: authorId,
      post: postId,
      parentComment: parentCommentId,
    } as any);

    // Increment comments count on post
    await postRepository.incrementCommentsCount(postId);

    return comment;
  }

  async updateComment(commentId: string, authorId: string, content: string) {
    const comment = await commentRepository.findByAuthorAndId(authorId, commentId);

    if (!comment) {
      throw new Error('Comment not found or unauthorized');
    }

    const updatedComment = await commentRepository.update(commentId, { content } as any);

    if (!updatedComment) {
      throw new Error('Failed to update comment');
    }

    return updatedComment;
  }

  async deleteComment(commentId: string, authorId: string) {
    const comment = await commentRepository.findByAuthorAndId(authorId, commentId);

    if (!comment) {
      throw new Error('Comment not found or unauthorized');
    }

    // Decrement comments count on post
    await postRepository.decrementCommentsCount(comment.post.toString());

    // Delete all replies to this comment
    await commentRepository.deleteReplies(commentId);

    // Delete the comment
    await commentRepository.delete(commentId);

    return { message: 'Comment deleted successfully' };
  }

  async getPostComments(postId: string, page?: string, limit?: string) {
    const { page: pageNum, limit: limitNum, skip } = validatePagination(page, limit);

    const result = await commentRepository.findByPost(postId, skip, limitNum, true);

    return createPaginationResponse(result.comments, result.total, pageNum, limitNum);
  }

  async getCommentReplies(commentId: string, page?: string, limit?: string) {
    const { page: pageNum, limit: limitNum, skip } = validatePagination(page, limit);

    const result = await commentRepository.findReplies(commentId, skip, limitNum);

    return createPaginationResponse(result.comments, result.total, pageNum, limitNum);
  }

  async likeComment(commentId: string, userId: string) {
    const alreadyLiked = await commentRepository.hasUserLiked(commentId, userId);

    let updatedComment;

    if (alreadyLiked) {
      // Unlike
      updatedComment = await commentRepository.removeLike(commentId, userId);
    } else {
      // Like
      updatedComment = await commentRepository.addLike(commentId, userId);
    }

    if (!updatedComment) {
      throw new Error('Comment not found');
    }

    return { liked: !alreadyLiked, likesCount: updatedComment.likesCount };
  }
}

export const commentService = new CommentService();
