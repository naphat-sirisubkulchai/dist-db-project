import { Post, IPost } from '../models/Post';
import mongoose from 'mongoose';

export class PostRepository {
  async create(data: Partial<IPost>): Promise<IPost> {
    const post = await Post.create(data);
    await post.populate('author', 'username name avatar');
    return post;
  }

  async findById(id: string, includeUnpublished: boolean = false): Promise<IPost | null> {
    const filter: any = { _id: id };
    if (!includeUnpublished) {
      filter.published = true;
    }
    return (await Post.findOne(filter).populate('author', 'username name avatar bio').lean()) as unknown as IPost | null;
  }

  async findBySlug(slug: string): Promise<IPost | null> {
    return (await Post.findOne({ slug, published: true })
      .populate('author', 'username name avatar bio')
      .lean()) as unknown as IPost | null;
  }

  async update(id: string, data: Partial<IPost>): Promise<IPost | null> {
    return await Post.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).populate(
      'author',
      'username name avatar'
    );
  }

  async delete(id: string): Promise<IPost | null> {
    return await Post.findByIdAndDelete(id);
  }

  async findByAuthorAndId(authorId: string, postId: string): Promise<IPost | null> {
    return await Post.findOne({ _id: postId, author: authorId });
  }

  async findAll(
    filter: any,
    skip: number,
    limit: number,
    sort: any = { publishedAt: -1 }
  ): Promise<{ posts: IPost[]; total: number }> {
    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate('author', 'username name avatar')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(filter),
    ]);

    return { posts: posts as unknown as IPost[], total };
  }

  async findPublished(
    skip: number,
    limit: number,
    additionalFilter: any = {}
  ): Promise<{ posts: IPost[]; total: number }> {
    const filter = { published: true, ...additionalFilter };
    return await this.findAll(filter, skip, limit, { publishedAt: -1 });
  }

  async findByAuthor(
    authorId: string,
    skip: number,
    limit: number,
    publishedOnly: boolean = true
  ): Promise<{ posts: IPost[]; total: number }> {
    const filter: any = { author: authorId };
    if (publishedOnly) {
      filter.published = true;
    }
    const sort = publishedOnly ? { publishedAt: -1 } : { updatedAt: -1 };
    return await this.findAll(filter, skip, limit, sort);
  }

  async findByTag(tag: string, skip: number, limit: number): Promise<{ posts: IPost[]; total: number }> {
    return await this.findPublished(skip, limit, { tags: tag });
  }

  async search(query: string, skip: number, limit: number): Promise<{ posts: IPost[]; total: number }> {
    return await this.findPublished(skip, limit, { $text: { $search: query } });
  }

  async countByAuthor(authorId: mongoose.Types.ObjectId, publishedOnly: boolean = true): Promise<number> {
    const filter: any = { author: authorId };
    if (publishedOnly) {
      filter.published = true;
    }
    return await Post.countDocuments(filter);
  }

  async addLike(postId: string, userId: string): Promise<IPost | null> {
    return await Post.findByIdAndUpdate(
      postId,
      {
        $addToSet: { likes: userId },
        $inc: { likesCount: 1 },
      },
      { new: true }
    );
  }

  async removeLike(postId: string, userId: string): Promise<IPost | null> {
    return await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { likes: userId },
        $inc: { likesCount: -1 },
      },
      { new: true }
    );
  }

  async hasUserLiked(postId: string, userId: string): Promise<boolean> {
    const post = await Post.findById(postId).select('likes');
    return post?.likes.some((id) => id.toString() === userId) || false;
  }

  async incrementCommentsCount(postId: string): Promise<void> {
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });
  }

  async decrementCommentsCount(postId: string): Promise<void> {
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: -1 } });
  }
}

export const postRepository = new PostRepository();
