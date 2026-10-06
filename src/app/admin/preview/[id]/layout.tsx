import { notFound } from "next/navigation";

import { PreviewBanner } from "@/components/admin/PreviewBanner";
import { DemoShell } from "@/components/template/DemoShell";
import { requireAdmin } from "@/lib/auth";
import { resolveDemo } from "@/lib/defaults";
import { getDemoById } from "@/lib/demo-service";

export const dynamic = "force-dynamic";

/** Same frame as the public demo layout, plus the admin preview banner. Works for drafts. */
export default async function PreviewLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const demo = await getDemoById((await params).id);
  if (!demo) notFound();
  return (
    <DemoShell
      demo={resolveDemo(demo)}
      basePath={`/admin/preview/${demo.id}`}
      banner={<PreviewBanner id={demo.id} slug={demo.slug} isPublished={demo.isPublished} />}
    >
      {children}
    </DemoShell>
  );
}
