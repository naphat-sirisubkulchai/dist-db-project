import { Comment, IComment } from '../models/Comment';

export class CommentRepository {
  async create(data: Partial<IComment>): Promise<IComment> {
    const comment = await Comment.create(data);
    await comment.populate('author', 'username name avatar');
    return comment;
  }

  async findById(id: string): Promise<IComment | null> {
    return await Comment.findById(id).populate('author', 'username name avatar');
  }

  async update(id: string, data: Partial<IComment>): Promise<IComment | null> {
    return await Comment.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).populate(
      'author',
      'username name avatar'
    );
  }

  async delete(id: string): Promise<IComment | null> {
    return await Comment.findByIdAndDelete(id);
  }

  async findByAuthorAndId(authorId: string, commentId: string): Promise<IComment | null> {
    return await Comment.findOne({ _id: commentId, author: authorId });
  }

  async findByPost(
    postId: string,
    skip: number,
    limit: number,
    parentOnly: boolean = true
  ): Promise<{ comments: IComment[]; total: number }> {
    const filter: any = { post: postId };
    if (parentOnly) {
      filter.parentComment = null;
    }

    const [comments, total] = await Promise.all([
      Comment.find(filter)
        .populate('author', 'username name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments(filter),
    ]);

    return { comments: comments as unknown as IComment[], total };
  }

  async findReplies(
    parentCommentId: string,
    skip: number,
    limit: number
  ): Promise<{ comments: IComment[]; total: number }> {
    const [comments, total] = await Promise.all([
      Comment.find({ parentComment: parentCommentId })
        .populate('author', 'username name avatar')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments({ parentComment: parentCommentId }),
    ]);

    return { comments: comments as unknown as IComment[], total };
  }

  async deleteByPost(postId: string): Promise<void> {
    await Comment.deleteMany({ post: postId });
  }

  async deleteReplies(commentId: string): Promise<void> {
    await Comment.deleteMany({ parentComment: commentId });
  }

  async addLike(commentId: string, userId: string): Promise<IComment | null> {
    return await Comment.findByIdAndUpdate(
      commentId,
      {
        $addToSet: { likes: userId },
        $inc: { likesCount: 1 },
      },
      { new: true }
    );
  }

  async removeLike(commentId: string, userId: string): Promise<IComment | null> {
    return await Comment.findByIdAndUpdate(
      commentId,
      {
        $pull: { likes: userId },
        $inc: { likesCount: -1 },
      },
      { new: true }
    );
  }

  async hasUserLiked(commentId: string, userId: string): Promise<boolean> {
    const comment = await Comment.findById(commentId).select('likes');
    return comment?.likes.some((id) => id.toString() === userId) || false;
  }
}

export const commentRepository = new CommentRepository();
