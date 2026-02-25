export default function TrendsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-4 w-24 bg-zinc-200 rounded" />
      <div className="h-8 w-48 bg-zinc-200 rounded" />
      <div className="h-80 bg-zinc-100 rounded-xl" />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-48 bg-zinc-100 rounded-xl" />
        <div className="h-48 bg-zinc-100 rounded-xl" />
      </div>
    </div>
  );
}
