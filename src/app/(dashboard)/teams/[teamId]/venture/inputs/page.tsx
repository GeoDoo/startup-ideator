import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getTeamById } from "@/lib/actions/teams";
import { getOrCreateVentureInput } from "@/lib/actions/venture";
import { VENTURE_SECTIONS } from "@/lib/assessment/venture-questions";
import { VentureInputEngine } from "./venture-input-engine";

export default async function VentureInputsPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const team = await getTeamById(teamId);
  if (!team) notFound();

  if (team.members.length < 2) redirect(`/teams/${teamId}`);

  const input = await getOrCreateVentureInput(teamId);
  if (!input) notFound();

  if (input.status === "completed") {
    return (
      <div className="space-y-6">
        <Link href={`/teams/${teamId}/venture`} className="text-sm text-zinc-500 hover:text-zinc-700">
          ← Back to venture discovery
        </Link>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-green-800">Inputs Submitted</h2>
          <p className="text-green-600 mt-1">You&apos;ve completed your venture inputs.</p>
        </div>
      </div>
    );
  }

  const responses = (input.responses as Record<string, Record<string, unknown>>) || {};
  const savedResponses: Record<string, unknown> = {};
  for (const [sectionKey, questions] of Object.entries(responses)) {
    for (const [questionKey, answer] of Object.entries(questions)) {
      savedResponses[`${sectionKey}:${questionKey}`] = answer;
    }
  }

  return (
    <div className="space-y-6">
      <Link href={`/teams/${teamId}/venture`} className="text-sm text-zinc-500 hover:text-zinc-700">
        ← Back to venture discovery
      </Link>
      <div>
        <h1 className="text-2xl font-bold">Venture Inputs</h1>
        <p className="text-zinc-500 mt-1">Tell us about your interests, skills, and what you want to build.</p>
      </div>

      <VentureInputEngine
        teamId={teamId}
        sections={VENTURE_SECTIONS}
        savedResponses={savedResponses}
      />
    </div>
  );
}
