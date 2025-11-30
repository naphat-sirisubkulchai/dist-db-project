import { commentRepository } from '../repositories/comment.repository';
import { postRepository } from '../repositories/post.repository';
import { validatePagination, createPaginationResponse } from '../utils/helpers';
import { notificationService } from './notification.service';
import { NotificationType } from '../models/Notification';
import { wsManager } from '../utils/websocket';

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

    let parentComment;
    // If it's a reply, verify parent comment exists
    if (parentCommentId) {
      parentComment = await commentRepository.findById(parentCommentId);
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

    // Create notifications
    if (parentCommentId && parentComment) {
      // It's a reply - notify the comment author
      const notification = await notificationService.createNotification({
        recipient: parentComment.author,
        sender: authorId,
        type: NotificationType.COMMENT_REPLY,
        post: postId,
        comment: comment._id,
      });

      if (notification) {
        wsManager.sendToUser(parentComment.author.toString(), notification);
      }
    } else {
      // It's a new comment - notify the post author
      const notification = await notificationService.createNotification({
        recipient: post.author,
        sender: authorId,
        type: NotificationType.COMMENT,
        post: postId,
        comment: comment._id,
      });

      if (notification) {
        wsManager.sendToUser(post.author.toString(), notification);
      }
    }

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

  async getPostComments(postId: string, userId?: string, page?: string, limit?: string) {
    const { page: pageNum, limit: limitNum, skip } = validatePagination(page, limit);

    // Fetch all comments (including replies) by passing false for parentOnly
    const result = await commentRepository.findByPost(postId, skip, limitNum, false);

    console.log('User ID for comments:', userId);
    console.log('First comment likes:', result.comments[0]?.likes);

    // Add isLiked field to each comment if userId is provided
    const commentsWithLikedStatus = result.comments.map((comment: any) => {
      const isLiked = userId && comment.likes ?
        comment.likes.some((id: any) => id.toString() === userId) : false;
      console.log('Comment isLiked:', isLiked);
      return {
        ...comment,
        isLiked,
      };
    });

    return createPaginationResponse(commentsWithLikedStatus, result.total, pageNum, limitNum);
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

      // Create notification for comment author
      if (updatedComment) {
        const notification = await notificationService.createNotification({
          recipient: updatedComment.author,
          sender: userId,
          type: NotificationType.COMMENT_LIKE,
          post: updatedComment.post,
          comment: updatedComment._id,
        });

        // Send real-time notification if user is online
        if (notification) {
          wsManager.sendToUser(updatedComment.author.toString(), notification);
        }
      }
    }

    if (!updatedComment) {
      throw new Error('Comment not found');
    }

    return { liked: !alreadyLiked, likesCount: updatedComment.likesCount };
  }
}

export const commentService = new CommentService();
