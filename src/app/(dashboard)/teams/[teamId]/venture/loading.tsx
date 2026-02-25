export default function VentureLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-4 w-24 bg-zinc-200 rounded" />
      <div className="h-8 w-48 bg-zinc-200 rounded" />
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-28 bg-zinc-100 rounded-xl" />
        ))}
      </div>
      <div className="h-48 bg-zinc-100 rounded-xl" />
    </div>
  );
}
