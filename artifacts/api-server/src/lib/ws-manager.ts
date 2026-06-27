import { WebSocket, WebSocketServer } from "ws";
import { IncomingMessage, Server } from "http";
import { logger } from "./logger";

export type NotificationType =
  | "booking_new"
  | "booking_confirmed"
  | "booking_cancelled"
  | "booking_completed";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  bookingId?: number;
  listingTitle?: string;
  amount?: number;
  createdAt: string;
}

// Map of userId → set of connected sockets
const connections = new Map<number, Set<WebSocket>>();

let wss: WebSocketServer | null = null;

export function initWebSocketServer(server: Server) {
  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const rawUserId = url.searchParams.get("userId");
    const userId = rawUserId ? parseInt(rawUserId, 10) : null;

    if (!userId || isNaN(userId)) {
      ws.close(1008, "userId required");
      return;
    }

    if (!connections.has(userId)) {
      connections.set(userId, new Set());
    }
    connections.get(userId)!.add(ws);

    logger.info({ userId }, "WebSocket client connected");

    // Send a welcome ping so the client knows it's live
    ws.send(JSON.stringify({ type: "connected", userId }));

    ws.on("close", () => {
      connections.get(userId)?.delete(ws);
      if (connections.get(userId)?.size === 0) {
        connections.delete(userId);
      }
      logger.info({ userId }, "WebSocket client disconnected");
    });

    ws.on("error", (err) => {
      logger.error({ err, userId }, "WebSocket error");
    });
  });

  logger.info("WebSocket server initialized at /ws");
}

export function sendNotification(userId: number, notification: Notification) {
  const sockets = connections.get(userId);
  if (!sockets || sockets.size === 0) return;

  const payload = JSON.stringify({ type: "notification", data: notification });
  for (const ws of sockets) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
  logger.info({ userId, notificationType: notification.type }, "Notification sent");
}

export function broadcastNotification(userIds: number[], notification: Notification) {
  for (const userId of userIds) {
    sendNotification(userId, notification);
  }
}
