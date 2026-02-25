import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { getUnreadCount } from "@/lib/actions/notifications";

export async function Nav() {
  const session = await auth();
  const unreadCount = session?.user ? await getUnreadCount() : 0;

  return (
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/teams" className="text-lg font-bold tracking-tight">
            CoFounder
          </Link>
          {session?.user && (
            <div className="flex items-center gap-4">
              <Link href="/teams" className="text-sm text-zinc-500 hover:text-zinc-900">
                Teams
              </Link>
              <Link href="/notifications" className="text-sm text-zinc-500 hover:text-zinc-900 relative">
                Notifications
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-3 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {session?.user && (
            <>
              <Link href="/settings" className="text-sm text-zinc-500 hover:text-zinc-900">
                Settings
              </Link>
              <span className="text-sm text-zinc-400">{session.user.email}</span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button variant="ghost" size="sm" type="submit">
                  Sign Out
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
