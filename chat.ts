import {
  WebSocket,
  isWebSocketCloseEvent,v4,camelize
} from "./deps.ts";

const users = new Map<string, WebSocket>();

function broadcast(message: string, senderId?: string): void {
  if (!message) return;
  for (const user of users.values()) {
    user.send(senderId ? `[${senderId}]: ${message}` : message);
  }
}

export async function chat(ws: WebSocket): Promise<void> {
  const userId = v4.generate();

  // Register user connection
  users.set(userId, ws);
  broadcast(`${userId} is connected`);

  // Wait for new messages
  for await (const event of ws) {
    const message = camelize(typeof event === "string" ? event : "");

    broadcast(message, userId);

    // Unregister user connection
    if (!message && isWebSocketCloseEvent(event)) {
      users.delete(userId);
      broadcast(`${userId} is disconnected`);
      break;
    }
  }
}
