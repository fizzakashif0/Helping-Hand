import { buildApiUrl } from "../lib/api";
import { apiFetch } from "../lib/apiClient";

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  senderId?: string;
  relatedDonationId?: string;
  relatedRequestId?: string;
};

let notifications: AppNotification[] = [];

type Subscriber = (items: AppNotification[]) => void;
const subscribers: Subscriber[] = [];

const API_URL = buildApiUrl("/api/notifications");

function mapBackendNotification(n: any): AppNotification {
  return {
    id: String(n._id),
    type: n.type,
    title: n.title,
    message: n.message,
    isRead: n.isRead || false,
    createdAt: n.createdAt || new Date().toISOString(),
    senderId: n.senderId ? String(n.senderId) : undefined,
    relatedDonationId: n.relatedDonationId ? String(n.relatedDonationId) : undefined,
    relatedRequestId: n.relatedRequestId ? String(n.relatedRequestId) : undefined,
  };
}

export function getNotifications() {
  return notifications.slice();
}

export async function fetchNotifications(userId: string) {
  try {
    const response = await apiFetch(`${API_URL}?userId=${encodeURIComponent(userId)}`, {
      userId,
    });
    if (!response.ok) throw new Error("Failed to fetch notifications");
    const data = await response.json();

    const converted = data.map((n: any) => mapBackendNotification(n));

    notifications = converted;
    notifySubscribers();
    return converted;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return notifications;
  }
}

export async function fetchUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const response = await apiFetch(
      `${API_URL}/unread-count?userId=${encodeURIComponent(userId)}`,
      { userId }
    );
    if (!response.ok) throw new Error("Failed to fetch unread count");
    const data = await response.json();
    return data.count || 0;
  } catch (error) {
    console.error("Error fetching unread notification count:", error);
    return 0;
  }
}

export async function markNotificationRead(
  userId: string,
  notificationId: string
): Promise<AppNotification | null> {
  try {
    const response = await fetch(`${API_URL}/read`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        notificationId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to mark notification as read");
    }

    const updated = await response.json();

    // Update local state
    const index = notifications.findIndex((n) => n.id === notificationId);
    if (index >= 0) {
      notifications[index] = mapBackendNotification(updated);
      notifySubscribers();
    }

    return mapBackendNotification(updated);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return null;
  }
}

export async function markAllNotificationsRead(userId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/read`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        markAll: true,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to mark all notifications as read");
    }

    // Mark all local notifications as read
    notifications = notifications.map((n) => ({
      ...n,
      isRead: true,
    }));
    notifySubscribers();

    return true;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }
}

function notifySubscribers() {
  subscribers.forEach((s) => s(getNotifications()));
}

export function subscribeToNotifications(cb: Subscriber) {
  subscribers.push(cb);
  return () => {
    const idx = subscribers.indexOf(cb);
    if (idx >= 0) subscribers.splice(idx, 1);
  };
}
