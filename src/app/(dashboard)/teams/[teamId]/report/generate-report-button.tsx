"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateReport } from "@/lib/actions/report";
import { Button } from "@/components/ui/button";

export function GenerateReportButton({ teamId }: { teamId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    const result = await generateReport(teamId);
    if (result.success) {
      router.refresh();
    } else {
      setError(result.error || "Generation failed");
      setLoading(false);
    }
  }

  return (
    <div className="text-center">
      <Button onClick={handleGenerate} disabled={loading} size="lg">
        {loading ? "Generating Report..." : "Generate Compatibility Report"}
      </Button>
      {loading && (
        <p className="text-sm text-zinc-500 mt-3">
          This may take up to a minute. Please don&apos;t close this page.
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 mt-3">{error}</p>
      )}
    </div>
  );
}
