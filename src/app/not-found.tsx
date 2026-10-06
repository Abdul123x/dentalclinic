export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 font-body">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This demo doesn&apos;t exist or isn&apos;t published yet.
        </p>
      </div>
    </div>
  );
}
