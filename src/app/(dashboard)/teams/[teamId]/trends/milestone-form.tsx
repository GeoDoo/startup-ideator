"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { recordMilestone } from "@/lib/actions/pulse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function MilestoneForm({ teamId }: { teamId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!title.trim()) return;
    setSaving(true);
    await recordMilestone(teamId, title, description || undefined);
    setTitle("");
    setDescription("");
    router.refresh();
    setSaving(false);
  }

  return (
    <div className="space-y-2">
      <Input
        placeholder="Milestone title (e.g., 'Raised seed round')"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Input
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Button onClick={handleSubmit} disabled={saving || !title.trim()} size="sm" className="w-full">
        {saving ? "Recording..." : "Record Milestone"}
      </Button>
    </div>
  );
}
