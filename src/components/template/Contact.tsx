import { Clock, Mail, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";

import type { ResolvedDemo } from "@/lib/defaults";
import { telLink, whatsappLink } from "@/lib/whatsapp";
import { AppointmentForm } from "./AppointmentForm";
import { Reveal } from "./Reveal";
import { SectionLabel } from "./SectionLabel";

export function mapsSearchUrl(d: ResolvedDemo) {
  return (
    d.googleMapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${d.businessName} ${d.address}`)}`
  );
}

export function Contact({ data }: { data: ResolvedDemo }) {
  const embed = `https://www.google.com/maps?q=${encodeURIComponent(`${data.businessName}, ${data.address}`)}&output=embed`;
  const wa = whatsappLink(data.whatsapp);
  return (
    <section id="contact" className="scroll-mt-20 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal>
            <SectionLabel>Visit us</SectionLabel>
            <h2 className="mb-6 font-display text-4xl tracking-tight md:text-5xl">Come say hello</h2>
            <div className="space-y-5">
              {data.address && (
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <div className="font-semibold">Address</div>
                    <div className="text-sm whitespace-pre-line text-muted-foreground">{data.address}</div>
                    <a
                      href={mapsSearchUrl(data)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-deep"
                    >
                      <Navigation className="size-3.5" /> Get directions
                    </a>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <Phone className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <div className="font-semibold">Phone</div>
                  <a href={telLink(data.phone)} className="text-sm text-primary hover:text-primary-deep">
                    {data.phone}
                  </a>
                </div>
              </div>
              {wa && (
                <div className="flex gap-3">
                  <MessageCircle className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <div className="font-semibold">WhatsApp</div>
                    <a href={wa} target="_blank" rel="noreferrer" className="text-sm text-primary hover:text-primary-deep">
                      +{data.whatsapp}
                    </a>
                  </div>
                </div>
              )}
              {data.email && (
                <div className="flex gap-3">
                  <Mail className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <div className="font-semibold">Email</div>
                    <a href={`mailto:${data.email}`} className="text-sm break-all text-primary hover:text-primary-deep">
                      {data.email}
                    </a>
                  </div>
                </div>
              )}
              {data.openingHours && (
                <div className="flex gap-3">
                  <Clock className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <div className="font-semibold">Hours</div>
                    <div className="text-sm whitespace-pre-line text-muted-foreground">{data.openingHours}</div>
                  </div>
                </div>
              )}
            </div>
            {data.address && (
              <iframe
                title={`Map showing ${data.businessName}`}
                src={embed}
                loading="lazy"
                className="mt-6 aspect-[4/3] w-full rounded-2xl border border-border"
              />
            )}
          </Reveal>
        </div>
        <div id="book" className="scroll-mt-20 lg:col-span-7">
          <Reveal delay={100}>
            <AppointmentForm
              businessName={data.businessName}
              whatsapp={data.whatsapp}
              phone={data.phone}
              services={data.services.map((s) => s.title)}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
