"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { revokeInvitation } from "@/lib/actions/invitations";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Invitation {
  id: string;
  email: string;
  status: string;
  expiresAt: Date;
  createdAt: Date;
}

export function PendingInvitations({ invitations }: { invitations: Invitation[] }) {
  const router = useRouter();
  const [revoking, setRevoking] = useState<string | null>(null);

  async function handleRevoke(invitationId: string) {
    setRevoking(invitationId);
    await revokeInvitation(invitationId);
    router.refresh();
    setRevoking(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Pending Invitations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {invitations.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">{inv.email}</p>
                <p className="text-xs text-zinc-500">
                  Expires {new Date(inv.expiresAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="warning">Pending</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRevoke(inv.id)}
                  disabled={revoking === inv.id}
                >
                  {revoking === inv.id ? "Revoking..." : "Revoke"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
