import { resolveDemo } from "@/lib/defaults";
import { getGoogleReviews } from "@/lib/google-reviews";
import type { Demo } from "@/lib/validation";
import { About } from "./About";
import { Contact } from "./Contact";
import { CTA } from "./CTA";
import { Doctors } from "./Doctors";
import { Gallery } from "./Gallery";
import { Hero } from "./Hero";
import { Services } from "./Services";
import { Testimonials } from "./Testimonials";
import { WhyChooseUs } from "./WhyChooseUs";

/**
 * THE dental website template. Every demo — public or preview — renders through this one
 * component. It contains no client-specific content; everything comes from `demo`.
 * The navbar, footer, chatbot and brand colours come from <DemoShell> in the route layout.
 */
export async function DemoTemplate({ demo, basePath }: { demo: Demo; basePath: string }) {
  const d = resolveDemo(demo);
  const live = await getGoogleReviews(d.googlePlaceId);
  return (
    <>
      <Hero data={d} />
      <Services data={d.services} basePath={basePath} />
      <About data={d} />
      <WhyChooseUs data={d.whyChooseUs} businessName={d.businessName} />
      <Doctors data={d} />
      <Testimonials data={d} live={live} />
      <Gallery images={d.galleryImages} businessName={d.businessName} />
      <CTA data={d} />
      <Contact data={d} />
    </>
  );
}
