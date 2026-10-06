/** Shown inside the demo layout (navbar stays visible) while a page loads. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-5 py-14">
      <div className="h-4 w-40 rounded-full bg-muted" />
      <div className="mt-5 h-20 w-3/4 rounded-2xl bg-muted" />
      <div className="mt-4 h-5 w-1/2 rounded-full bg-muted" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-44 rounded-3xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
