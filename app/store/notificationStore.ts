import { apiFetch } from "../lib/apiClient";

export type AppNotification = {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  relatedDonationId?: string;
  relatedRequestId?: string;
};

export async function fetchNotifications(userId: string): Promise<AppNotification[]> {
  const res = await apiFetch("/api/notifications", { userId });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchUnreadNotificationCount(userId: string): Promise<number> {
  const res = await apiFetch("/api/notifications/unread-count", { userId });
  if (!res.ok) return 0;
  const data = await res.json();
  return typeof data.count === "number" ? data.count : 0;
}

export async function markNotificationRead(userId: string, notificationId: string) {
  await apiFetch("/api/notifications/read", {
    method: "PATCH",
    userId,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, notificationId }),
  });
}

export async function markAllNotificationsRead(userId: string) {
  await apiFetch("/api/notifications/read", {
    method: "PATCH",
    userId,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, markAll: true }),
  });
}
