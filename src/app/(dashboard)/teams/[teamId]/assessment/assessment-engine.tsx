"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveResponse, submitAssessment } from "@/lib/actions/assessment";
import { type AssessmentSection, type Question } from "@/lib/assessment/questions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const DEBOUNCE_MS = 600;

interface Props {
  assessmentId: string;
  sections: AssessmentSection[];
  savedResponses: Record<string, unknown>;
  partners: { id: string; name: string }[];
  teamId: string;
}

export function AssessmentEngine({ assessmentId, sections, savedResponses, partners, teamId }: Props) {
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState(() => {
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const allAnswered = section.questions.every(
        (q) => savedResponses[`${section.key}:${q.key}`] !== undefined
      );
      if (!allAnswered) return i;
    }
    return sections.length - 1;
  });
  const [responses, setResponses] = useState<Record<string, unknown>>(savedResponses);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);
  const debounceTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const pendingSaves = useRef(0);

  const section = sections[currentSection];

  const getAnswer = useCallback(
    (sectionKey: string, questionKey: string) => {
      return responses[`${sectionKey}:${questionKey}`];
    },
    [responses]
  );

  const persistToServer = useCallback(
    async (sectionKey: string, questionKey: string, value: unknown) => {
      pendingSaves.current += 1;
      setSaving(true);
      try {
        await saveResponse(assessmentId, sectionKey, questionKey, value);
      } finally {
        pendingSaves.current -= 1;
        if (pendingSaves.current === 0) setSaving(false);
      }
    },
    [assessmentId]
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

  const sectionComplete = (sectionIndex: number) => {
    const s = sections[sectionIndex];
    return s.questions
      .filter((q) => q.required)
      .every((q) => {
        const val = responses[`${s.key}:${q.key}`];
        if (val === undefined || val === null) return false;
        if (typeof val === "string" && val.trim() === "") return false;
        return true;
      });
  };

  const allComplete = sections.every((_, i) => sectionComplete(i));

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const result = await submitAssessment(assessmentId);
    if (result.success) {
      router.push(`/teams/${teamId}/assessment`);
      router.refresh();
    } else {
      setError(result.error || "Submission failed");
      setSubmitting(false);
    }
  }

  if (showReview) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Review Your Answers</h2>
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {sections.map((s, si) => (
          <Card key={s.key}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{s.title}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCurrentSection(si);
                    setShowReview(false);
                  }}
                >
                  Edit
                </Button>
              </div>
              <div className="space-y-3">
                {s.questions.map((q) => {
                  const answer = getAnswer(s.key, q.key);
                  return (
                    <div key={q.key} className="text-sm">
                      <p className="text-zinc-500">{q.label}</p>
                      <p className="mt-0.5">
                        {answer === undefined
                          ? "—"
                          : typeof answer === "object"
                            ? JSON.stringify(answer, null, 2).slice(0, 200)
                            : String(answer)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowReview(false)}>
            Back to Editing
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !allComplete}>
            {submitting ? "Submitting..." : "Submit Assessment"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-1">
        {sections.map((s, i) => (
          <button
            key={s.key}
            onClick={() => setCurrentSection(i)}
            className={`flex-1 h-2 rounded-full transition-colors ${
              i === currentSection
                ? "bg-zinc-900"
                : sectionComplete(i)
                  ? "bg-green-500"
                  : "bg-zinc-200"
            }`}
            title={s.title}
          />
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-zinc-500">
        <span>
          Section {currentSection + 1} of {sections.length}: {section.title}
        </span>
        <span>{saving ? "Saving..." : "All changes saved"}</span>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <p className="text-sm text-zinc-500 mt-1">{section.description}</p>
          </div>

          {section.questions.map((question) => (
            <QuestionRenderer
              key={question.key}
              question={question}
              sectionKey={section.key}
              value={getAnswer(section.key, question.key)}
              onChange={(val, debounce) => setAnswer(section.key, question.key, val, debounce)}
              partners={partners}
            />
          ))}
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
        {currentSection < sections.length - 1 ? (
          <Button onClick={() => setCurrentSection((prev) => prev + 1)}>
            Next Section
          </Button>
        ) : (
          <Button onClick={() => setShowReview(true)} disabled={!allComplete}>
            Review & Submit
          </Button>
        )}
      </div>
    </div>
  );
}

function QuestionRenderer({
  question,
  sectionKey,
  value,
  onChange,
  partners,
}: {
  question: Question;
  sectionKey: string;
  value: unknown;
  onChange: (val: unknown, debounce?: boolean) => void;
  partners: { id: string; name: string }[];
}) {
  const minLengthWarning =
    question.minLength &&
    typeof value === "string" &&
    value.length > 0 &&
    value.length < question.minLength;

  return (
    <div className="space-y-2 py-4 border-t border-zinc-100 first:border-t-0 first:pt-0">
      <label className="text-sm font-medium">
        {question.label}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {question.description && (
        <p className="text-xs text-zinc-400">{question.description}</p>
      )}

      {question.type === "free-text" && (
        <>
          <textarea
            className="w-full min-h-[100px] rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value, true)}
            placeholder="Type your answer..."
          />
          {minLengthWarning && (
            <p className="text-xs text-amber-600">
              Please elaborate — thoughtful answers lead to better insights
              ({question.minLength! - (value as string).length} more characters)
            </p>
          )}
        </>
      )}

      {question.type === "single-select" && (
        <div className="space-y-2">
          {question.options?.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                value === opt.value
                  ? "border-zinc-900 bg-zinc-50"
                  : "border-zinc-200 hover:border-zinc-300"
              }`}
            >
              <input
                type="radio"
                name={`${sectionKey}:${question.key}`}
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
                className="mt-0.5"
              />
              <div>
                <span className="text-sm font-medium">{opt.label}</span>
                {opt.description && (
                  <p className="text-xs text-zinc-400 mt-0.5">{opt.description}</p>
                )}
              </div>
            </label>
          ))}
        </div>
      )}

      {question.type === "multi-select" && (
        <div className="space-y-2">
          {question.options?.map((opt) => {
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
                    onChange(next);
                  }}
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            );
          })}
        </div>
      )}

      {question.type === "slider" && (
        <div className="space-y-1">
          <input
            type="range"
            min={question.min || 1}
            max={question.max || 10}
            value={(value as number) || question.min || 1}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full accent-zinc-900"
          />
          <div className="flex justify-between text-xs text-zinc-400">
            <span>{question.min || 1}</span>
            <span className="font-medium text-zinc-700">{(value as number) || "—"}</span>
            <span>{question.max || 10}</span>
          </div>
        </div>
      )}

      {question.type === "number" && (
        <input
          type="number"
          min={question.min}
          max={question.max}
          value={(value as number) ?? ""}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
          className="max-w-[200px] h-10 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
      )}

      {question.type === "ranking" && (
        <RankingInput
          options={question.options || []}
          value={(value as string[]) || []}
          onChange={(v) => onChange(v)}
        />
      )}

      {question.type === "spectrum" && (
        <div className="space-y-4">
          {question.spectrums?.map((sp, i) => {
            const values = (value as number[]) || [];
            return (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>{sp.left}</span>
                  <span>{sp.right}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={values[i] || 5}
                  onChange={(e) => {
                    const next = [...values];
                    while (next.length <= i) next.push(5);
                    next[i] = Number(e.target.value);
                    onChange(next);
                  }}
                  className="w-full accent-zinc-900"
                />
                <div className="text-center text-xs text-zinc-500">
                  {values[i] || 5}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {question.type === "skill-rating" && (
        <div className="space-y-3">
          {question.categories?.map((cat) => {
            const ratings = (value as Record<string, number>) || {};
            return (
              <div key={cat.key} className="flex items-center gap-4">
                <div className="min-w-[180px]">
                  <p className="text-sm font-medium">{cat.label}</p>
                  {cat.examples && (
                    <p className="text-xs text-zinc-400">{cat.examples}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: (question.max || 5) + 1 }, (_, n) => (
                    <button
                      key={n}
                      onClick={() =>
                        onChange({ ...ratings, [cat.key]: n })
                      }
                      className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                        ratings[cat.key] === n
                          ? "bg-zinc-900 text-white"
                          : "bg-zinc-100 hover:bg-zinc-200"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {question.type === "scenario" && (
        <div className="space-y-4">
          {question.scenarios?.map((scenario, i) => {
            const answers = (value as { text: string; intensity: number }[]) || [];
            const answer = answers[i] || { text: "", intensity: 5 };
            return (
              <div key={i} className="p-4 rounded-lg border border-zinc-200 space-y-3">
                <p className="text-sm font-medium">{scenario}</p>
                <textarea
                  className="w-full min-h-[80px] rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                  placeholder="What would you do and how would you feel?"
                  value={answer.text}
                  onChange={(e) => {
                    const next = [...answers];
                    while (next.length <= i) next.push({ text: "", intensity: 5 });
                    next[i] = { ...next[i], text: e.target.value };
                    onChange(next, true);
                  }}
                />
                <div className="space-y-1">
                  <label className="text-xs text-zinc-500">
                    Emotional intensity: {answer.intensity}/10
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={answer.intensity}
                    onChange={(e) => {
                      const next = [...answers];
                      while (next.length <= i) next.push({ text: "", intensity: 5 });
                      next[i] = { ...next[i], intensity: Number(e.target.value) };
                      onChange(next);
                    }}
                    className="w-full accent-zinc-900"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {question.type === "partner-reflection" && (
        <div className="space-y-6">
          {partners.map((partner) => {
            const reflections = (value as Record<string, Record<string, string | number>>) || {};
            const partnerRefl = reflections[partner.id] || {};
            const updatePartner = (field: string, val: string | number, debounce?: boolean) => {
              onChange(
                { ...reflections, [partner.id]: { ...partnerRefl, [field]: val } },
                debounce
              );
            };
            return (
              <div key={partner.id} className="p-4 rounded-lg border border-zinc-200 space-y-3">
                <h4 className="font-medium">About {partner.name}</h4>
                {[
                  { key: "how-long", label: "How long have you known this person?" },
                  { key: "context", label: "In what context? (work, school, friends, met recently)" },
                  { key: "admire", label: "What do you admire most about them?" },
                  { key: "concerns", label: "What concerns you most about working with them?" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="text-xs text-zinc-500">{field.label}</label>
                    <textarea
                      className="w-full min-h-[60px] rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                      value={(partnerRefl[field.key] as string) || ""}
                      onChange={(e) => updatePartner(field.key, e.target.value, true)}
                    />
                  </div>
                ))}
                {[
                  { key: "trust-judgment", label: "How much do you trust their judgment? (1-10)" },
                  { key: "know-work-ethic", label: "How well do you know their work ethic? (1-10)" },
                ].map((field) => (
                  <div key={field.key} className="space-y-1">
                    <label className="text-xs text-zinc-500">{field.label}</label>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={(partnerRefl[field.key] as number) || 5}
                      onChange={(e) => updatePartner(field.key, Number(e.target.value))}
                      className="w-full accent-zinc-900"
                    />
                    <div className="text-center text-xs text-zinc-500">
                      {(partnerRefl[field.key] as number) || 5}
                    </div>
                  </div>
                ))}
                <div>
                  <label className="text-xs text-zinc-500">
                    Have you ever had a conflict? How was it resolved?
                  </label>
                  <textarea
                    className="w-full min-h-[60px] rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                    value={(partnerRefl["conflict-history"] as string) || ""}
                    onChange={(e) => updatePartner("conflict-history", e.target.value, true)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RankingInput({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string[];
  onChange: (val: string[]) => void;
}) {
  const ranked = value.length > 0 ? value : options.map((o) => o.value);

  function moveItem(index: number, direction: "up" | "down") {
    const next = [...ranked];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= next.length) return;
    [next[index], next[newIndex]] = [next[newIndex], next[index]];
    onChange(next);
  }

  const labelMap = Object.fromEntries(options.map((o) => [o.value, o.label]));

  return (
    <div className="space-y-1">
      {ranked.map((item, i) => (
        <div
          key={item}
          className="flex items-center gap-3 p-2 rounded-lg border border-zinc-200 bg-white"
        >
          <span className="text-xs font-medium text-zinc-400 w-6 text-center">{i + 1}</span>
          <span className="flex-1 text-sm">{labelMap[item] || item}</span>
          <div className="flex gap-1">
            <button
              onClick={() => moveItem(i, "up")}
              disabled={i === 0}
              className="p-1 text-xs text-zinc-400 hover:text-zinc-700 disabled:opacity-30"
            >
              ▲
            </button>
            <button
              onClick={() => moveItem(i, "down")}
              disabled={i === ranked.length - 1}
              className="p-1 text-xs text-zinc-400 hover:text-zinc-700 disabled:opacity-30"
            >
              ▼
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
