"use client";

import { useState } from "react";
import { exportUserData } from "@/lib/actions/privacy";
import { Button } from "@/components/ui/button";

export function ExportDataButton() {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    const data = await exportUserData();
    if (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cofounder-data-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setLoading(false);
  }

  return (
    <Button onClick={handleExport} disabled={loading} variant="outline">
      {loading ? "Preparing export..." : "Export My Data (JSON)"}
    </Button>
  );
}
