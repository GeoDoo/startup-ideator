import { notFound } from "next/navigation";
import Link from "next/link";
import { getTeamById } from "@/lib/actions/teams";
import { getAlignmentReveal } from "@/lib/actions/venture";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SelectVentureButton } from "./select-venture-button";

export default async function AlignmentPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const team = await getTeamById(teamId);
  if (!team) notFound();

  const alignment = await getAlignmentReveal(teamId);

  if (!alignment || alignment.candidates.length === 0) {
    return (
      <div className="space-y-6">
        <Link href={`/teams/${teamId}/venture`} className="text-sm text-zinc-500 hover:text-zinc-700">
          ← Back to venture discovery
        </Link>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-zinc-500">
              All partners must rate the ideas before the alignment reveal.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const mutualTop = alignment.candidates.filter((c) => c.category === "mutual-top");
  const strongInterest = alignment.candidates.filter((c) => c.category === "strong-interest");
  const divergent = alignment.candidates.filter((c) => c.category === "divergent");

  return (
    <div className="space-y-6">
      <Link href={`/teams/${teamId}/venture`} className="text-sm text-zinc-500 hover:text-zinc-700">
        ← Back to venture discovery
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Alignment Reveal</h1>
        <p className="text-zinc-500 mt-1">See where your team agrees — and where you differ</p>
      </div>

      {mutualTop.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            Mutual Top Picks
            <Badge variant="success">{mutualTop.length}</Badge>
          </h2>
          {mutualTop.map((c) => (
            <CandidateCard key={c.candidateId} candidate={c} teamId={teamId} highlight />
          ))}
        </div>
      )}

      {strongInterest.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            Strong Interest
            <Badge variant="warning">{strongInterest.length}</Badge>
          </h2>
          {strongInterest.map((c) => (
            <CandidateCard key={c.candidateId} candidate={c} teamId={teamId} />
          ))}
        </div>
      )}

      {divergent.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            Divergent Interest
            <Badge variant="secondary">{divergent.length}</Badge>
          </h2>
          {divergent.map((c) => (
            <CandidateCard key={c.candidateId} candidate={c} teamId={teamId} />
          ))}
        </div>
      )}
    </div>
  );
}

function CandidateCard({
  candidate,
  teamId,
  highlight = false,
}: {
  candidate: {
    candidateId: string;
    problem: string;
    solution: string;
    industry: string;
    teamFitScore: number;
    avgExcitement: number;
    avgConfidence: number;
    avgFit: number;
    avgCommitment: number;
    combinedScore: number;
  };
  teamId: string;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-green-200 bg-green-50/30" : ""}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <h3 className="font-medium">{candidate.solution}</h3>
            <p className="text-sm text-zinc-600">{candidate.problem}</p>
            <div className="flex gap-4 text-xs text-zinc-500">
              <span>Excitement: {candidate.avgExcitement}</span>
              <span>Confidence: {candidate.avgConfidence}</span>
              <span>Fit: {candidate.avgFit}</span>
              <span>Commitment: {candidate.avgCommitment}</span>
            </div>
          </div>
          <div className="text-right space-y-2">
            <div className="text-2xl font-bold">{candidate.combinedScore.toFixed(1)}</div>
            <p className="text-xs text-zinc-500">combined score</p>
            <Badge variant="secondary">{candidate.industry}</Badge>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-zinc-100">
          <SelectVentureButton teamId={teamId} candidateId={candidate.candidateId} />
        </div>
      </CardContent>
    </Card>
  );
}
