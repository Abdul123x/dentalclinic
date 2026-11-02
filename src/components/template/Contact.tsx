import type { ResolvedDemo } from "@/lib/defaults";
import { telLink, whatsappLink } from "@/lib/whatsapp";
import { AppointmentForm } from "./AppointmentForm";
import { container, eyebrow, h2, textLink } from "./ui";

export function mapsSearchUrl(d: ResolvedDemo) {
  return (
    d.googleMapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${d.businessName} ${d.address}`)}`
  );
}

export function Contact({ data }: { data: ResolvedDemo }) {
  const embed = `https://www.google.com/maps?q=${encodeURIComponent(`${data.businessName}, ${data.address}`)}&output=embed`;
  const wa = whatsappLink(data.whatsapp);
  const rows = [
    data.address && { label: "Address", value: <span className="whitespace-pre-line">{data.address}</span> },
    {
      label: "Phone",
      value: (
        <a href={telLink(data.phone)} className="hover:text-primary-deep">
          {data.phone}
        </a>
      ),
    },
    wa && {
      label: "WhatsApp",
      value: (
        <a href={wa} target="_blank" rel="noreferrer" className="hover:text-primary-deep">
          +{data.whatsapp}
        </a>
      ),
    },
    data.email && {
      label: "Email",
      value: (
        <a href={`mailto:${data.email}`} className="break-all hover:text-primary-deep">
          {data.email}
        </a>
      ),
    },
    data.openingHours && { label: "Hours", value: <span className="whitespace-pre-line">{data.openingHours}</span> },
  ].filter(Boolean) as { label: string; value: React.ReactNode }[];

  return (
    <section id="contact" className="scroll-mt-24 border-t border-border bg-paper py-20 md:py-28">
      <div className={`${container} grid gap-12 lg:grid-cols-12 lg:gap-16`}>
        <div className="lg:col-span-5">
          <p className={eyebrow}>Visit us</p>
          <h2 className={`${h2} mt-5`}>Book your appointment</h2>
          <dl className="mt-10 divide-y divide-border border-y border-border">
            {rows.map((r) => (
              <div key={r.label} className="grid grid-cols-[100px_1fr] gap-4 py-4 text-[15px]">
                <dt className="pt-0.5 text-[12px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">{r.label}</dt>
                <dd className="font-medium">{r.value}</dd>
              </div>
            ))}
          </dl>
          {data.address && (
            <>
              <iframe
                title={`Map showing ${data.businessName}`}
                src={embed}
                loading="lazy"
                className="mt-8 aspect-[4/3] w-full rounded-[4px] border border-border grayscale-[35%]"
              />
              <a href={mapsSearchUrl(data)} target="_blank" rel="noreferrer" className={`${textLink} mt-5`}>
                Get directions
              </a>
            </>
          )}
        </div>
        <div id="book" className="scroll-mt-28 lg:col-span-7">
          <AppointmentForm
            businessName={data.businessName}
            whatsapp={data.whatsapp}
            phone={data.phone}
            services={data.services.map((s) => s.title)}
          />
        </div>
      </div>
    </section>
  );
}
