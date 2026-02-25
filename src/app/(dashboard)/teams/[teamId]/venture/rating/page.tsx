import { notFound } from "next/navigation";
import Link from "next/link";
import { getTeamById } from "@/lib/actions/teams";
import { getVentureCandidates } from "@/lib/actions/venture";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RatingForm } from "./rating-form";

export default async function RatingPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const team = await getTeamById(teamId);
  if (!team) notFound();

  const candidates = await getVentureCandidates(teamId);

  if (candidates.length === 0) {
    return (
      <div className="space-y-6">
        <Link href={`/teams/${teamId}/venture`} className="text-sm text-zinc-500 hover:text-zinc-700">
          ← Back to venture discovery
        </Link>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-zinc-500">Generate ideas first before rating them.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href={`/teams/${teamId}/venture`} className="text-sm text-zinc-500 hover:text-zinc-700">
        ← Back to venture discovery
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Rate Ideas</h1>
        <p className="text-zinc-500 mt-1">
          Rate each idea across 4 dimensions. Your ratings are anonymous.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Anonymous rating.</strong> Other partners will not see your individual scores until the alignment reveal.
        </p>
      </div>

      <div className="space-y-6">
        {candidates.map((c, i) => {
          const myRating = c.ratings[0];
          return (
            <Card key={c.id}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">
                    #{i + 1}: {c.solution.slice(0, 80)}
                  </h3>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{c.industry}</Badge>
                    {myRating && <Badge variant="success">Rated</Badge>}
                  </div>
                </div>
                <p className="text-sm text-zinc-600">{c.problem}</p>
                <RatingForm
                  candidateId={c.id}
                  existing={myRating ? {
                    excitement: myRating.excitement,
                    confidence: myRating.confidence,
                    fit: myRating.fit,
                    commitment: myRating.commitment,
                    rank: myRating.rank,
                    notes: myRating.notes,
                  } : undefined}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center pt-4">
        <Link href={`/teams/${teamId}/venture/alignment`}>
          <Button size="lg">View Alignment Reveal →</Button>
        </Link>
      </div>
    </div>
  );
}
