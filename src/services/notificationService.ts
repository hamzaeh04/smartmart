import { db, delay } from "./mock/db";
import { generateId } from "@/utils/id";
import type { AppNotification, NotificationType } from "@/types";

export async function listNotifications(): Promise<AppNotification[]> {
  return delay(
    [...db.notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    250,
  );
}

export async function markAsRead(id: string): Promise<void> {
  const notif = db.notifications.find((n) => n.id === id);
  if (notif) notif.read = true;
  return delay(undefined, 150);
}

export async function markAllAsRead(): Promise<void> {
  db.notifications.forEach((n) => (n.read = true));
  return delay(undefined, 200);
}

/** Internal helper used by other mock services to push a new notification. */
export function pushNotification(type: NotificationType, title: string, message: string, link?: string): AppNotification {
  const notification: AppNotification = {
    id: generateId("notif"),
    type,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
    link,
  };
  db.notifications.unshift(notification);
  return notification;
}
