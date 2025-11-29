# Notification System

A real-time notification system for the blog platform with WebSocket support.

## Features

- **In-app notifications** stored in MongoDB
- **Real-time push notifications** via WebSocket
- **Notification types:**
  - Post likes - when someone likes your post
  - New comments - when someone comments on your post
  - Comment replies - when someone replies to your comment
  - Comment likes - when someone likes your comment

## API Endpoints

### Get Notifications
```
GET /notifications?limit=20&skip=0
Authorization: Bearer <token>
```

Returns paginated list of notifications for the authenticated user.

### Get Unread Count
```
GET /notifications/unread-count
Authorization: Bearer <token>
```

Returns the count of unread notifications.

### Mark as Read
```
PATCH /notifications/:id/read
Authorization: Bearer <token>
```

Marks a specific notification as read.

### Mark All as Read
```
PATCH /notifications/read-all
Authorization: Bearer <token>
```

Marks all notifications as read for the authenticated user.

### Delete Notification
```
DELETE /notifications/:id
Authorization: Bearer <token>
```

Deletes a specific notification.

## WebSocket Connection

Connect to the WebSocket endpoint to receive real-time notifications:

```
ws://localhost:3000/ws?token=<your-jwt-token>
```

### Connection Flow

1. **Connect** with JWT token as query parameter
2. **Receive** connection confirmation message
3. **Listen** for real-time notification events

### Message Format

**Connection Confirmation:**
```json
{
  "type": "connected",
  "message": "Connected to notification stream"
}
```

**Notification Event:**
```json
{
  "type": "notification",
  "data": {
    "_id": "notification_id",
    "recipient": "user_id",
    "sender": {
      "username": "johndoe",
      "avatar": "avatar_url"
    },
    "type": "post_like",
    "post": {
      "title": "Post Title",
      "slug": "post-slug"
    },
    "read": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Client Example

### JavaScript/TypeScript
```javascript
const token = 'your-jwt-token';
const ws = new WebSocket(`ws://localhost:3000/ws?token=${token}`);

ws.onopen = () => {
  console.log('Connected to notification stream');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === 'notification') {
    console.log('New notification:', data.data);
    // Update UI with new notification
  }
};

ws.onclose = () => {
  console.log('Disconnected from notification stream');
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};
```

## Implementation Details

### Models
- **Notification Model** (`src/models/Notification.ts`) - Stores notifications in MongoDB
- Notification types: `POST_LIKE`, `COMMENT`, `COMMENT_REPLY`, `COMMENT_LIKE`

### Services
- **Notification Service** (`src/services/notification.service.ts`) - CRUD operations for notifications
- Automatically prevents self-notifications (sender = recipient)

### WebSocket Manager
- **WebSocket Manager** (`src/utils/websocket.ts`) - Manages WebSocket connections
- Tracks user connections and sends real-time updates
- Handles multiple connections per user

### Integration
Notifications are automatically created when:
- A user likes a post (`src/services/post.service.ts:140`)
- A user comments on a post (`src/services/comment.service.ts:56`)
- A user replies to a comment (`src/services/comment.service.ts:43`)
- A user likes a comment (`src/services/comment.service.ts:137`)

## Testing

1. Start the server:
```bash
bun dev
```

2. Create a post and like it from another user
3. Check notifications endpoint or connect via WebSocket
4. Verify real-time notification delivery

## Notes

- Users will not receive notifications for their own actions
- WebSocket connections require valid JWT authentication
- Notifications are delivered in real-time only if the user is online
- All notifications are stored in the database regardless of online status
