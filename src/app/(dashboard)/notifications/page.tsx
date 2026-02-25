import { getNotifications, markAllAsRead } from "@/lib/actions/notifications";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NotificationList } from "./notification-list";

export default async function NotificationsPage() {
  const notifications = await getNotifications();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {notifications.some((n) => !n.read) && (
          <form action={async () => {
            "use server";
            await markAllAsRead();
          }}>
            <Button variant="outline" size="sm" type="submit">
              Mark all as read
            </Button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-zinc-500">No notifications yet.</p>
          </CardContent>
        </Card>
      ) : (
        <NotificationList notifications={notifications} />
      )}
    </div>
  );
}
