"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#menu", label: "Menu" },
  { href: "#gallery", label: "Gallery" },
  { href: "#visit", label: "Visit" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const lightText = !scrolled;

  return (
    <header
      // Promoted to its own compositor layer (and no backdrop-filter): with Lenis
      // driving scrollTo every frame, an un-promoted fixed header lags a frame
      // behind on fast scrolls and paints a displaced band under the nav.
      style={{ willChange: "transform", transform: "translateZ(0)" }}
      className={`fixed top-0 inset-x-0 z-50 transition-[background-color,padding,border-color] duration-500 ${
        scrolled
          ? "bg-paper border-b border-line py-3"
          : "bg-transparent py-6"
      }`}
    >
      <div className="mx-auto max-w-6xl px-6 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-3 shrink-0">
          <Image
            src="/images/logo-mark.png"
            alt="Y Street Coffee"
            width={38}
            height={38}
            className={`transition-all duration-500 ${lightText ? "invert" : ""}`}
          />
          <span
            className={`font-display text-lg tracking-[0.02em] transition-colors duration-500 ${
              lightText ? "text-paper" : "text-ink"
            }`}
          >
            y street{" "}
            <span className="italic text-gold">coffee</span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm uppercase tracking-[0.14em] transition-colors ${
                lightText
                  ? "text-paper/75 hover:text-gold-soft"
                  : "text-ink/70 hover:text-gold"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <a
            href="https://www.instagram.com/ystreetcoffee"
            target="_blank"
            rel="noreferrer noopener"
            className={`text-sm uppercase tracking-[0.14em] border rounded-full px-5 py-2 transition-colors ${
              lightText
                ? "border-paper/30 text-paper hover:bg-gold hover:text-obsidian hover:border-gold"
                : "border-gold/40 text-ink hover:bg-gold hover:text-obsidian hover:border-gold"
            }`}
          >
            Instagram
          </a>
        </div>

        <button
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((o) => !o)}
          className="md:hidden flex flex-col gap-1.5 p-2"
        >
          <span
            className={`block h-px w-6 transition-transform ${
              lightText ? "bg-paper" : "bg-ink"
            } ${menuOpen ? "translate-y-[3.5px] rotate-45" : ""}`}
          />
          <span
            className={`block h-px w-6 transition-transform ${
              lightText ? "bg-paper" : "bg-ink"
            } ${menuOpen ? "-translate-y-[3.5px] -rotate-45" : ""}`}
          />
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden bg-paper border-t border-line mt-3"
          >
            <div className="flex flex-col px-6 py-4 gap-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm uppercase tracking-[0.14em] text-ink/80"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="https://www.instagram.com/ystreetcoffee"
                target="_blank"
                rel="noreferrer noopener"
                className="text-sm uppercase tracking-[0.14em] text-gold"
              >
                Instagram
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
