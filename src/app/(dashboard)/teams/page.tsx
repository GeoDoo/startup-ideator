import Link from "next/link";
import { getUserTeams } from "@/lib/actions/teams";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function TeamsPage() {
  const teams = await getUserTeams();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your Teams</h1>
          <p className="text-zinc-500 mt-1">Manage your co-founder partnerships</p>
        </div>
        <Link href="/teams/new">
          <Button>Create Team</Button>
        </Link>
      </div>

      {teams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
            <p className="text-zinc-500 mb-6 max-w-sm">
              Create a team and invite your potential co-founders to start assessing your partnership.
            </p>
            <Link href="/teams/new">
              <Button>Create Your First Team</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {teams.map((team) => (
            <Link key={team.id} href={`/teams/${team.id}`}>
              <Card className="hover:border-zinc-300 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                    <Badge variant="secondary">{team.role}</Badge>
                  </div>
                  <CardDescription>
                    {team.memberCount} partner{team.memberCount !== 1 ? "s" : ""}
                    {team.stage && ` · ${team.stage}`}
                    {team.domain && ` · ${team.domain}`}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
