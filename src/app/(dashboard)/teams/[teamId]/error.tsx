"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function TeamError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Team page error:", error);
  }, [error]);

  return (
    <div className="space-y-6">
      <Link href="/teams" className="text-sm text-zinc-500 hover:text-zinc-700">
        ← Back to teams
      </Link>
      <Card>
        <CardContent className="pt-6 text-center space-y-4">
          <h2 className="text-lg font-semibold">Failed to load team data</h2>
          <p className="text-sm text-zinc-500">
            There was a problem loading this page. Check your connection and try again.
          </p>
          {error.digest && (
            <p className="text-xs text-zinc-400 font-mono">Error ID: {error.digest}</p>
          )}
          <div className="flex gap-3 justify-center pt-2">
            <Button onClick={reset}>Try Again</Button>
            <Link href="/teams">
              <Button variant="outline">Go to Teams</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
