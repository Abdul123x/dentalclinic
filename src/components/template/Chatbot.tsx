"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { MessageCircle, Phone, Send, X } from "lucide-react";

import { slugify } from "@/lib/slug";
import { telLink, whatsappLink } from "@/lib/whatsapp";

/**
 * Client-side FAQ assistant driven entirely by the demo's own data (services, hours,
 * address, phone, WhatsApp). No API key or backend. Understands English + Roman Urdu keywords.
 */

export type ChatbotData = {
  businessName: string;
  initial: string;
  phone: string;
  whatsapp: string;
  address: string;
  openingHours: string;
  mapsUrl: string;
  googleRating: number;
  googleReviewCount: number;
  services: { title: string; description: string; details: string }[];
  servicesUrl: string;
};

type LinkBtn = { label: string; href: string; action?: "book" };
type Msg = { from: "bot" | "user"; text: string; links?: LinkBtn[] };
type Step = null | "name" | "phone" | "service" | "date";

const QUICK = ["Services", "Timings", "Location", "Book appointment", "Fees", "Emergency"];
const has = (q: string, words: string[]) => words.some((w) => q.includes(w));

// Common words people type → words that appear in typical service titles.
const ALIASES: [string[], string[]][] = [
  [["whiten", "white", "safaid", "stain", "yellow", "peelay"], ["whiten"]],
  [["rct", "root canal", "nerve"], ["root canal"]],
  [["brace", "aligner", "straight", "crooked", "tedhe", "teray"], ["brace", "aligner", "orthodon"]],
  [["clean", "scal", "tartar", "safai", "bleeding gum", "bad breath"], ["clean", "scal"]],
  [["implant"], ["implant"]],
  [["extract", "nikal", "pull out"], ["extract"]],
  [["wisdom", "akal"], ["wisdom"]],
  [["crown", "cap"], ["crown"]],
  [["bridge"], ["bridge"]],
  [["denture", "battisi", "false teeth", "nakli"], ["denture"]],
  [["filling", "cavity", "keera", "decay", "bharai"], ["filling"]],
  [["cosmetic", "makeover", "veneer", "smile design"], ["cosmetic", "veneer", "makeover"]],
  [["sensitiv", "thanda"], ["sensitiv"]],
  [["kid", "child", "bachay", "bacha"], ["kid", "child", "pediatric", "paediatric"]],
];

