import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getTeamById } from "@/lib/actions/teams";
import { getOrCreateAssessment, getTeamAssessmentStatus } from "@/lib/actions/assessment";
import { ASSESSMENT_SECTIONS } from "@/lib/assessment/questions";
import { AssessmentEngine } from "./assessment-engine";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function AssessmentPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const team = await getTeamById(teamId);
  if (!team) notFound();

  if (team.members.length < 2) {
    redirect(`/teams/${teamId}`);
  }

  const assessment = await getOrCreateAssessment(teamId);
  if (!assessment) notFound();

  const teamStatus = await getTeamAssessmentStatus(teamId);

  const partners = team.members.filter(
    (m) => m.id !== assessment.memberId
  );

  if (assessment.status === "completed") {
    return (
      <div className="space-y-6">
        <Link href={`/teams/${teamId}`} className="text-sm text-zinc-500 hover:text-zinc-700">
          ← Back to team
        </Link>
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Assessment Complete</CardTitle>
            <CardDescription>
              You have completed your partnership assessment. Your answers are saved and anonymous.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="font-medium text-sm">Team Assessment Status</h3>
              {teamStatus?.map((m) => (
                <div key={m.memberId} className="flex items-center justify-between py-2">
                  <span className="text-sm">{m.isCurrentUser ? "You" : m.name}</span>
                  <Badge variant={m.status === "completed" ? "success" : m.status === "in_progress" ? "warning" : "secondary"}>
                    {m.status === "completed" ? "Completed" : m.status === "in_progress" ? "In Progress" : "Not Started"}
                  </Badge>
                </div>
              ))}
              {teamStatus?.every((m) => m.status === "completed") && (
                <div className="pt-4 border-t">
                  <Link href={`/teams/${teamId}/report`}>
                    <Button className="w-full">View Compatibility Report</Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const responseMap: Record<string, unknown> = {};
  for (const resp of assessment.responses) {
    responseMap[`${resp.sectionKey}:${resp.questionKey}`] = resp.answer;
  }

  return (
    <div className="space-y-6">
      <Link href={`/teams/${teamId}`} className="text-sm text-zinc-500 hover:text-zinc-700">
        ← Back to team
      </Link>
      <div>
        <h1 className="text-2xl font-bold">Partnership Assessment</h1>
        <p className="text-zinc-500 mt-1">
          Estimated time: 45-60 minutes. You can save progress and return anytime.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Your answers are anonymous.</strong> Other partners will not see your individual responses.
          Only aggregated, anonymized insights appear in the compatibility report.
        </p>
      </div>

      <AssessmentEngine
        assessmentId={assessment.id}
        sections={ASSESSMENT_SECTIONS}
        savedResponses={responseMap}
        partners={partners.map((p) => ({ id: p.id, name: p.user.name || "Partner" }))}
        teamId={teamId}
      />
    </div>
  );
}
