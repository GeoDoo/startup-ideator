import { notFound } from "next/navigation";
import Link from "next/link";
import { getTeamById } from "@/lib/actions/teams";
import { getVentureCandidates, getVentureInputStatus } from "@/lib/actions/venture";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GenerateIdeasButton } from "./generate-ideas-button";

export default async function IdeasPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const team = await getTeamById(teamId);
  if (!team) notFound();

  const inputStatus = await getVentureInputStatus(teamId);
  const allComplete = inputStatus?.every((m) => m.status === "completed") ?? false;
  const candidates = await getVentureCandidates(teamId);

  return (
    <div className="space-y-6">
      <Link href={`/teams/${teamId}/venture`} className="text-sm text-zinc-500 hover:text-zinc-700">
        ← Back to venture discovery
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Generated Ideas</h1>
        <p className="text-zinc-500 mt-1">AI-generated startup ideas tailored to your team</p>
      </div>

      {!allComplete && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-zinc-500">All partners must complete their venture inputs before generating ideas.</p>
          </CardContent>
        </Card>
      )}

      {allComplete && candidates.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-zinc-500 mb-4">Ready to generate personalized startup ideas for your team.</p>
            <GenerateIdeasButton teamId={teamId} />
          </CardContent>
        </Card>
      )}

      {candidates.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">{candidates.length} ideas generated</p>
            <GenerateIdeasButton teamId={teamId} variant="outline" label="Generate More" />
          </div>
          <div className="space-y-4">
            {candidates.map((c, i) => (
              <Card key={c.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      #{i + 1}: {c.solution.slice(0, 80)}{c.solution.length > 80 ? "..." : ""}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={c.riskLevel === "low" ? "success" : c.riskLevel === "medium" ? "warning" : "destructive"}>
                        {c.riskLevel} risk
                      </Badge>
                      <Badge variant="secondary">{c.industry}</Badge>
                      <Badge variant="outline">Fit: {c.teamFitScore}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-zinc-500">Problem</p>
                    <p className="text-sm">{c.problem}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-500">Solution</p>
                    <p className="text-sm">{c.solution}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs font-medium text-zinc-500">Customer</p>
                      <p>{c.customer}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-500">Business Model</p>
                      <p>{c.businessModel}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-500">Market Opportunity</p>
                      <p>{c.marketOpportunity}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-500">Revenue Timeline</p>
                      <p>{c.revenueTimeline}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-500">First 90 Days</p>
                    <p className="text-sm">{c.first90Days}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