export function Chatbot({ data }: { data: ChatbotData }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [step, setStep] = useState<Step>(null);
  const [booking, setBooking] = useState({ name: "", phone: "", service: "", date: "" });
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      from: "bot",
      text: `Assalam o Alaikum! I'm the ${data.businessName} assistant. Ask me about treatments, timings, location — or book an appointment.`,
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);
  const wa = whatsappLink(data.whatsapp);
  const tel = telLink(data.phone);
  const contactLinks: LinkBtn[] = [
    ...(wa ? [{ label: "WhatsApp us", href: wa }] : []),
    { label: `Call ${data.phone}`, href: tel },
  ];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, typing, open]);

  function findService(q: string) {
    for (const [words, targets] of ALIASES) {
      if (has(q, words)) {
        const hit = data.services.find((s) => has(s.title.toLowerCase(), targets));
        if (hit) return hit;
      }
    }
    return data.services.find((s) =>
      s.title
        .toLowerCase()
        .split(/[^a-z]+/)
        .some((w) => w.length > 4 && q.includes(w)),
    );
  }

  function reply(raw: string): Msg {
    const q = raw.toLowerCase();
    if (has(q, ["emergency", "urgent", "pain", "dard", "swelling", "sujan", "broken", "toot gaya", "knocked"])) {
      return {
        from: "bot",
        text: "Sorry you're in pain. For toothache, swelling or a broken tooth please call us right away and we'll try to see you the same day. If you have facial swelling with fever or trouble swallowing, go to the nearest hospital emergency.",
        links: [{ label: `Call ${data.phone}`, href: tel }],
      };
    }
    const svc = findService(q);
    if (svc) {
      return {
        from: "bot",
        text: `${svc.title}: ${svc.details || svc.description}`,
        links: [
          { label: "Full details", href: `${data.servicesUrl}#${slugify(svc.title)}` },
          { label: "Book this", href: "#", action: "book" },
        ],
      };
    }
    if (has(q, ["service", "treatment", "ilaj", "kya karte", "offer"])) {
      const names = data.services.map((s) => s.title);
      return {
        from: "bot",
        text: names.length
          ? `We offer ${names.slice(0, -1).join(", ")}${names.length > 1 ? " and " : ""}${names.at(-1)}. Ask me about any one!`
          : "We offer a full range of general, cosmetic and emergency dental care.",
        links: [{ label: "See all services", href: data.servicesUrl }],
      };
    }
    if (has(q, ["time", "timing", "hour", "open", "close", "khul", "band", "waqt", "sunday"])) {
      return {
        from: "bot",
        text: data.openingHours ? `Our hours: ${data.openingHours}` : "Please call us to confirm today's timings.",
        links: [{ label: `Call ${data.phone}`, href: tel }],
      };
    }
    if (has(q, ["where", "location", "address", "kahan", "kidhar", "map", "direction", "pata"])) {
      return {
        from: "bot",
        text: data.address ? `We're at ${data.address}.` : "Please call us for directions.",
        links: [{ label: "Open in Google Maps", href: data.mapsUrl }],
      };
    }
    if (has(q, ["fee", "price", "cost", "charges", "kitne", "qeemat", "paise", "kharcha"])) {
      return {
        from: "bot",
        text: "Costs depend on your teeth and the treatment chosen, so we examine first and agree the price with you before starting — no surprises. Message us for an estimate.",
        links: contactLinks,
      };
    }
    if (has(q, ["phone", "number", "call", "contact", "whatsapp", "rabta"])) {
      return { from: "bot", text: `You can reach us on ${data.phone}.`, links: contactLinks };
    }
    if (has(q, ["review", "rating", "google"]) && data.googleRating > 0) {
      return {
        from: "bot",
        text: `We're rated ${data.googleRating.toFixed(1)}★${data.googleReviewCount ? ` from ${data.googleReviewCount} Google reviews` : ""}.`,
        links: [{ label: "Read reviews", href: data.mapsUrl }],
      };
    }
    if (has(q, ["salam", "aoa", "assalam", "hello", "hey"]) || /^hi\b/.test(q)) {
      return { from: "bot", text: "Wa Alaikum Assalam! 👋 How can I help you today?" };
    }
    if (has(q, ["thank", "shukria", "jazak"])) {
      return { from: "bot", text: "You're welcome! Wishing you a healthy smile 😊" };
    }
    return {
      from: "bot",
      text: "I'm not sure about that one. Ask me about services, timings, location or booking — or talk to our team directly.",
      links: contactLinks,
    };
  }

  function botSay(m: Msg, delay = 450) {
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setMsgs((p) => [...p, m]);
    }, delay);
  }

  function startBooking() {
    setStep("name");
    botSay({ from: "bot", text: "Great — let's book you in. What's your full name?" });
  }

  function handleBooking(text: string) {
    if (step === "name") {
      setBooking((b) => ({ ...b, name: text }));
      setStep("phone");
      botSay({ from: "bot", text: `Thanks ${text.split(" ")[0]}! What's your phone number?` });
    } else if (step === "phone") {
      if (!/\d{7,}/.test(text.replace(/[\s-]/g, ""))) {
        botSay({ from: "bot", text: "That doesn't look like a phone number — please enter it like 03xx xxxxxxx." });
        return;
      }
      setBooking((b) => ({ ...b, phone: text }));
      setStep("service");
      botSay({ from: "bot", text: "Which treatment do you need? (e.g. cleaning, root canal, braces, not sure)" });
    } else if (step === "service") {
      setBooking((b) => ({ ...b, service: findService(text.toLowerCase())?.title ?? text }));
      setStep("date");
      botSay({ from: "bot", text: "When would you like to come in? (e.g. tomorrow evening, Saturday 11am)" });
    } else if (step === "date") {
      const f = { ...booking, date: text };
      setBooking(f);
      setStep(null);
      const message = `Assalam o Alaikum, I'd like to book an appointment at ${data.businessName}.\n\nName: ${f.name}\nPhone: ${f.phone}\nTreatment: ${f.service}\nPreferred time: ${f.date}`;
      const link = whatsappLink(data.whatsapp, message);
      botSay({
        from: "bot",
        text: `Here's your request:\n\n👤 ${f.name}\n📞 ${f.phone}\n🦷 ${f.service}\n📅 ${f.date}\n\n${link ? "Tap below to send it on WhatsApp — the clinic will confirm your slot." : "Please call the clinic to confirm your slot."}`,
        links: [...(link ? [{ label: "Send on WhatsApp", href: link }] : []), { label: `Call ${data.phone}`, href: tel }],
      });
    }
  }

  function send(text: string) {
    const t = text.trim();
    if (!t) return;
    setMsgs((p) => [...p, { from: "user", text: t }]);
    setInput("");
    if (step) return handleBooking(t);
    if (/book|appointment|appoint/i.test(t)) return startBooking();
    botSay(reply(t));
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Chat with us"}
        className="fixed right-4 bottom-4 z-[60] grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 sm:right-6 sm:bottom-6"
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
        {!open && <span className="absolute -top-0.5 -right-0.5 size-3.5 rounded-full bg-accent ring-2 ring-background" />}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Chat assistant"
          className="animate-pop fixed right-4 bottom-22 z-[60] flex h-[min(560px,calc(100dvh-7rem))] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-3xl bg-surface shadow-2xl ring-1 ring-border sm:right-6 sm:bottom-24"
        >
          <div className="flex items-center gap-3 bg-primary px-4 py-3 text-primary-foreground">
            <div className="grid size-9 place-items-center rounded-xl bg-white/20 font-display">{data.initial}</div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate font-semibold">{data.businessName}</div>
              <div className="text-xs opacity-80">Usually replies instantly</div>
            </div>
            <a href={tel} aria-label="Call the clinic" className="grid size-9 place-items-center rounded-full bg-white/15 hover:bg-white/25">
              <Phone className="size-4" />
            </a>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-background p-4">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-line ${
                    m.from === "user" ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-surface ring-1 ring-border"
                  }`}
                >
                  {m.text}
                  {m.links && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {m.links.map((l) =>
                        l.action === "book" ? (
                          <button
                            key={l.label}
                            type="button"
                            onClick={() => {
                              setMsgs((p) => [...p, { from: "user", text: "Book appointment" }]);
                              startBooking();
                            }}
                            className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground"
                          >
                            {l.label}
                          </button>
                        ) : l.href.startsWith("/") ? (
                          // Internal page (e.g. services) → client-side navigation, no full reload
                          <Link
                            key={l.label}
                            href={l.href}
                            onClick={() => setOpen(false)}
                            className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary-deep"
                          >
                            {l.label}
                          </Link>
                        ) : (
                          <a
                            key={l.label}
                            href={l.href}
                            target={l.href.startsWith("http") ? "_blank" : undefined}
                            rel="noreferrer"
                            className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary-deep"
                          >
                            {l.label}
                          </a>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex">
                <div className="flex gap-1 rounded-2xl rounded-bl-md bg-surface px-4 py-3 ring-1 ring-border">
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="size-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {!step && (
            <div className="flex gap-1.5 overflow-x-auto border-t border-border bg-surface px-3 py-2">
              {QUICK.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="shrink-0 rounded-full bg-background px-3 py-1.5 text-xs font-medium ring-1 ring-border hover:ring-primary"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={onSubmit} className="flex gap-2 border-t border-border bg-surface p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={step ? "Type your answer…" : "Type your question…"}
              className="min-w-0 flex-1 rounded-full bg-background px-4 py-2.5 text-sm ring-1 ring-border outline-none focus:ring-2 focus:ring-primary"
            />
            <button type="submit" aria-label="Send" className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
              <Send className="size-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
