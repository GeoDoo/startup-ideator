"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateVentureCandidates } from "@/lib/actions/venture";
import { Button } from "@/components/ui/button";

export function GenerateIdeasButton({
  teamId,
  variant = "default",
  label = "Generate Ideas",
}: {
  teamId: string;
  variant?: "default" | "outline";
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    const result = await generateVentureCandidates(teamId);
    if (result.success) {
      router.refresh();
    } else {
      setError(result.error || "Failed to generate ideas");
    }
    setLoading(false);
  }

  return (
    <div>
      <Button onClick={handleGenerate} disabled={loading} variant={variant}>
        {loading ? "Generating..." : label}
      </Button>
      {loading && (
        <p className="text-xs text-zinc-500 mt-2">This may take up to a minute...</p>
      )}
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}
