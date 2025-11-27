import { userService } from '../services/user.service';

export class UserController {
  async searchUsers(query: string, page?: string, limit?: string) {
    const users = await userService.searchUsers(query, page, limit);
    return {
      success: true,
      data: users,
    };
  }

  async getUserProfile(username: string, currentUserId?: string) {
    const profile = await userService.getUserProfile(username, currentUserId);
    return {
      success: true,
      data: profile,
    };
  }

  async getFollowers(username: string, page?: string, limit?: string) {
    const followers = await userService.getFollowers(username, page, limit);
    return {
      success: true,
      data: followers,
    };
  }

  async getFollowing(username: string, page?: string, limit?: string) {
    const following = await userService.getFollowing(username, page, limit);
    return {
      success: true,
      data: following,
    };
  }

  async followUser(userId: string, targetUsername: string) {
    const targetUser = await userService.getUserByUsername(targetUsername);
    const result = await userService.followUser(userId, targetUser._id.toString());
    return {
      success: true,
      data: result,
    };
  }
}

export const userController = new UserController();
