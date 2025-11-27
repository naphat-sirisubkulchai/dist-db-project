import bcrypt from 'bcryptjs';
import { IUser } from '../models/User';
import { userRepository } from '../repositories/user.repository';
import { sanitizeUser } from '../utils/helpers';

export class AuthService {
  async register(email: string, username: string, password: string, name?: string) {
    // Check if user already exists
    const existingUserByEmail = await userRepository.findByEmail(email);
    if (existingUserByEmail) {
      throw new Error('Email already in use');
    }

    const existingUserByUsername = await userRepository.findByUsername(username);
    if (existingUserByUsername) {
      throw new Error('Username already taken');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await userRepository.create({
      email,
      username,
      password: hashedPassword,
      name,
    } as IUser);

    return sanitizeUser(user);
  }

  async login(emailOrUsername: string, password: string) {
    // Find user by email or username
    const user = await userRepository.findByEmailOrUsername(emailOrUsername);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    return sanitizeUser(user);
  }

  async getUserById(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, updates: Partial<IUser>) {
    // Don't allow updating sensitive fields
    const { password, email, ...safeUpdates } = updates as any;

    const user = await userRepository.update(userId, safeUpdates);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid current password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRepository.update(userId, { password: hashedPassword } as IUser);

    return { message: 'Password updated successfully' };
  }
}

export const authService = new AuthService();
