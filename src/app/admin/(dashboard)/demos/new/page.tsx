import { DemoForm } from "@/components/admin/DemoForm";
import { cloudinaryConfigured } from "@/lib/cloudinary";
import { newDemoFormValues } from "@/lib/defaults";

export const metadata = { title: "Create demo — Dental Demos" };

export default function NewDemoPage() {
  return (
    <DemoForm
      initial={newDemoFormValues()}
      demoId={null}
      uploadsEnabled={cloudinaryConfigured()}
      siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? ""}
    />
  );
}
