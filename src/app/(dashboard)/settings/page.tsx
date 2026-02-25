import { auth } from "@/lib/auth";
import { getNotificationPreferences } from "@/lib/actions/notifications";
import { getDeletionStatus } from "@/lib/actions/privacy";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { NotificationSettings } from "./notification-settings";
import { DangerZone } from "./danger-zone";
import { ExportDataButton } from "./export-data-button";

export default async function SettingsPage() {
  const session = await auth();
  const prefs = await getNotificationPreferences();
  const deletion = await getDeletionStatus();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Name</span>
            <span>{session?.user?.name || "—"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Email</span>
            <span>{session?.user?.email}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notification Preferences</CardTitle>
          <CardDescription>Control which notifications you receive</CardDescription>
        </CardHeader>
        <CardContent>
          {prefs && <NotificationSettings preferences={prefs} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Data</CardTitle>
          <CardDescription>Export or delete your personal data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ExportDataButton />
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-lg text-red-700">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <DangerZone
            hasPendingDeletion={deletion?.status === "pending"}
            scheduledAt={deletion?.scheduledAt}
          />
        </CardContent>
      </Card>
    </div>
  );
}
