export default function Loading() {
  return (
    <div className="space-y-4" aria-busy>
      <div className="h-7 w-48 animate-pulse rounded bg-surface-2" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-surface-2" />
        ))}
      </div>
    </div>
  );
}
