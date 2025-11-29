import { Notification, INotification, NotificationType } from '../models/Notification';
import mongoose from 'mongoose';

class NotificationService {
  async createNotification(data: {
    recipient: mongoose.Types.ObjectId | string;
    sender: mongoose.Types.ObjectId | string;
    type: NotificationType;
    post?: mongoose.Types.ObjectId | string;
    comment?: mongoose.Types.ObjectId | string;
  }): Promise<INotification | null> {
    // Don't create notification if sender and recipient are the same
    if (data.recipient.toString() === data.sender.toString()) {
      return null;
    }

    const notification = await Notification.create(data);

    // Populate the notification for real-time delivery
    await notification.populate([
      { path: 'sender', select: 'username avatar' },
      { path: 'post', select: 'title slug' },
      { path: 'comment', select: 'content' }
    ]);

    return notification;
  }

  async getUserNotifications(
    userId: mongoose.Types.ObjectId | string,
    limit: number = 20,
    skip: number = 0
  ): Promise<INotification[]> {
    return await Notification.find({ recipient: userId })
      .populate('sender', 'username avatar')
      .populate('post', 'title slug')
      .populate('comment', 'content')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
  }

  async getUnreadCount(userId: mongoose.Types.ObjectId | string): Promise<number> {
    return await Notification.countDocuments({
      recipient: userId,
      read: false,
    });
  }

  async markAsRead(notificationId: string): Promise<INotification | null> {
    return await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
  }

  async markAllAsRead(userId: mongoose.Types.ObjectId | string): Promise<void> {
    await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true }
    );
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    const result = await Notification.findByIdAndDelete(notificationId);
    return !!result;
  }
}

export const notificationService = new NotificationService();
