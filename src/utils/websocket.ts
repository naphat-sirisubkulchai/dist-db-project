import { ServerWebSocket } from 'bun';
import { INotification } from '../models/Notification';

interface WebSocketData {
  userId?: string;
}

class WebSocketManager {
  private connections: Map<string, Set<ServerWebSocket<WebSocketData>>> = new Map();

  addConnection(userId: string, ws: ServerWebSocket<WebSocketData>) {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId)?.add(ws);
    console.log(`User ${userId} connected. Total connections: ${this.connections.get(userId)?.size}`);
  }

  removeConnection(userId: string, ws: ServerWebSocket<WebSocketData>) {
    const userConnections = this.connections.get(userId);
    if (userConnections) {
      userConnections.delete(ws);
      if (userConnections.size === 0) {
        this.connections.delete(userId);
      }
    }
    console.log(`User ${userId} disconnected. Remaining connections: ${userConnections?.size || 0}`);
  }

  sendToUser(userId: string, notification: INotification) {
    const userConnections = this.connections.get(userId);
    if (userConnections && userConnections.size > 0) {
      const message = JSON.stringify({
        type: 'notification',
        data: notification
      });

      userConnections.forEach(ws => {
        try {
          ws.send(message);
        } catch (error) {
          console.error(`Error sending notification to user ${userId}:`, error);
        }
      });

      return true;
    }
    return false;
  }

  isUserOnline(userId: string): boolean {
    return this.connections.has(userId) && (this.connections.get(userId)?.size || 0) > 0;
  }

  getOnlineUsersCount(): number {
    return this.connections.size;
  }
}

export const wsManager = new WebSocketManager();
