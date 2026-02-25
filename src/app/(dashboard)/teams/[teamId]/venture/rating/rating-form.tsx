"use client";

import { useState } from "react";
import { rateVentureCandidate } from "@/lib/actions/venture";
import { Button } from "@/components/ui/button";

interface RatingData {
  excitement: number;
  confidence: number;
  fit: number;
  commitment: number;
  rank?: number | null;
  notes?: string | null;
}

const DIMENSIONS = [
  { key: "excitement", label: "Excitement", description: "How excited are you about this idea?" },
  { key: "confidence", label: "Confidence", description: "How confident are you it can succeed?" },
  { key: "fit", label: "Team Fit", description: "How well does it match your team's skills?" },
  { key: "commitment", label: "Commitment", description: "Would you commit to building this?" },
] as const;

export function RatingForm({
  candidateId,
  existing,
}: {
  candidateId: string;
  existing?: RatingData;
}) {
  const [ratings, setRatings] = useState<Record<string, number>>({
    excitement: existing?.excitement || 5,
    confidence: existing?.confidence || 5,
    fit: existing?.fit || 5,
    commitment: existing?.commitment || 5,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(!!existing);

  async function handleSave() {
    setSaving(true);
    const result = await rateVentureCandidate(candidateId, {
      excitement: ratings.excitement,
      confidence: ratings.confidence,
      fit: ratings.fit,
      commitment: ratings.commitment,
    });
    if (result.success) setSaved(true);
    setSaving(false);
  }

  return (
    <div className="space-y-3 pt-3 border-t border-zinc-100">
      {DIMENSIONS.map((dim) => (
        <div key={dim.key} className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium">{dim.label}</label>
            <span className="text-xs text-zinc-500">{ratings[dim.key]}/10</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={ratings[dim.key]}
            onChange={(e) => {
              setRatings((prev) => ({ ...prev, [dim.key]: Number(e.target.value) }));
              setSaved(false);
            }}
            className="w-full accent-zinc-900"
          />
          <p className="text-xs text-zinc-400">{dim.description}</p>
        </div>
      ))}

      <Button
        onClick={handleSave}
        disabled={saving}
        size="sm"
        variant={saved ? "secondary" : "default"}
        className="w-full"
      >
        {saving ? "Saving..." : saved ? "Saved ✓" : "Save Rating"}
      </Button>
    </div>
  );
}
