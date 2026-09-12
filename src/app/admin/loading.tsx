export default function AdminLoading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="space-y-6 p-6"
    >
      <div className="h-8 w-56 animate-pulse bg-secondary" />

      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((row) => (
          <div
            key={row}
            className="h-12 animate-pulse bg-secondary"
          />
        ))}
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  );
}
