import { notFound } from "next/navigation";

import { DemoShell } from "@/components/template/DemoShell";
import { resolveDemo } from "@/lib/defaults";
import { getDemoBySlug } from "@/lib/demo-service";

/**
 * Shared frame for every page of a demo (home, services…). Because it lives in a layout,
 * the navbar, footer, chatbot and brand colours stay mounted when moving between pages —
 * only the page content swaps, so there is no full reload.
 */
export default async function DemoLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const demo = await getDemoBySlug((await params).slug);
  if (!demo) notFound();
  return (
    <DemoShell demo={resolveDemo(demo)} basePath={`/demo/${demo.slug}`}>
      {children}
    </DemoShell>
  );
}
