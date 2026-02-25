"use client";

import { useState } from "react";
import Link from "next/link";
import { createTeam } from "@/lib/actions/teams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const STAGES = [
  "Just an idea",
  "Exploring together",
  "Building MVP",
  "Launched",
  "Growing",
];

export default function NewTeamPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    const result = await createTeam(formData);
    if (!result.success) {
      setError(result.error || "Failed to create team");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <Link href="/teams" className="text-sm text-zinc-500 hover:text-zinc-700">
          ← Back to teams
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Create a new team</CardTitle>
          <CardDescription>
            Set up your partnership team. You can invite co-founders after creating it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Team Name</Label>
              <Input id="name" name="name" required placeholder="e.g., The Dream Team" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage">Stage (optional)</Label>
              <Select id="stage" name="stage">
                <option value="">Select a stage...</option>
                {STAGES.map((stage) => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain">Domain / Industry (optional)</Label>
              <Input id="domain" name="domain" placeholder="e.g., FinTech, HealthTech, SaaS" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Team"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
