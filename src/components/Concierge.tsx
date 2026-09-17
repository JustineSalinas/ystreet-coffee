"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { ArrowUp, MessageCircle, X } from "lucide-react";
import { answer, OPENING, type Hit, type Reply } from "@/lib/concierge";

type Message =
  | { id: number; from: "user"; text: string }
  | { id: number; from: "bot"; reply: Reply };

function PriceTag({ hit }: { hit: Hit }) {
  const { item } = hit;
  if (item.hotPrice && item.icedPrice) {
    return (
      <span className="flex shrink-0 gap-2.5 font-mono">
        <span className="flex flex-col items-center leading-none">
          <span className="text-[0.5rem] tracking-[0.15em] text-ink/45">HOT</span>
          <span className="mt-0.5 text-[0.7rem] font-bold text-ink">{item.hotPrice}PHP</span>
        </span>
        <span className="flex flex-col items-center leading-none">
          <span className="text-[0.5rem] tracking-[0.15em] text-ink/45">ICED</span>
          <span className="mt-0.5 text-[0.7rem] font-bold text-ink">{item.icedPrice}PHP</span>
        </span>
      </span>
    );
  }
  return (
    <span className="shrink-0 font-mono text-[0.7rem] font-bold text-ink">
      {item.price}PHP
    </span>
  );
}

