"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { requestAccountDeletion, cancelAccountDeletion } from "@/lib/actions/privacy";
import { Button } from "@/components/ui/button";

export function DangerZone({
  hasPendingDeletion,
  scheduledAt,
}: {
  hasPendingDeletion: boolean;
  scheduledAt?: Date | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const confirmRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showConfirm) {
      confirmRef.current?.focus();
    }
  }, [showConfirm]);

  async function handleDelete() {
    setLoading(true);
    await requestAccountDeletion();
    router.refresh();
    setLoading(false);
    setShowConfirm(false);
  }

  async function handleCancel() {
    setLoading(true);
    await cancelAccountDeletion();
    router.refresh();
    setLoading(false);
  }

  if (hasPendingDeletion) {
    return (
      <div className="space-y-3">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700 font-medium">Account deletion scheduled</p>
          <p className="text-sm text-red-600 mt-1">
            Your account and all data will be permanently deleted on{" "}
            {scheduledAt ? new Date(scheduledAt).toLocaleDateString() : "in 30 days"}.
          </p>
        </div>
        <Button variant="outline" onClick={handleCancel} disabled={loading}>
          {loading ? "Cancelling..." : "Cancel Deletion Request"}
        </Button>
      </div>
    );
  }

  if (showConfirm) {
    return (
      <div className="space-y-3" ref={confirmRef} tabIndex={-1} role="alertdialog" aria-labelledby="danger-confirm-title">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p id="danger-confirm-title" className="text-sm text-red-700 font-medium">Are you sure?</p>
          <p className="text-sm text-red-600 mt-1">
            This will schedule your account for deletion in 30 days. You can cancel during this period.
            After 30 days, all your data will be permanently removed.
          </p>
          <ul className="text-sm text-red-600 mt-2 list-disc list-inside space-y-1">
            <li>Your assessment responses will be anonymized or removed</li>
            <li>Teams you created may be transferred or archived</li>
            <li>This action cannot be undone after the 30-day window</li>
          </ul>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Processing..." : "Confirm Deletion"}
          </Button>
          <Button variant="outline" onClick={() => setShowConfirm(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button variant="destructive" onClick={() => setShowConfirm(true)}>
      Delete My Account
    </Button>
  );
}
