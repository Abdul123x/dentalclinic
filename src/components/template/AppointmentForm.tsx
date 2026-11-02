"use client";

import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";

import { telLink, whatsappLink } from "@/lib/whatsapp";
import { btnPrimary } from "./ui";

const field =
  "mt-2 h-12 w-full rounded-[3px] border border-input bg-surface px-4 text-[15px] outline-none transition-colors focus:border-foreground";
const label = "block text-[13px] font-semibold";

export function AppointmentForm({
  businessName,
  whatsapp,
  phone,
  services,
}: {
  businessName: string;
  whatsapp: string;
  phone: string;
  services: string[];
}) {
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const text = [
      `Assalam o Alaikum, I'd like to book an appointment at ${businessName}.`,
      "",
      `Name: ${f.get("name")}`,
      `Phone: ${f.get("phone")}`,
      `Treatment: ${f.get("service")}`,
      f.get("date") ? `Preferred date: ${f.get("date")}` : "",
      f.get("message") ? `Note: ${f.get("message")}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    const url = whatsappLink(whatsapp, text);
    if (url) window.open(url, "_blank", "noopener");
    else window.location.href = telLink(phone);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="border border-border bg-surface p-8 md:p-10">
        <Check className="size-8 text-primary-deep" />
        <h3 className="mt-5 text-3xl">Almost done</h3>
        <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
          Press <b className="text-foreground">Send</b> in WhatsApp to deliver your request. The clinic will reply to
          confirm your appointment time.
        </p>
        <button type="button" onClick={() => setSent(false)} className="mt-8 text-sm font-semibold underline underline-offset-4">
          Send another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="border border-border bg-surface p-6 md:p-10">
      <h3 className="text-3xl">Request an appointment</h3>
      <p className="mt-2 text-[15px] text-muted-foreground">We&apos;ll reply on WhatsApp to confirm a time.</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <label className={label}>
          Full name
          <input required name="name" autoComplete="name" className={field} />
        </label>
        <label className={label}>
          Phone number
          <input required type="tel" name="phone" autoComplete="tel" placeholder="03xx xxxxxxx" className={field} />
        </label>
        <label className={label}>
          Treatment
          <select name="service" className={field} defaultValue="General check-up">
            <option>General check-up</option>
            {services.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className={label}>
          Preferred date
          <input type="date" name="date" className={field} />
        </label>
        <label className={`${label} sm:col-span-2`}>
          Anything we should know? <span className="font-normal text-muted-foreground">(optional)</span>
          <textarea name="message" rows={3} className={`${field} h-auto py-3`} />
        </label>
      </div>
      <button type="submit" className={`${btnPrimary} mt-8 w-full`}>
        Send request via WhatsApp
      </button>
      <p className="mt-4 text-center text-[13px] text-muted-foreground">
        Prefer to talk?{" "}
        <a href={telLink(phone)} className="font-semibold text-foreground underline underline-offset-4">
          Call {phone}
        </a>
      </p>
    </form>
  );
}
