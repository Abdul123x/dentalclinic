import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ServicesPageTemplate } from "@/components/template/ServicesPageTemplate";
import { getDemoBySlug } from "@/lib/demo-service";
import { demoMetadata } from "../metadata";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const demo = await getDemoBySlug((await params).slug);
  return demo ? demoMetadata(demo, "/services") : { title: "Not found" };
}

export default async function DemoServicesPage({ params }: Props) {
  const demo = await getDemoBySlug((await params).slug);
  if (!demo) notFound();
  return <ServicesPageTemplate demo={demo} basePath={`/demo/${demo.slug}`} />;
}
