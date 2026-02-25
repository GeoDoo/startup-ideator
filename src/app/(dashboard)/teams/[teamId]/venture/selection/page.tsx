import { notFound } from "next/navigation";
import Link from "next/link";
import { getTeamById } from "@/lib/actions/teams";
import { getVentureSelection, getVentureCandidates } from "@/lib/actions/venture";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function SelectionPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const team = await getTeamById(teamId);
  if (!team) notFound();

  const selection = await getVentureSelection(teamId);
  if (!selection) {
    return (
      <div className="space-y-6">
        <Link href={`/teams/${teamId}/venture`} className="text-sm text-zinc-500 hover:text-zinc-700">
          ← Back to venture discovery
        </Link>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-zinc-500">No venture selected yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const candidates = await getVentureCandidates(teamId);
  const selected = candidates.find((c) => c.id === selection.candidateId);

  return (
    <div className="space-y-6">
      <Link href={`/teams/${teamId}/venture`} className="text-sm text-zinc-500 hover:text-zinc-700">
        ← Back to venture discovery
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Your Selected Venture</h1>
        <p className="text-zinc-500 mt-1">This is the venture your team has chosen to pursue</p>
      </div>

      {selected && (
        <Card className="border-green-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{selected.solution}</CardTitle>
              <Badge variant="success">Selected</Badge>
            </div>
            <CardDescription>{selected.industry} · {selected.riskLevel} risk</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Section title="Problem" content={selected.problem} />
            <Section title="Solution" content={selected.solution} />
            <Section title="Target Customer" content={selected.customer} />
            <Section title="Business Model" content={selected.businessModel} />
            <Section title="Market Opportunity" content={selected.marketOpportunity} />
            <Section title="Competitive Landscape" content={selected.competitiveLandscape} />
            <Section title="Feasibility" content={selected.feasibility} />
            <Section title="First 90 Days Plan" content={selected.first90Days} />
            <Section title="Revenue Timeline" content={selected.revenueTimeline} />

            <div className="pt-4 border-t border-zinc-100">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{selected.teamFitScore}</div>
                  <p className="text-xs text-zinc-500">Team Fit</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-zinc-500 mb-1">{title}</h3>
      <p className="text-sm">{content}</p>
    </div>
  );
}
