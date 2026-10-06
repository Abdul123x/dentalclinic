import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DemoTemplate } from "@/components/template/DemoTemplate";
import { getDemoBySlug } from "@/lib/demo-service";
import { demoJsonLd, demoMetadata } from "./metadata";

// Always read fresh data so edits in the admin show immediately.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const demo = await getDemoBySlug((await params).slug);
  return demo ? demoMetadata(demo) : { title: "Not found" };
}

export default async function DemoPage({ params }: Props) {
  // 1. read slug → 2. indexed DB lookup → 3. only if published → 4/5. render shared template with its data
  const demo = await getDemoBySlug((await params).slug);
  if (!demo) notFound();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(demoJsonLd(demo)).replace(/</g, "\\u003c") }}
      />
      <DemoTemplate demo={demo} basePath={`/demo/${demo.slug}`} />
    </>
  );
}
