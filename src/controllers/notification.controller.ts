import { Elysia, t } from 'elysia';
import { notificationService } from '../services/notification.service';
import { jwtPlugin } from '../middleware/auth';
import { getUserFromToken } from '../utils/auth-helper';

export const notificationController = new Elysia({ prefix: '/notifications' })
  .use(jwtPlugin)
  .get(
    '/',
    async ({ jwt, headers, query }: any) => {
      const user = await getUserFromToken(jwt, headers);
      const limit = query.limit ? parseInt(query.limit as string) : 20;
      const skip = query.skip ? parseInt(query.skip as string) : 0;

      const notifications = await notificationService.getUserNotifications(
        user.userId,
        limit,
        skip
      );

      return {
        success: true,
        data: notifications,
      };
    },
    {
      query: t.Object({
        limit: t.Optional(t.String()),
        skip: t.Optional(t.String()),
      }),
      detail: {
        tags: ['Notifications'],
        summary: 'Get user notifications',
        description: 'Get paginated list of notifications for the authenticated user',
      },
    }
  )
  .get(
    '/unread-count',
    async ({ jwt, headers }: any) => {
      const user = await getUserFromToken(jwt, headers);
      const count = await notificationService.getUnreadCount(user.userId);

      return {
        success: true,
        data: { count },
      };
    },
    {
      detail: {
        tags: ['Notifications'],
        summary: 'Get unread notification count',
        description: 'Get the count of unread notifications for the authenticated user',
      },
    }
  )
  .patch(
    '/:id/read',
    async ({ params, set }) => {
      const notification = await notificationService.markAsRead(params.id);

      if (!notification) {
        set.status = 404;
        return {
          success: false,
          error: 'Notification not found',
        };
      }

      return {
        success: true,
        data: notification,
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['Notifications'],
        summary: 'Mark notification as read',
        description: 'Mark a specific notification as read',
      },
    }
  )
  .patch(
    '/read-all',
    async ({ jwt, headers }: any) => {
      const user = await getUserFromToken(jwt, headers);
      await notificationService.markAllAsRead(user.userId);

      return {
        success: true,
        message: 'All notifications marked as read',
      };
    },
    {
      detail: {
        tags: ['Notifications'],
        summary: 'Mark all notifications as read',
        description: 'Mark all notifications as read for the authenticated user',
      },
    }
  )
  .delete(
    '/:id',
    async ({ params, set }) => {
      const deleted = await notificationService.deleteNotification(params.id);

      if (!deleted) {
        set.status = 404;
        return {
          success: false,
          error: 'Notification not found',
        };
      }

      return {
        success: true,
        message: 'Notification deleted',
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['Notifications'],
        summary: 'Delete notification',
        description: 'Delete a specific notification',
      },
    }
  );
