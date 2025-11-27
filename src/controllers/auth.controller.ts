import { authService } from '../services/auth.service';

export class AuthController {
  async register(data: { email: string; username: string; password: string; name?: string }, jwt: any) {
    const user = await authService.register(data.email, data.username, data.password, data.name);

    const token = await jwt.sign({
      userId: user._id.toString(),
      username: user.username,
    });

    return {
      success: true,
      data: { user, token },
    };
  }

  async login(data: { emailOrUsername: string; password: string }, jwt: any) {
    const user = await authService.login(data.emailOrUsername, data.password);

    const token = await jwt.sign({
      userId: user._id.toString(),
      username: user.username,
    });

    return {
      success: true,
      data: { user, token },
    };
  }

  async getMe(userId: string) {
    const user = await authService.getUserById(userId);
    return {
      success: true,
      data: user,
    };
  }

  async updateProfile(userId: string, updates: any) {
    const user = await authService.updateProfile(userId, updates);
    return {
      success: true,
      data: user,
    };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const result = await authService.changePassword(userId, oldPassword, newPassword);
    return {
      success: true,
      data: result,
    };
  }
}

export const authController = new AuthController();
