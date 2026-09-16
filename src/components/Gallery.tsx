"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Expand } from "lucide-react";
import Reveal from "./Reveal";

type Category = "All" | "Interior" | "Drinks" | "Food" | "Team";

type Photo = {
  src: string;
  alt: string;
  width: number;
  height: number;
  category: Exclude<Category, "All">;
};

const photos: Photo[] = [
  { src: "/images/hero-exterior.jpg", alt: "Storefront with arched black-framed windows", width: 1440, height: 1800, category: "Interior" },
  { src: "/images/interior-wide.jpg", alt: "Wide view of the dining room with arched windows", width: 1672, height: 941, category: "Interior" },
  { src: "/images/drink-matcha-hand.jpg", alt: "Hand holding a strawberry matcha", width: 1440, height: 1440, category: "Drinks" },
  { src: "/images/patio-outdoor.jpg", alt: "Outdoor patio seating with palm trees", width: 1440, height: 1589, category: "Interior" },
  { src: "/images/barista-2.jpg", alt: "Barista pulling espresso behind the counter", width: 1536, height: 2048, category: "Team" },
  { src: "/images/counter-drinks.jpg", alt: "Three iced drinks on the white counter", width: 2048, height: 2048, category: "Drinks" },
  { src: "/images/team-storefront.jpg", alt: "The Y Street Coffee team outside the storefront", width: 2950, height: 2950, category: "Team" },
  { src: "/images/lounge-corner.jpg", alt: "Wooden lounge seating corner", width: 1538, height: 2048, category: "Interior" },
  { src: "/images/drinks-and-treats.jpg", alt: "Iced teas, wedges, and cake on the counter", width: 1440, height: 1777, category: "Drinks" },
  { src: "/images/grilled-cheese.jpg", alt: "Hand pulling a cheesy grilled cheese sandwich", width: 1440, height: 1440, category: "Food" },
  { src: "/images/breakfast-plate.jpg", alt: "Waffle breakfast plate with eggs and sausage", width: 1440, height: 1800, category: "Food" },
  { src: "/images/merch-shelf.jpg", alt: "Y Street Coffee merch shelf with tote and cap", width: 1536, height: 2048, category: "Interior" },
  { src: "/images/arch-entrance.jpg", alt: "Arched entrance with plants and outdoor seating", width: 1440, height: 1800, category: "Interior" },
  { src: "/images/potato-wedges.jpg", alt: "Crispy potato wedges with ketchup", width: 1536, height: 2048, category: "Food" },
];

const CATEGORIES: Category[] = ["All", "Interior", "Drinks", "Food", "Team"];

export default function Gallery() {
  const [filter, setFilter] = useState<Category>("All");
  const [active, setActive] = useState<number | null>(null);

  const filtered =
    filter === "All" ? photos : photos.filter((p) => p.category === filter);

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowRight")
        setActive((a) => (a === null ? a : (a + 1) % filtered.length));
      if (e.key === "ArrowLeft")
        setActive((a) =>
          a === null ? a : (a - 1 + filtered.length) % filtered.length
        );
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, filtered.length]);

  return (
    <section id="gallery" className="relative bg-obsidian py-28 md:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="h-px w-8 bg-gold/60" />
            <p className="uppercase tracking-[0.3em] text-xs text-gold">
              Around The Shop
            </p>
            <span className="h-px w-8 bg-gold/60" />
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-paper">
            A little corner of Iloilo
          </h2>
        </Reveal>

        <Reveal delay={0.05} className="flex flex-wrap justify-center gap-2 mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-[0.15em] border transition-colors ${
                filter === cat
                  ? "bg-gold text-obsidian border-gold"
                  : "border-paper/20 text-paper/60 hover:border-gold/60 hover:text-paper"
              }`}
            >
              {cat}
            </button>
          ))}
        </Reveal>

        <div className="columns-2 md:columns-3 gap-4 [column-fill:balance]">
          {filtered.map((photo, i) => (
            <Reveal
              key={photo.src}
              delay={(i % 6) * 0.05}
              y={16}
              className="mb-4 break-inside-avoid"
            >
              <button
                onClick={() => setActive(i)}
                className="group relative block w-full overflow-hidden rounded-2xl border border-gold/10"
                aria-label={`View larger: ${photo.alt}`}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  quality={95}
                  className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(min-width: 768px) 32vw, 48vw"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-obsidian/70 via-obsidian/0 to-obsidian/0 opacity-0 transition-opacity duration-400 group-hover:opacity-100">
                  <div className="flex w-full items-center justify-between p-4">
                    <p className="text-paper text-xs leading-snug pr-3">
                      {photo.alt}
                    </p>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold text-obsidian">
                      <Expand className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2} className="text-center mt-12">
          <a
            href="https://www.instagram.com/ystreetcoffee"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 uppercase tracking-[0.15em] text-sm text-gold border-b border-gold/40 pb-1 hover:border-gold transition-colors"
          >
            See more on Instagram
          </a>
        </Reveal>
      </div>

      <AnimatePresence>
        {active !== null && filtered[active] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-[100] bg-obsidian/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-10 cursor-zoom-out"
          >
            <motion.div
              key={filtered[active].src}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[85vh] max-w-4xl"
            >
              <Image
                src={filtered[active].src}
                alt={filtered[active].alt}
                width={filtered[active].width}
                height={filtered[active].height}
                quality={100}
                className="max-h-[85vh] w-auto rounded-lg object-contain"
                sizes="90vw"
              />
              <p className="mt-3 text-center text-paper/60 text-sm">
                {filtered[active].alt}
              </p>
            </motion.div>

            <button
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation();
                setActive((a) =>
                  a === null ? a : (a - 1 + filtered.length) % filtered.length
                );
              }}
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center rounded-full border border-gold/40 text-gold hover:bg-gold hover:text-obsidian transition-colors"
            >
              &#8592;
            </button>
            <button
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation();
                setActive((a) => (a === null ? a : (a + 1) % filtered.length));
              }}
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center rounded-full border border-gold/40 text-gold hover:bg-gold hover:text-obsidian transition-colors"
            >
              &#8594;
            </button>
            <button
              aria-label="Close"
              onClick={() => setActive(null)}
              className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center rounded-full border border-gold/40 text-gold hover:bg-gold hover:text-obsidian transition-colors"
            >
              &#10005;
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
