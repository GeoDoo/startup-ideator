import { notFound } from "next/navigation";
import Link from "next/link";
import { getTeamById } from "@/lib/actions/teams";
import { getTrendData, getPulseSchedule, getTeamMilestones } from "@/lib/actions/pulse";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendChart } from "./trend-chart";
import { PulseScheduleConfig } from "./pulse-schedule-config";
import { MilestoneForm } from "./milestone-form";

export default async function TrendsPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const team = await getTeamById(teamId);
  if (!team) notFound();

  const trendData = await getTrendData(teamId);
  const schedule = await getPulseSchedule(teamId);
  const milestones = await getTeamMilestones(teamId);
  const isCreator = team.currentUserRole === "creator";

  const dataPoints = trendData?.reports.map((r) => {
    const scores = r.scores;
    const overallScore = scores.length > 0
      ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
      : 0;
    return {
      date: r.createdAt.toISOString().split("T")[0],
      overall: overallScore,
      ...Object.fromEntries(scores.map((s) => [s.dimension, s.score])),
    };
  }) || [];

  return (
    <div className="space-y-6">
      <Link href={`/teams/${teamId}`} className="text-sm text-zinc-500 hover:text-zinc-700">
        ← Back to team
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Partnership Trends</h1>
          <p className="text-zinc-500 mt-1">Track your compatibility over time</p>
        </div>
      </div>

      {/* Trend Chart */}
      {dataPoints.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Score Timeline</CardTitle>
            <CardDescription>Compatibility scores over time</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendChart data={dataPoints} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-zinc-500">
              Trend data will appear here after your first compatibility report is generated.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pulse Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pulse Surveys</CardTitle>
            <CardDescription>
              {schedule?.active
                ? `Scheduled ${schedule.frequency} — next due ${schedule.nextDue ? new Date(schedule.nextDue).toLocaleDateString() : "soon"}`
                : "Not yet configured"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isCreator ? (
              <PulseScheduleConfig teamId={teamId} currentFrequency={schedule?.frequency} />
            ) : (
              <p className="text-sm text-zinc-500">
                {schedule?.active
                  ? "Pulse surveys are active. You'll be notified when the next one is due."
                  : "The team creator can configure pulse surveys."}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Milestones</CardTitle>
            <CardDescription>Record significant events in your journey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <MilestoneForm teamId={teamId} />
            {milestones.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                {milestones.slice(0, 10).map((m) => (
                  <div key={m.id} className="flex items-start gap-3 py-2">
                    <div className="w-2 h-2 rounded-full bg-zinc-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{m.title}</p>
                      {m.description && <p className="text-xs text-zinc-500">{m.description}</p>}
                      <p className="text-xs text-zinc-400">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pulse History */}
      {(trendData?.pulseAssessments.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pulse Survey History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trendData!.pulseAssessments.map((pa) => (
                <div key={pa.id} className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-b-0">
                  <span className="text-sm">
                    {pa.completedAt
                      ? new Date(pa.completedAt).toLocaleDateString()
                      : "In progress"}
                  </span>
                  <Badge variant={pa.status === "completed" ? "success" : "secondary"}>
                    {pa.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
