"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { markAsRead } from "@/lib/actions/notifications";
import { Card, CardContent } from "@/components/ui/card";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: Date;
}

export function NotificationList({ notifications }: { notifications: Notification[] }) {
  const router = useRouter();

  async function handleClick(notification: Notification) {
    if (!notification.read) {
      await markAsRead(notification.id);
      router.refresh();
    }
  }

  return (
    <div className="space-y-2">
      {notifications.map((n) => (
        <Card
          key={n.id}
          className={`transition-colors ${!n.read ? "border-l-4 border-l-zinc-900 bg-zinc-50" : ""}`}
        >
          <CardContent className="py-4">
            {n.link ? (
              <Link
                href={n.link}
                onClick={() => handleClick(n)}
                className="block"
              >
                <NotificationContent notification={n} />
              </Link>
            ) : (
              <div onClick={() => handleClick(n)} className="cursor-pointer">
                <NotificationContent notification={n} />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function NotificationContent({ notification }: { notification: Notification }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className={`text-sm ${notification.read ? "text-zinc-600" : "font-semibold"}`}>
          {notification.title}
        </h3>
        <span className="text-xs text-zinc-400">
          {new Date(notification.createdAt).toLocaleDateString()}
        </span>
      </div>
      <p className="text-sm text-zinc-500 mt-1">{notification.body}</p>
    </div>
  );
}
