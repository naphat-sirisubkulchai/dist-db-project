import { postService } from '../services/post.service';

export class PostController {
  async getAllPosts(query: {
    page?: string;
    limit?: string;
    author?: string;
    tag?: string;
    search?: string;
  }) {
    const posts = await postService.getPosts(query);
    return {
      success: true,
      data: posts,
    };
  }

  async getFeed(userId: string, page?: string, limit?: string) {
    const feed = await postService.getFeed(userId, page, limit);
    return {
      success: true,
      data: feed,
    };
  }

  async getPostBySlug(slug: string, userId?: string) {
    const post = await postService.getPostBySlug(slug, userId);
    return {
      success: true,
      data: post,
    };
  }

  async createPost(
    userId: string,
    data: { title: string; content: string; tags?: string[]; coverImage?: string; published?: boolean }
  ) {
    const post = await postService.createPost(userId, data);
    return {
      success: true,
      data: post,
    };
  }

  async getUserDrafts(userId: string, page?: string, limit?: string) {
    const drafts = await postService.getUserDrafts(userId, page, limit);
    return {
      success: true,
      data: drafts,
    };
  }

  async getPostsByUser(userId: string, page?: string, limit?: string) {
    const posts = await postService.getPostsByUser(userId, page, limit);
    return {
      success: true,
      data: posts,
    };
  }

  async updatePost(postId: string, userId: string, updates: any) {
    const post = await postService.updatePost(postId, userId, updates);
    return {
      success: true,
      data: post,
    };
  }

  async deletePost(postId: string, userId: string) {
    const result = await postService.deletePost(postId, userId);
    return {
      success: true,
      data: result,
    };
  }

  async likePost(postId: string, userId: string) {
    const result = await postService.likePost(postId, userId);
    return {
      success: true,
      data: result,
    };
  }

  async savePost(postId: string, userId: string) {
    const result = await postService.savePost(postId, userId);
    return {
      success: true,
      data: result,
    };
  }

  async getSavedPosts(userId: string, page?: string, limit?: string) {
    const posts = await postService.getSavedPosts(userId, page, limit);
    return {
      success: true,
      data: posts,
    };
  }
}

export const postController = new PostController();
