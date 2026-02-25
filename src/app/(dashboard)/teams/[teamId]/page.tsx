import { notFound } from "next/navigation";
import Link from "next/link";
import { getTeamById } from "@/lib/actions/teams";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InviteForm } from "./invite-form";
import { PendingInvitations } from "./pending-invitations";

export default async function TeamDashboardPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const team = await getTeamById(teamId);

  if (!team) notFound();

  const isCreator = team.currentUserRole === "creator";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/teams" className="text-sm text-zinc-500 hover:text-zinc-700">
            ← Back to teams
          </Link>
          <h1 className="text-2xl font-bold mt-2">{team.name}</h1>
          <p className="text-zinc-500">
            {team.stage && <span>{team.stage}</span>}
            {team.stage && team.domain && <span> · </span>}
            {team.domain && <span>{team.domain}</span>}
          </p>
        </div>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Partners</CardTitle>
          <CardDescription>{team.members.length} member{team.members.length !== 1 ? "s" : ""}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {team.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-medium">
                    {(member.user.name || member.user.email)?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{member.user.name || member.user.email}</p>
                    <p className="text-xs text-zinc-500">{member.user.email}</p>
                  </div>
                </div>
                <Badge variant={member.role === "creator" ? "default" : "secondary"}>
                  {member.role}
                </Badge>
              </div>
            ))}
          </div>

          {isCreator && (
            <div className="mt-6 pt-4 border-t border-zinc-100">
              <InviteForm teamId={teamId} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {isCreator && team.invitations.length > 0 && (
        <PendingInvitations invitations={team.invitations} />
      )}

      {/* Module Cards - Empty States */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Partnership Intelligence</CardTitle>
            <CardDescription>
              Deep assessments, compatibility reports, and ongoing partnership health tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {team.members.length < 2 ? (
              <p className="text-sm text-zinc-400">
                Invite at least one partner to start the assessment.
              </p>
            ) : (
              <>
                <Link href={`/teams/${teamId}/assessment`}>
                  <Button variant="outline" className="w-full">Start Assessment</Button>
                </Link>
                <Link href={`/teams/${teamId}/report`}>
                  <Button variant="ghost" className="w-full">View Report</Button>
                </Link>
                <Link href={`/teams/${teamId}/trends`}>
                  <Button variant="ghost" className="w-full">Trends & Pulse</Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Venture Discovery</CardTitle>
            <CardDescription>
              Find, generate, and validate the right startup idea for your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            {team.members.length < 2 ? (
              <p className="text-sm text-zinc-400">
                Invite at least one partner to begin venture discovery.
              </p>
            ) : (
              <Link href={`/teams/${teamId}/venture`}>
                <Button variant="outline" className="w-full">Begin Discovery</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
