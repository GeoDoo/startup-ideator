"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center space-y-4">
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="text-sm text-zinc-500">
            An unexpected error occurred. This has been logged automatically.
          </p>
          {error.digest && (
            <p className="text-xs text-zinc-400 font-mono">Error ID: {error.digest}</p>
          )}
          <div className="flex gap-3 justify-center pt-2">
            <Button onClick={reset}>Try Again</Button>
            <Button variant="outline" onClick={() => window.location.href = "/teams"}>
              Go to Teams
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
