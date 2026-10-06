import { notFound } from "next/navigation";

import { ServicesPageTemplate } from "@/components/template/ServicesPageTemplate";
import { requireAdmin } from "@/lib/auth";
import { getDemoById } from "@/lib/demo-service";

export const dynamic = "force-dynamic";
export const metadata = { title: "Preview — services", robots: { index: false } };

export default async function PreviewServicesPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const demo = await getDemoById((await params).id);
  if (!demo) notFound();
  return (
    <ServicesPageTemplate
      demo={demo}
      basePath={`/admin/preview/${demo.id}`}
    />
  );
}
