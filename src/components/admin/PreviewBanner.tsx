import Link from "next/link";

export function PreviewBanner({ id, slug, isPublished }: { id: string; slug: string; isPublished: boolean }) {
  return (
    <div className="sticky top-0 z-[70] flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-foreground px-4 py-2 text-center text-xs text-background">
      <span>
        <b>PREVIEW</b> · {isPublished ? "Published" : "Draft — not visible to the public"} · /demo/{slug}
      </span>
      <Link href={`/admin/demos/${id}/edit`} className="font-semibold underline">
        Back to editor
      </Link>
      {isPublished && (
        <a href={`/demo/${slug}`} target="_blank" rel="noreferrer" className="font-semibold underline">
          Open public URL
        </a>
      )}
    </div>
  );
}
