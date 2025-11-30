import { User, IUser } from '../models/User';
import mongoose from 'mongoose';

export class UserRepository {
  async create(data: Partial<IUser>): Promise<IUser> {
    return await User.create(data);
  }

  async findById(id: string): Promise<IUser | null> {
    return await User.findById(id).select('-password');
  }

  async findByIdWithPassword(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  async findByUsername(username: string): Promise<IUser | null> {
    return await User.findOne({ username });
  }

  async findByEmailOrUsername(emailOrUsername: string): Promise<IUser | null> {
    return await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).select(
      '-password'
    );
  }

  async delete(id: string): Promise<IUser | null> {
    return await User.findByIdAndDelete(id);
  }

  async search(query: string, skip: number, limit: number): Promise<{ users: IUser[]; total: number }> {
    const filter = {
      $or: [{ username: { $regex: query, $options: 'i' } }, { name: { $regex: query, $options: 'i' } }],
    };

    const [users, total] = await Promise.all([
      User.find(filter).select('username name avatar bio').skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    return { users: users as unknown as IUser[], total };
  }

  async addFollower(userId: string, followerId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { $addToSet: { followers: followerId } });
  }

  async removeFollower(userId: string, followerId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { $pull: { followers: followerId } });
  }

  async addFollowing(userId: string, followingId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { $addToSet: { following: followingId } });
  }

  async removeFollowing(userId: string, followingId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { $pull: { following: followingId } });
  }

  async getFollowers(
    userId: mongoose.Types.ObjectId,
    skip: number,
    limit: number
  ): Promise<{ users: IUser[]; total: number }> {
    const [users, total] = await Promise.all([
      User.find({ following: userId })
        .select('username name avatar bio')
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments({ following: userId }),
    ]);

    return { users: users as unknown as IUser[], total };
  }

  async getFollowing(
    userId: mongoose.Types.ObjectId,
    skip: number,
    limit: number
  ): Promise<{ users: IUser[]; total: number }> {
    const [users, total] = await Promise.all([
      User.find({ followers: userId })
        .select('username name avatar bio')
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments({ followers: userId }),
    ]);

    return { users: users as unknown as IUser[], total };
  }

  async countFollowers(userId: mongoose.Types.ObjectId): Promise<number> {
    return await User.countDocuments({ following: userId });
  }

  async countFollowing(userId: mongoose.Types.ObjectId): Promise<number> {
    return await User.countDocuments({ followers: userId });
  }

  async isFollowing(userId: string, targetUserId: string): Promise<boolean> {
    const user = await User.findById(userId);
    return user?.following.some((id) => id.toString() === targetUserId) || false;
  }

  async savePost(userId: string, postId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { $addToSet: { savedPosts: postId } });
  }

  async unsavePost(userId: string, postId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { $pull: { savedPosts: postId } });
  }

  async hasPostSaved(userId: string, postId: string): Promise<boolean> {
    const user = await User.findById(userId);
    return user?.savedPosts.some((id) => id.toString() === postId) || false;
  }

  async getSavedPosts(userId: string): Promise<mongoose.Types.ObjectId[]> {
    const user = await User.findById(userId).select('savedPosts');
    return user?.savedPosts || [];
  }
}

export const userRepository = new UserRepository();
