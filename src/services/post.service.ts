import { IPost } from '../models/Post';
import { postRepository } from '../repositories/post.repository';
import { commentRepository } from '../repositories/comment.repository';
import { generateSlug, validatePagination, createPaginationResponse } from '../utils/helpers';

export class PostService {
  async createPost(
    authorId: string,
    data: { title: string; content: string; tags?: string[]; coverImage?: string; published?: boolean }
  ) {
    const slug = generateSlug(data.title);

    const post = await postRepository.create({
      ...data,
      slug,
      author: authorId,
      excerpt: data.content.substring(0, 300),
      publishedAt: data.published ? new Date() : undefined,
    } as IPost);

    return post;
  }

  async updatePost(postId: string, authorId: string, updates: Partial<IPost>) {
    const post = await postRepository.findByAuthorAndId(authorId, postId);

    if (!post) {
      throw new Error('Post not found or unauthorized');
    }

    // If title is being updated, regenerate slug
    if (updates.title && updates.title !== post.title) {
      updates.slug = generateSlug(updates.title);
    }

    // If content is being updated, update excerpt
    if (updates.content) {
      updates.excerpt = updates.content.substring(0, 300);
    }

    // If publishing for the first time
    if (updates.published && !post.published) {
      updates.publishedAt = new Date();
    }

    const updatedPost = await postRepository.update(postId, updates);

    if (!updatedPost) {
      throw new Error('Failed to update post');
    }

    return updatedPost;
  }

  async deletePost(postId: string, authorId: string) {
    const post = await postRepository.findByAuthorAndId(authorId, postId);

    if (!post) {
      throw new Error('Post not found or unauthorized');
    }

    // Delete all comments associated with the post
    await commentRepository.deleteByPost(postId);

    // Delete the post
    await postRepository.delete(postId);

    return { message: 'Post deleted successfully' };
  }

  async getPostById(postId: string) {
    const post = await postRepository.findById(postId);

    if (!post) {
      throw new Error('Post not found');
    }

    return post;
  }

  async getPostBySlug(slug: string) {
    const post = await postRepository.findBySlug(slug);

    if (!post) {
      throw new Error('Post not found');
    }

    return post;
  }

  async getPosts(query: {
    page?: string;
    limit?: string;
    author?: string;
    tag?: string;
    search?: string;
  }) {
    const { page, limit, skip } = validatePagination(query.page, query.limit);

    let result;

    if (query.search) {
      result = await postRepository.search(query.search, skip, limit);
    } else if (query.tag) {
      result = await postRepository.findByTag(query.tag, skip, limit);
    } else if (query.author) {
      result = await postRepository.findByAuthor(query.author, skip, limit, true);
    } else {
      result = await postRepository.findPublished(skip, limit);
    }

    return createPaginationResponse(result.posts, result.total, page, limit);
  }

  async getUserDrafts(authorId: string, page?: string, limit?: string) {
    const { page: pageNum, limit: limitNum, skip } = validatePagination(page, limit);

    const result = await postRepository.findByAuthor(authorId, skip, limitNum, false);

    return createPaginationResponse(result.posts, result.total, pageNum, limitNum);
  }

  async likePost(postId: string, userId: string) {
    const alreadyLiked = await postRepository.hasUserLiked(postId, userId);

    let updatedPost;

    if (alreadyLiked) {
      // Unlike
      updatedPost = await postRepository.removeLike(postId, userId);
    } else {
      // Like
      updatedPost = await postRepository.addLike(postId, userId);
    }

    if (!updatedPost) {
      throw new Error('Post not found');
    }

    return { liked: !alreadyLiked, likesCount: updatedPost.likesCount };
  }

  async getFeed(userId: string, page?: string, limit?: string) {
    const { page: pageNum, limit: limitNum, skip } = validatePagination(page, limit);

    // This would get posts from users the current user follows
    // For now, returning all published posts sorted by date
    const result = await postRepository.findPublished(skip, limitNum);

    return createPaginationResponse(result.posts, result.total, pageNum, limitNum);
  }
}

export const postService = new PostService();
