"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { invitePartner } from "@/lib/actions/invitations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function InviteForm({ teamId }: { teamId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    setLoading(true);

    formData.set("teamId", teamId);
    const result = await invitePartner(formData);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    } else {
      setError(result.error || "Failed to send invitation");
    }
    setLoading(false);
  }

  return (
    <div>
      <p className="text-sm font-medium mb-2">Invite a partner</p>
      <form action={handleSubmit} className="flex gap-2">
        <Input
          name="email"
          type="email"
          required
          placeholder="partner@example.com"
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Sending..." : "Invite"}
        </Button>
      </form>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      {success && <p className="text-xs text-green-600 mt-1">Invitation sent!</p>}
    </div>
  );
}
