import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-6xl font-bold text-zinc-300">404</h1>
      <h2 className="text-xl font-semibold mt-4">Page not found</h2>
      <p className="text-zinc-500 mt-2 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/teams" className="mt-6">
        <Button>Go to Teams</Button>
      </Link>
    </div>
  );
}
