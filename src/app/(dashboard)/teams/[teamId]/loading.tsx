export default function TeamLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-4 w-24 bg-zinc-200 rounded mb-2" />
        <div className="h-8 w-56 bg-zinc-200 rounded" />
      </div>
      <div className="h-64 bg-zinc-100 rounded-xl" />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-48 bg-zinc-100 rounded-xl" />
        <div className="h-48 bg-zinc-100 rounded-xl" />
      </div>
    </div>
  );
}
