/** Shown inside the demo layout (navbar stays visible) while a page loads. */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-[1200px] animate-pulse px-5 py-16 md:px-8">
      <div className="h-3 w-32 bg-muted" />
      <div className="mt-6 h-14 w-2/3 bg-muted" />
      <div className="mt-4 h-4 w-1/2 bg-muted" />
      <div className="mt-14 space-y-6 border-t border-border pt-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 bg-muted" />
        ))}
      </div>
    </div>
  );
}
