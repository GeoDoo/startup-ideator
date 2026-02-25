export default function ReportLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-4 w-24 bg-zinc-200 rounded" />
      <div className="h-8 w-56 bg-zinc-200 rounded" />
      <div className="space-y-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-48 bg-zinc-100 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
