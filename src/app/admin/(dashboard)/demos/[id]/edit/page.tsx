import { notFound } from "next/navigation";

import { DemoForm } from "@/components/admin/DemoForm";
import { cloudinaryConfigured } from "@/lib/cloudinary";
import { getDemoById } from "@/lib/demo-service";

export const metadata = { title: "Edit demo — Dental Demos" };

export default async function EditDemoPage({ params }: { params: Promise<{ id: string }> }) {
  const demo = await getDemoById((await params).id);
  if (!demo) notFound();
  const { id, createdAt, updatedAt, ...values } = demo;
  void createdAt;
  return (
    <DemoForm
      key={updatedAt}
      initial={values}
      demoId={id}
      uploadsEnabled={cloudinaryConfigured()}
      siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? ""}
      updatedAt={updatedAt}
    />
  );
}
