import { notFound } from "next/navigation";
import Link from "next/link";
import { getTeamById } from "@/lib/actions/teams";
import { getVentureInputStatus, getVentureCandidates, getVentureSelection } from "@/lib/actions/venture";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function VenturePage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const team = await getTeamById(teamId);
  if (!team) notFound();

  const inputStatus = await getVentureInputStatus(teamId);
  const allInputsComplete = inputStatus?.every((m) => m.status === "completed") ?? false;
  const candidates = await getVentureCandidates(teamId);
  const selection = await getVentureSelection(teamId);

  return (
    <div className="space-y-6">
      <Link href={`/teams/${teamId}`} className="text-sm text-zinc-500 hover:text-zinc-700">
        ← Back to team
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Venture Discovery</h1>
        <p className="text-zinc-500 mt-1">Find the right startup idea for your team</p>
      </div>

      {/* Progress Steps */}
      <div className="grid gap-4 md:grid-cols-4">
        <StepCard
          step={1}
          title="Venture Inputs"
          description="Share your interests, skills, and preferences"
          status={allInputsComplete ? "complete" : "active"}
          href={`/teams/${teamId}/venture/inputs`}
        />
        <StepCard
          step={2}
          title="Idea Generation"
          description="AI generates personalized startup ideas"
          status={candidates.length > 0 ? "complete" : allInputsComplete ? "active" : "locked"}
          href={`/teams/${teamId}/venture/ideas`}
        />
        <StepCard
          step={3}
          title="Rating & Ranking"
          description="Anonymously rate and rank ideas"
          status={candidates.length > 0 ? "active" : "locked"}
          href={`/teams/${teamId}/venture/rating`}
        />
        <StepCard
          step={4}
          title="Selection"
          description="Reveal alignment and select your venture"
          status={selection ? "complete" : candidates.length > 0 ? "active" : "locked"}
          href={`/teams/${teamId}/venture/alignment`}
        />
      </div>

      {/* Input Status */}
      {inputStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Team Input Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {inputStatus.map((m) => (
                <div key={m.memberId} className="flex items-center justify-between py-2">
                  <span className="text-sm">{m.isCurrentUser ? "You" : m.name}</span>
                  <Badge variant={m.status === "completed" ? "success" : m.status === "in_progress" ? "warning" : "secondary"}>
                    {m.status === "completed" ? "Completed" : m.status === "in_progress" ? "In Progress" : "Not Started"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selection && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-6 text-center">
            <h3 className="text-lg font-semibold text-green-800">Venture Selected!</h3>
            <p className="text-green-600 mt-1">Your team has chosen a venture to pursue.</p>
            <Link href={`/teams/${teamId}/venture/selection`}>
              <Button variant="outline" className="mt-4">View Selection Details</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
  status,
  href,
}: {
  step: number;
  title: string;
  description: string;
  status: "locked" | "active" | "complete";
  href: string;
}) {
  const content = (
    <Card className={`transition-colors ${
      status === "complete" ? "border-green-200" :
      status === "active" ? "border-zinc-300 hover:border-zinc-400" :
      "opacity-50"
    }`}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            status === "complete" ? "bg-green-500 text-white" :
            status === "active" ? "bg-zinc-900 text-white" :
            "bg-zinc-200 text-zinc-500"
          }`}>
            {status === "complete" ? "✓" : step}
          </div>
          <h3 className="font-medium text-sm">{title}</h3>
        </div>
        <p className="text-xs text-zinc-500">{description}</p>
      </CardContent>
    </Card>
  );

  if (status === "locked") return content;
  return <Link href={href}>{content}</Link>;
}
