"use client";

import { useState, type FormEvent } from "react";
import { Check, MessageCircle } from "lucide-react";

import { telLink, whatsappLink } from "@/lib/whatsapp";

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
  const field =
    "mt-1 w-full rounded-xl bg-surface px-4 py-3 text-sm ring-1 ring-border outline-none focus:ring-2 focus:ring-primary";

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
      <div className="animate-pop rounded-[28px] bg-background p-10 text-center ring-1 ring-border">
        <div className="mx-auto mb-5 grid size-14 place-items-center rounded-full bg-primary/15 text-primary-deep">
          <Check className="size-7" />
        </div>
        <h3 className="font-display text-3xl tracking-tight">Almost done!</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Press <b>Send</b> in WhatsApp to deliver your request. The clinic will reply to confirm your time.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-deep"
        >
          Send another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-[28px] bg-background p-6 ring-1 ring-border md:p-8">
      <h3 className="mb-1 font-display text-3xl tracking-tight">Request an appointment</h3>
      <p className="mb-6 text-sm text-muted-foreground">Your request opens in WhatsApp — we&apos;ll reply to confirm a time.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Full name</span>
          <input required name="name" placeholder="Your name" className={field} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Phone</span>
          <input required type="tel" name="phone" placeholder="03xx xxxxxxx" className={field} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Service</span>
          <select name="service" className={field} defaultValue="General check-up">
            <option>General check-up</option>
            {services.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Preferred date</span>
          <input type="date" name="date" className={field} />
        </label>
      </div>
      <label className="mt-4 block">
        <span className="text-xs font-medium text-muted-foreground">Message (optional)</span>
        <textarea name="message" rows={3} placeholder="Tell us what's bothering you" className={field} />
      </label>
      <button
        type="submit"
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent py-4 text-base font-semibold text-accent-foreground hover:opacity-90"
      >
        <MessageCircle className="size-5" /> Request via WhatsApp
      </button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Prefer to talk?{" "}
        <a href={telLink(phone)} className="font-semibold text-primary">
          Call {phone}
        </a>
      </p>
    </form>
  );
}
