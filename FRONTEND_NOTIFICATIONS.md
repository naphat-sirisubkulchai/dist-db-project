# Frontend Notification Implementation

Complete guide for the frontend notification system with real-time WebSocket support.

## Features

- **Real-time notifications** via WebSocket connection
- **Notification bell** with unread count badge
- **Dropdown UI** for viewing notifications
- **Browser notifications** (with user permission)
- **Mark as read/unread** functionality
- **Delete notifications** individually
- **Load more** pagination support
- **Auto-reconnect** WebSocket on disconnect

## Setup

### 1. Environment Variables

Create a `.env.local` file in the `frontend` directory:

```bash
cp .env.local.example .env.local
```

Update the values:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

### 2. Install Dependencies

All dependencies are already included in the Next.js project.

## Architecture

### Components

#### 1. **NotificationBell** (`src/components/notifications/NotificationBell.tsx`)
- Bell icon with unread count badge
- Click to open/close notification dropdown
- Auto-closes when clicking outside

#### 2. **NotificationList** (`src/components/notifications/NotificationList.tsx`)
- Displays list of notifications
- "Mark all as read" button
- Load more pagination
- Empty state

#### 3. **NotificationItem** (`src/components/notifications/NotificationItem.tsx`)
- Individual notification display
- Type-specific icons and messages
- Time ago formatting
- Delete button
- Click to navigate to related post

#### 4. **Navbar** (`src/components/layout/Navbar.tsx`)
- Top navigation with notification bell
- User menu
- Authentication links

### Context & State Management

#### **NotificationProvider** (`src/context/notification-context.tsx`)

Provides notification state and WebSocket management:

```typescript
const {
  notifications,        // Array of notifications
  unreadCount,         // Number of unread notifications
  isLoading,           // Loading state
  markAsRead,          // Mark single notification as read
  markAllAsRead,       // Mark all notifications as read
  deleteNotification,  // Delete a notification
  loadMore,            // Load more notifications
  hasMore,             // Whether more notifications available
} = useNotifications();
```

### API Service

#### **notificationService** (`src/services/api.ts`)

```typescript
// Get all notifications
notificationService.getAll(limit, skip)

// Get unread count
notificationService.getUnreadCount()

// Mark as read
notificationService.markAsRead(notificationId)

// Mark all as read
notificationService.markAllAsRead()

// Delete notification
notificationService.delete(notificationId)
```

## WebSocket Integration

### Connection Flow

1. **Authentication**: WebSocket connects with JWT token as query parameter
2. **Auto-connect**: Automatically connects when user logs in
3. **Auto-disconnect**: Disconnects when user logs out
4. **Real-time updates**: New notifications appear instantly

### Message Format

**Connection Message:**
```json
{
  "type": "connected",
  "message": "Connected to notification stream"
}
```

**Notification Message:**
```json
{
  "type": "notification",
  "data": {
    "_id": "...",
    "sender": { "username": "...", "avatar": "..." },
    "type": "post_like",
    "post": { "title": "...", "slug": "..." },
    "read": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Notification Types

| Type | Icon | Description |
|------|------|-------------|
| `post_like` | ❤️ | Someone liked your post |
| `comment` | 💬 | Someone commented on your post |
| `comment_reply` | ↩️ | Someone replied to your comment |
| `comment_like` | 👍 | Someone liked your comment |

## Browser Notifications

The app requests notification permission on mount. When granted:
- New notifications trigger browser notifications
- Works even when tab is not focused
- Shows notification message and icon

## Usage Example

### Basic Usage

Notifications are automatically available throughout the app via the context:

```typescript
'use client';

import { useNotifications } from '@/context/notification-context';

export function MyComponent() {
  const { notifications, unreadCount } = useNotifications();

  return (
    <div>
      <p>You have {unreadCount} unread notifications</p>
      {notifications.map(n => (
        <div key={n._id}>{n.sender.username}</div>
      ))}
    </div>
  );
}
```

### Mark Notification as Read

```typescript
const { markAsRead } = useNotifications();

<button onClick={() => markAsRead(notificationId)}>
  Mark as read
</button>
```

### Delete Notification

```typescript
const { deleteNotification } = useNotifications();

<button onClick={() => deleteNotification(notificationId)}>
  Delete
</button>
```

## Styling

The notification components use Tailwind CSS classes. Key styles:

- **Bell badge**: Red circle with white text
- **Dropdown**: White card with shadow
- **Unread items**: Blue background
- **Hover states**: Gray backgrounds
- **Icons**: Type-specific emojis

## Customization

### Change Notification Icons

Edit `NotificationItem.tsx` in the `getNotificationContent()` function:

```typescript
case NotificationType.POST_LIKE:
  return {
    icon: '❤️', // Change this icon
    // ...
  };
```

### Adjust Dropdown Size

Edit `NotificationList.tsx`:

```typescript
<div className="max-h-96 overflow-y-auto"> {/* Change max-h-96 */}
```

### Change Pagination Limit

Edit `notification-context.tsx`:

```typescript
const response = await notificationService.getAll(20, skip); // Change 20
```

## Troubleshooting

### WebSocket Not Connecting

1. Check API server is running
2. Verify `NEXT_PUBLIC_WS_URL` in `.env.local`
3. Check browser console for connection errors
4. Ensure JWT token is valid

### Notifications Not Appearing

1. Check WebSocket connection status in console
2. Verify backend is sending notification events
3. Check network tab for WebSocket messages
4. Ensure user is logged in

### Browser Notifications Not Working

1. Check notification permission in browser settings
2. Ensure HTTPS in production (required for notifications)
3. Verify notification permission was granted

## Performance

- **WebSocket**: Single persistent connection
- **Pagination**: Load 20 notifications at a time
- **Lazy loading**: Only fetch more when needed
- **Optimistic updates**: Instant UI updates
- **Auto-cleanup**: WebSocket closes on unmount

## Security

- **JWT Authentication**: WebSocket requires valid token
- **Auto-disconnect**: Closes connection on logout
- **HTTPS**: Required for browser notifications in production
- **CORS**: Configured for WebSocket connections
