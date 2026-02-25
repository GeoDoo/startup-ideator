import { redirect } from "next/navigation";
import Link from "next/link";
import { acceptInvitation } from "@/lib/actions/invitations";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await acceptInvitation(token);

  if (result.redirect) {
    redirect(result.redirect);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{result.success ? "Invitation Accepted" : "Invitation Error"}</CardTitle>
          <CardDescription>{result.error}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link href="/teams" className="text-sm text-zinc-500 underline hover:text-zinc-700">
            Go to your teams
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
