"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveVentureInput, submitVentureInput } from "@/lib/actions/venture";
import { type VentureSection } from "@/lib/assessment/venture-questions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const DEBOUNCE_MS = 600;

interface Props {
  teamId: string;
  sections: VentureSection[];
  savedResponses: Record<string, unknown>;
}

export function VentureInputEngine({ teamId, sections, savedResponses }: Props) {
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState<Record<string, unknown>>(savedResponses);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const debounceTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const pendingSaves = useRef(0);

  const section = sections[currentSection];

  const persistToServer = useCallback(
    async (sectionKey: string, questionKey: string, value: unknown) => {
      pendingSaves.current += 1;
      setSaving(true);
      try {
        await saveVentureInput(teamId, sectionKey, questionKey, value);
      } finally {
        pendingSaves.current -= 1;
        if (pendingSaves.current === 0) setSaving(false);
      }
    },
    [teamId]
  );

  const setAnswer = useCallback(
    (sectionKey: string, questionKey: string, value: unknown, debounce = false) => {
      const key = `${sectionKey}:${questionKey}`;
      setResponses((prev) => ({ ...prev, [key]: value }));

      if (debounce) {
        const existing = debounceTimers.current.get(key);
        if (existing) clearTimeout(existing);
        setSaving(true);
        debounceTimers.current.set(
          key,
          setTimeout(() => {
            debounceTimers.current.delete(key);
            persistToServer(sectionKey, questionKey, value);
          }, DEBOUNCE_MS)
        );
      } else {
        persistToServer(sectionKey, questionKey, value);
      }
    },
    [persistToServer]
  );

  async function handleSubmit() {
    setSubmitting(true);
    const result = await submitVentureInput(teamId);
    if (result.success) {
      router.push(`/teams/${teamId}/venture`);
      router.refresh();
    }
    setSubmitting(false);
  }

  const isLastSection = currentSection === sections.length - 1;

  return (
    <div className="space-y-6">
      <div className="flex gap-1" role="tablist" aria-label="Venture input sections">
        {sections.map((s, i) => (
          <button
            key={s.key}
            role="tab"
            aria-selected={i === currentSection}
            aria-label={`Section ${i + 1}: ${s.title}`}
            onClick={() => setCurrentSection(i)}
            className={`flex-1 h-2 rounded-full transition-colors ${
              i === currentSection ? "bg-zinc-900" : i < currentSection ? "bg-green-500" : "bg-zinc-200"
            }`}
          />
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-zinc-500">
        <span>Section {currentSection + 1} of {sections.length}: {section.title}</span>
        <span>{saving ? "Saving..." : "Saved"}</span>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <p className="text-sm text-zinc-500 mt-1">{section.description}</p>
          </div>

          {section.questions.map((q) => {
            const value = responses[`${section.key}:${q.key}`];
            return (
              <div key={q.key} className="space-y-2 py-4 border-t border-zinc-100 first:border-t-0 first:pt-0">
                <label htmlFor={`vq-${section.key}-${q.key}`} className="text-sm font-medium">
                  {q.label}
                  {q.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {q.description && <p className="text-xs text-zinc-400">{q.description}</p>}

                {q.type === "free-text" && (
                  <textarea
                    id={`vq-${section.key}-${q.key}`}
                    className="w-full min-h-[100px] rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                    value={(value as string) || ""}
                    onChange={(e) => setAnswer(section.key, q.key, e.target.value, true)}
                    placeholder="Type your answer..."
                  />
                )}

                {q.type === "multi-select" && (
                  <div className="space-y-2">
                    {q.options?.map((opt) => {
                      const selected = Array.isArray(value) ? (value as string[]) : [];
                      const isSelected = selected.includes(opt.value);
                      return (
                        <label
                          key={opt.value}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            isSelected ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:border-zinc-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              const next = isSelected
                                ? selected.filter((v) => v !== opt.value)
                                : [...selected, opt.value];
                              setAnswer(section.key, q.key, next);
                            }}
                          />
                          <span className="text-sm">{opt.label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {q.type === "single-select" && (
                  <div className="space-y-2">
                    {q.options?.map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          value === opt.value ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:border-zinc-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`${section.key}:${q.key}`}
                          checked={value === opt.value}
                          onChange={() => setAnswer(section.key, q.key, opt.value)}
                        />
                        <span className="text-sm">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentSection((prev) => prev - 1)}
          disabled={currentSection === 0}
        >
          Previous
        </Button>
        {isLastSection ? (
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Inputs"}
          </Button>
        ) : (
          <Button onClick={() => setCurrentSection((prev) => prev + 1)}>
            Next Section
          </Button>
        )}
      </div>
    </div>
  );
}
