import { userRepository } from '../repositories/user.repository';
import { postRepository } from '../repositories/post.repository';
import { validatePagination, createPaginationResponse } from '../utils/helpers';
import { notificationService } from './notification.service';
import { NotificationType } from '../models/Notification';
import { wsManager } from '../utils/websocket';
import mongoose from 'mongoose';

export class UserService {
  async getUserById(userId: string, currentUserId?: string) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Get stats
    const [postsCount, followersCount, followingCount] = await Promise.all([
      postRepository.countByAuthor(user._id as mongoose.Types.ObjectId, true),
      userRepository.countFollowers(user._id as mongoose.Types.ObjectId),
      userRepository.countFollowing(user._id as mongoose.Types.ObjectId),
    ]);

    let isFollowing = false;
    if (currentUserId && currentUserId !== userId) {
      isFollowing = await userRepository.isFollowing(currentUserId, userId);
    }

    return {
      ...user.toObject(),
      stats: {
        posts: postsCount,
        followers: followersCount,
        following: followingCount,
      },
      isFollowing,
    };
  }

  async getUserByUsername(username: string) {
    const user = await userRepository.findByUsername(username);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async getUserProfile(username: string, currentUserId?: string) {
    const user = await this.getUserByUsername(username);

    const [postsCount, followersCount, followingCount] = await Promise.all([
      postRepository.countByAuthor(user._id as mongoose.Types.ObjectId, true),
      userRepository.countFollowers(user._id as mongoose.Types.ObjectId),
      userRepository.countFollowing(user._id as mongoose.Types.ObjectId),
    ]);

    let isFollowing = false;
    if (currentUserId) {
      isFollowing = await userRepository.isFollowing(currentUserId, user._id.toString());
    }

    return {
      ...user,
      stats: {
        posts: postsCount,
        followers: followersCount,
        following: followingCount,
      },
      isFollowing,
    };
  }

  async followUser(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new Error('Cannot follow yourself');
    }

    const [user, targetUser] = await Promise.all([
      userRepository.findById(userId),
      userRepository.findById(targetUserId),
    ]);

    if (!user || !targetUser) {
      throw new Error('User not found');
    }

    const alreadyFollowing = await userRepository.isFollowing(userId, targetUserId);

    if (alreadyFollowing) {
      // Unfollow
      await Promise.all([
        userRepository.removeFollowing(userId, targetUserId),
        userRepository.removeFollower(targetUserId, userId),
      ]);
    } else {
      // Follow
      await Promise.all([
        userRepository.addFollowing(userId, targetUserId),
        userRepository.addFollower(targetUserId, userId),
      ]);

      // Create notification for the followed user
      const notification = await notificationService.createNotification({
        recipient: targetUserId,
        sender: userId,
        type: NotificationType.FOLLOW,
      });

      // Send real-time notification
      if (notification) {
        wsManager.sendToUser(targetUserId, notification);
      }
    }

    return { following: !alreadyFollowing };
  }

  async getFollowers(username: string, page?: string, limit?: string) {
    const user = await userRepository.findByUsername(username);
    if (!user) {
      throw new Error('User not found');
    }

    const { page: pageNum, limit: limitNum, skip } = validatePagination(page, limit);

    const { users, total } = await userRepository.getFollowers(
      user._id as mongoose.Types.ObjectId,
      skip,
      limitNum
    );

    return createPaginationResponse(users, total, pageNum, limitNum);
  }

  async getFollowing(username: string, page?: string, limit?: string) {
    const user = await userRepository.findByUsername(username);
    if (!user) {
      throw new Error('User not found');
    }

    const { page: pageNum, limit: limitNum, skip } = validatePagination(page, limit);

    const { users, total } = await userRepository.getFollowing(
      user._id as mongoose.Types.ObjectId,
      skip,
      limitNum
    );

    return createPaginationResponse(users, total, pageNum, limitNum);
  }

  async searchUsers(query: string, page?: string, limit?: string) {
    const { page: pageNum, limit: limitNum, skip } = validatePagination(page, limit);

    const { users, total } = await userRepository.search(query, skip, limitNum);

    return createPaginationResponse(users, total, pageNum, limitNum);
  }
}

export const userService = new UserService();
