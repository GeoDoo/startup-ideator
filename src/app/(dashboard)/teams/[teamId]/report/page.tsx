import { notFound } from "next/navigation";
import Link from "next/link";
import { getTeamById } from "@/lib/actions/teams";
import { getLatestReport } from "@/lib/actions/report";
import { getTeamAssessmentStatus } from "@/lib/actions/assessment";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportViewer } from "./report-viewer";
import { GenerateReportButton } from "./generate-report-button";

export default async function ReportPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const team = await getTeamById(teamId);
  if (!team) notFound();

  const status = await getTeamAssessmentStatus(teamId);
  const allComplete = status?.every((m) => m.status === "completed") ?? false;
  const report = await getLatestReport(teamId);

  return (
    <div className="space-y-6">
      <Link href={`/teams/${teamId}`} className="text-sm text-zinc-500 hover:text-zinc-700">
        ← Back to team
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Compatibility Report</h1>
        <p className="text-zinc-500 mt-1">{team.name}</p>
      </div>

      {!allComplete && (
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Waiting for all partners</h3>
            <p className="text-zinc-500 mb-4">
              All partners must complete their assessments before the report can be generated.
            </p>
            <div className="space-y-2 max-w-sm mx-auto">
              {status?.map((m) => (
                <div key={m.memberId} className="flex items-center justify-between">
                  <span className="text-sm">{m.isCurrentUser ? "You" : m.name}</span>
                  <Badge variant={m.status === "completed" ? "success" : "warning"}>
                    {m.status === "completed" ? "Completed" : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {allComplete && !report && (
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Ready to Generate</CardTitle>
            <CardDescription>
              All partners have completed their assessments. Generate the AI-powered compatibility report.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <GenerateReportButton teamId={teamId} />
          </CardContent>
        </Card>
      )}

      {report && <ReportViewer report={report} />}
    </div>
  );
}
