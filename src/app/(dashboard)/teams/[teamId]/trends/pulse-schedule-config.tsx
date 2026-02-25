"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { configurePulseSchedule } from "@/lib/actions/pulse";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

const FREQUENCIES = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every 2 weeks" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
];

export function PulseScheduleConfig({
  teamId,
  currentFrequency,
}: {
  teamId: string;
  currentFrequency?: string;
}) {
  const router = useRouter();
  const [frequency, setFrequency] = useState(currentFrequency || "monthly");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await configurePulseSchedule(teamId, frequency);
    router.refresh();
    setSaving(false);
  }

  return (
    <div className="flex gap-2">
      <Select
        value={frequency}
        onChange={(e) => setFrequency(e.target.value)}
        className="flex-1"
      >
        {FREQUENCIES.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </Select>
      <Button onClick={handleSave} disabled={saving} size="sm">
        {saving ? "Saving..." : currentFrequency ? "Update" : "Enable"}
      </Button>
    </div>
  );
}
