import type { ReactNode } from "react";

import type { ResolvedDemo } from "@/lib/defaults";
import { themeVars } from "@/lib/theme";
import { Chatbot } from "./Chatbot";
import { mapsSearchUrl } from "./Contact";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

/**
 * Wraps every demo page: applies the client's brand colours as CSS variables,
 * and renders the shared navbar, footer and chatbot.
 */
export function DemoShell({
  demo,
  basePath,
  banner,
  children,
}: {
  demo: ResolvedDemo;
  basePath: string;
  banner?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div style={themeVars(demo.primaryColor, demo.secondaryColor)} className="min-h-screen bg-background font-body text-foreground">
      {banner}
      <Navbar demo={demo} basePath={basePath} />
      <main>{children}</main>
      <Footer data={demo} />
      <Chatbot
        data={{
          businessName: demo.businessName,
          initial: demo.initial,
          phone: demo.phone,
          whatsapp: demo.whatsapp,
          address: demo.address,
          openingHours: demo.openingHours,
          mapsUrl: mapsSearchUrl(demo),
          googleRating: demo.googleRating,
          googleReviewCount: demo.googleReviewCount,
          services: demo.services.map((s) => ({ title: s.title, description: s.description, details: s.details })),
          servicesUrl: `${basePath}/services`,
        }}
      />
    </div>
  );
}
