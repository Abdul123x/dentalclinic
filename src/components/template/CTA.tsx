import { MessageCircle, Phone } from "lucide-react";

import type { ResolvedDemo } from "@/lib/defaults";
import { telLink, whatsappLink } from "@/lib/whatsapp";

export function CTA({ data }: { data: ResolvedDemo }) {
  const wa = whatsappLink(data.whatsapp, `Assalam o Alaikum, I'd like to book an appointment at ${data.businessName}.`);
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 py-14 md:flex-row md:items-center">
        <div>
          <h2 className="font-display text-4xl tracking-tight md:text-5xl">Ready for a healthier smile?</h2>
          <p className="mt-2 opacity-80">Book your visit at {data.businessName} today — it only takes a minute.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 font-semibold text-accent-foreground hover:opacity-90"
            >
              <MessageCircle className="size-5" /> WhatsApp us
            </a>
          )}
          <a
            href={telLink(data.phone)}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-semibold ring-1 ring-current/40 hover:ring-current"
          >
            <Phone className="size-5" /> {data.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
