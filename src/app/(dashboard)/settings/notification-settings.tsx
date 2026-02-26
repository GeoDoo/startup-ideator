"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateNotificationPreferences } from "@/lib/actions/notifications";

interface Prefs {
  emailInvitations: boolean;
  emailAssessments: boolean;
  emailReports: boolean;
  emailPulseSurveys: boolean;
  emailDigest: boolean;
  inAppAll: boolean;
}

const PREF_LABELS: { key: keyof Prefs; label: string }[] = [
  { key: "emailInvitations", label: "Email — Partner invitations" },
  { key: "emailAssessments", label: "Email — Assessment reminders" },
  { key: "emailReports", label: "Email — Report ready" },
  { key: "emailPulseSurveys", label: "Email — Pulse survey reminders" },
  { key: "emailDigest", label: "Email — Weekly digest instead of individual emails" },
  { key: "inAppAll", label: "In-app — All notifications" },
];

export function NotificationSettings({ preferences }: { preferences: Prefs }) {
  const router = useRouter();
  const [prefs, setPrefs] = useState(preferences);
  const [saving, setSaving] = useState(false);

  async function toggle(key: keyof Prefs) {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    setSaving(true);
    await updateNotificationPreferences({ [key]: updated[key] });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {PREF_LABELS.map(({ key, label }) => (
        <label key={key} className="flex items-center justify-between py-1">
          <span className="text-sm">{label}</span>
          <button
            type="button"
            role="switch"
            aria-checked={prefs[key]}
            aria-label={label}
            onClick={() => toggle(key)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              prefs[key] ? "bg-zinc-900" : "bg-zinc-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                prefs[key] ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </label>
      ))}
      {saving && <p className="text-xs text-zinc-400">Saving...</p>}
    </div>
  );
}
