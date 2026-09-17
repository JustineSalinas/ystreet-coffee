"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import Reveal from "./Reveal";

const faqs = [
  {
    q: "When are you open?",
    a: "Every day, 10AM to 10PM — including weekends.",
  },
  {
    q: "Where exactly are you, and is there parking?",
    a: "Villa Alegre Subd., Brgy. Buhang, Taft North St., Mandurriao, Iloilo City. Look for the white building with the tall arched windows — there's parking right out front.",
  },
  {
    q: "Do you have Wi-Fi and charging?",
    a: "Yes. Free Wi-Fi and charging outlets, so you're welcome to settle in with a laptop or a book.",
  },
  {
    q: "Is it a good spot to study or work?",
    a: "Regulars think so — it's quiet, the seating is comfortable for long stays, and mornings are the calmest if you want the place mostly to yourself.",
  },
  {
    q: "Do you serve food, or just coffee?",
    a: "A full menu: espresso drinks, matcha, frappes, tea, rice meals and pasta, all-day breakfast, and snacks. Flip through the menu book above for everything with prices.",
  },
  {
    q: "Can I bring outside food or my pet?",
    a: "Outside food isn't allowed, and pets aren't permitted inside the shop.",
  },
  {
    q: "How can I get in touch?",
    a: "Email ystreetcoffee@gmail.com, or message us on Instagram at @ystreetcoffee.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative bg-paper-dim py-28 md:py-36 border-t border-line">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="h-px w-8 bg-gold" />
            <p className="uppercase tracking-[0.3em] text-xs text-gold">
              Good to know
            </p>
            <span className="h-px w-8 bg-gold" />
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-ink">
            Before you visit
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <ul className="divide-y divide-line border-y border-line">
            {faqs.map((faq, i) => {
              const isOpen = open === i;
              return (
                <li key={faq.q}>
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="group flex w-full items-center justify-between gap-6 py-5 text-left"
                  >
                    <span className="font-display text-lg sm:text-xl text-ink group-hover:text-gold transition-colors">
                      {faq.q}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold"
                    >
                      <Plus className="h-4 w-4" strokeWidth={1.75} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pb-6 pr-14 text-ink/65 leading-relaxed">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
