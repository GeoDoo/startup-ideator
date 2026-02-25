"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { selectVenture } from "@/lib/actions/venture";
import { Button } from "@/components/ui/button";

export function SelectVentureButton({
  teamId,
  candidateId,
}: {
  teamId: string;
  candidateId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSelect() {
    if (!confirm("Select this as your venture? This can be changed later.")) return;
    setLoading(true);
    const result = await selectVenture(teamId, candidateId);
    if (result.success) {
      router.push(`/teams/${teamId}/venture/selection`);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <Button onClick={handleSelect} disabled={loading} size="sm" variant="outline">
      {loading ? "Selecting..." : "Select This Venture"}
    </Button>
  );
}
