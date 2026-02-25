export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-zinc-200 rounded" />
      <div className="h-4 w-72 bg-zinc-100 rounded" />
      <div className="space-y-4">
        <div className="h-40 bg-zinc-100 rounded-xl" />
        <div className="h-40 bg-zinc-100 rounded-xl" />
      </div>
    </div>
  );
}