function BotBubble({
  reply,
  onChip,
  onScrollTo,
}: {
  reply: Reply;
  onChip: (text: string) => void;
  onScrollTo: (target: string) => void;
}) {
  return (
    <div className="max-w-[92%] space-y-2">
      <div className="rounded-2xl rounded-tl-md bg-paper-dim px-3.5 py-2.5 text-[0.85rem] leading-relaxed text-ink">
        {reply.text}
      </div>
      {reply.items && reply.items.length > 0 && (
        <ul className="overflow-hidden rounded-xl border border-line bg-paper">
          {reply.items.map((hit) => (
            <li
              key={`${hit.category.id}-${hit.item.name}`}
              className="flex items-start justify-between gap-3 border-b border-line px-3 py-2 last:border-b-0"
            >
              <span className="min-w-0">
                <span className="block font-mono text-[0.72rem] font-bold leading-tight text-ink">
                  {hit.item.name}
                </span>
                <span className="block text-[0.62rem] uppercase tracking-[0.12em] text-ink/40">
                  {hit.category.title}
                </span>
              </span>
              <PriceTag hit={hit} />
            </li>
          ))}
        </ul>
      )}
      {reply.link &&
        (reply.link.scrollTo ? (
          <button
            onClick={() => onScrollTo(reply.link!.scrollTo!)}
            className="inline-flex items-center gap-1.5 text-[0.75rem] uppercase tracking-[0.15em] text-gold border-b border-gold/40 pb-0.5 hover:border-gold"
          >
            {reply.link.label}
          </button>
        ) : (
          <a
            href={reply.link.href}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 text-[0.75rem] uppercase tracking-[0.15em] text-gold border-b border-gold/40 pb-0.5 hover:border-gold"
          >
            {reply.link.label}
          </a>
        ))}
      {reply.chips && reply.chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {reply.chips.map((chip) => (
            <button
              key={chip}
              onClick={() => onChip(chip)}
              className="rounded-full border border-gold/40 px-3 py-1 text-[0.7rem] text-ink/80 transition-colors hover:bg-gold hover:text-obsidian"
            >
              {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const TEASER_KEY = "ystreet-concierge-teaser";

export default function Concierge() {
  const lenis = useLenis();
  const [open, setOpen] = useState(false);
  const [teaser, setTeaser] = useState(false);

  // A friendly nudge beside the launcher, a beat after the preloader clears.
  // Dismissing it (or opening the chat) keeps it away for the rest of the visit.
  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(TEASER_KEY) === "1";
    } catch {}
    if (dismissed) return;
    const t = setTimeout(() => setTeaser(true), 3200);
    return () => clearTimeout(t);
  }, []);

  const dismissTeaser = () => {
    setTeaser(false);
    try {
      sessionStorage.setItem(TEASER_KEY, "1");
    } catch {}
  };
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, from: "bot", reply: OPENING },
  ]);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250);
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean || typing) return;
    setMessages((m) => [...m, { id: nextId.current++, from: "user", text: clean }]);
    setInput("");
    setTyping(true);
    const reply = answer(clean);
    // A short beat before replying reads more naturally than an instant answer.
    const delay = Math.min(900, 300 + reply.text.length * 4);
    setTimeout(() => {
      setMessages((m) => [...m, { id: nextId.current++, from: "bot", reply }]);
      setTyping(false);
    }, delay);
  };

  const scrollTo = (target: string) => {
    setOpen(false);
    if (lenis) lenis.scrollTo(target, { offset: -20 });
    else document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            role="dialog"
            aria-label="Y Street Coffee concierge"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-4 z-[90] flex h-[min(34rem,calc(100vh-8rem))] w-[min(calc(100vw-2rem),380px)] flex-col overflow-hidden rounded-2xl border border-gold/30 bg-paper shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] sm:right-6"
          >
            <div className="flex items-center gap-3 border-b border-gold/15 bg-charcoal px-4 py-3">
              <Image
                src="/images/logo-mark.png"
                alt=""
                width={28}
                height={28}
                className="invert opacity-90"
              />
              <div className="min-w-0 flex-1">
                <p className="font-display text-paper leading-tight">
                  y street <span className="italic text-gold">concierge</span>
                </p>
                <p className="text-[0.6rem] uppercase tracking-[0.2em] text-paper/40">
                  Menu · Hours · Directions
                </p>
              </div>
              <button
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-paper/60 hover:bg-paper/10 hover:text-paper"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            <div ref={listRef} className="menu-scroll flex-1 space-y-3 overflow-y-auto px-3 py-4">
              {messages.map((m) =>
                m.from === "user" ? (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-obsidian px-3.5 py-2.5 text-[0.85rem] leading-relaxed text-paper">
                      {m.text}
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="flex justify-start">
                    <BotBubble reply={m.reply} onChip={send} onScrollTo={scrollTo} />
                  </div>
                )
              )}
              {typing && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-2xl rounded-tl-md bg-paper-dim px-3.5 py-3">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        animate={{ opacity: [0.25, 1, 0.25] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
                        className="h-1.5 w-1.5 rounded-full bg-ink/60"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-line bg-paper px-3 py-2.5"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about the menu, hours, Wi-Fi…"
                aria-label="Message"
                className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-[0.85rem] text-ink placeholder:text-ink/40 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Send"
                disabled={!input.trim() || typing}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-obsidian transition-opacity disabled:opacity-30"
              >
                <ArrowUp className="h-4 w-4" strokeWidth={2} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {teaser && !open && (
          <motion.div
            key="teaser"
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-4 z-[90] w-[min(calc(100vw-2rem),290px)] sm:right-6"
          >
            <button
              onClick={() => {
                dismissTeaser();
                setOpen(true);
              }}
              className="relative block w-full rounded-2xl border border-gold/25 bg-charcoal px-4 py-3 text-left text-[0.85rem] leading-snug text-paper shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)]"
            >
              <span className="mr-1.5" aria-hidden>
                👋
              </span>
              Hi! I&apos;m the Y Street concierge — ask me about the menu, hours, or
              how to find us.
              {/* tail pointing at the launcher */}
              <span className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 border-b border-r border-gold/25 bg-charcoal" />
            </button>
            <button
              aria-label="Dismiss"
              onClick={dismissTeaser}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-gold/30 bg-obsidian text-paper/70 hover:text-paper"
            >
              <X className="h-3 w-3" strokeWidth={2} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        aria-label={open ? "Close concierge" : "Ask the concierge"}
        onClick={() => {
          if (!open) dismissTeaser();
          setOpen((o) => !o);
        }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-6 right-4 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-gold text-obsidian shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)] sm:right-6"
      >
        <AnimatePresence initial={false} mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="h-6 w-6" strokeWidth={1.75} />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle className="h-6 w-6" strokeWidth={1.75} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
