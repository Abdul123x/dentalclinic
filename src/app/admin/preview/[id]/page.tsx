import { notFound } from "next/navigation";

import { DemoTemplate } from "@/components/template/DemoTemplate";
import { requireAdmin } from "@/lib/auth";
import { getDemoById } from "@/lib/demo-service";

export const dynamic = "force-dynamic";
export const metadata = { title: "Preview", robots: { index: false } };

/** Admin-only preview: renders drafts too, using exactly the same template as the public page. */
export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const demo = await getDemoById((await params).id);
  if (!demo) notFound();
  return (
    <DemoTemplate
      demo={demo}
      basePath={`/admin/preview/${demo.id}`}
    />
  );
}
