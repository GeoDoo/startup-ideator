import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getTeamById } from "@/lib/actions/teams";
import { getOrCreatePulseAssessment } from "@/lib/actions/pulse";
import { PULSE_SECTIONS } from "@/lib/assessment/pulse-questions";
import { AssessmentEngine } from "../assessment/assessment-engine";

export default async function PulsePage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const team = await getTeamById(teamId);
  if (!team) notFound();

  const assessment = await getOrCreatePulseAssessment(teamId);
  if (!assessment) {
    redirect(`/teams/${teamId}/trends`);
  }

  if (assessment.status === "completed") {
    redirect(`/teams/${teamId}/trends`);
  }

  const responseMap: Record<string, unknown> = {};
  for (const resp of assessment.responses) {
    responseMap[`${resp.sectionKey}:${resp.questionKey}`] = resp.answer;
  }

  const partners = team.members.filter((m) => m.id !== assessment.memberId);

  return (
    <div className="space-y-6">
      <Link href={`/teams/${teamId}/trends`} className="text-sm text-zinc-500 hover:text-zinc-700">
        ← Back to trends
      </Link>
      <div>
        <h1 className="text-2xl font-bold">Pulse Survey</h1>
        <p className="text-zinc-500 mt-1">Quick check-in on your partnership health. Takes about 10 minutes.</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Your answers are anonymous.</strong> Only aggregated insights are shared.
        </p>
      </div>

      <AssessmentEngine
        assessmentId={assessment.id}
        sections={PULSE_SECTIONS}
        savedResponses={responseMap}
        partners={partners.map((p) => ({ id: p.id, name: p.user.name || "Partner" }))}
        teamId={teamId}
      />
    </div>
  );
}
