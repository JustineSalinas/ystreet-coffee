"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import { menu, type MenuItem, type MenuCategory } from "@/lib/menu";
import Reveal from "./Reveal";
import BeanIcon from "./BeanIcon";
import DishModal from "./DishModal";

const TOTAL = menu.length;

function DishRow({
  item,
  onSelect,
}: {
  item: MenuItem;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        onClick={onSelect}
        className="group -mx-2 flex w-[calc(100%+1rem)] items-baseline gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-gold/[0.08]"
      >
        <span className="text-ink font-medium text-sm sm:text-base">
          {item.name}
        </span>
        <span className="flex-1 border-b border-dotted border-ink/25 translate-y-[-3px]" />
        {item.hotPrice ? (
          <span className="text-xs sm:text-sm text-ink/70 whitespace-nowrap">
            <span className="text-ink/40 text-[0.6rem] mr-1">HOT</span>
            ₱{item.hotPrice}
            <span className="text-ink/40 text-[0.6rem] mx-1">/</span>
            <span className="text-ink/40 text-[0.6rem] mr-1">ICED</span>
            ₱{item.icedPrice}
          </span>
        ) : (
          <span className="text-gold font-display text-base sm:text-lg whitespace-nowrap">
            ₱{item.price}
          </span>
        )}
        <Eye
          className="h-3.5 w-3.5 shrink-0 text-gold opacity-0 transition-opacity group-hover:opacity-100"
          strokeWidth={1.75}
        />
      </button>
      {item.description && (
        <p className="text-ink/45 text-xs sm:text-sm px-2 -mt-0.5 max-w-sm">
          {item.description}
        </p>
      )}
    </li>
  );
}

export default function MenuBook() {
  const [flipped, setFlipped] = useState(0);
  const [selected, setSelected] = useState<{
    item: MenuItem;
    category: MenuCategory;
  } | null>(null);

  const next = () => setFlipped((c) => (c >= TOTAL ? 0 : c + 1));
  const prev = () => setFlipped((c) => Math.max(0, c - 1));
  const jumpTo = (idx: number) => setFlipped(idx + 1);

  const isOpen = flipped > 0;
  const isClosed = flipped === 0;
  const isFinished = flipped >= TOTAL;

  return (
    <section
      id="menu"
      className="relative bg-obsidian py-28 md:py-36 overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.06]">
        <BeanIcon className="h-[70vh] w-[70vh] text-gold" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="h-px w-8 bg-gold/60" />
            <p className="uppercase tracking-[0.3em] text-xs text-gold">
              The Menu
            </p>
            <span className="h-px w-8 bg-gold/60" />
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-paper">
            Turn the page
          </h2>
          <p className="mt-4 text-paper/50">
            Open daily 10AM–10PM &middot; Prices in PHP &middot; Tap a dish for a closer look
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div
            className="relative mx-auto"
            style={{
              width: "min(94vw, 940px)",
              aspectRatio: "16 / 9",
              perspective: 2600,
            }}
          >
            {/* base layer: closed cover (left, static) + back cover / finale (right, static) */}
            <div className="absolute inset-0 flex rounded-[1.25rem] overflow-hidden border border-gold/25 shadow-[0_40px_90px_-20px_rgba(0,0,0,0.75)]">
              <div className="relative w-1/2 h-full bg-charcoal flex flex-col items-center justify-center gap-4 border-r border-gold/10">
                <Image
                  src="/images/logo-mark.png"
                  alt="Y Street Coffee"
                  width={56}
                  height={56}
                  className="invert opacity-80"
                />
                <p className="font-display italic text-gold-soft text-lg">
                  y street coffee
                </p>
              </div>
              <div className="relative w-1/2 h-full bg-paper flex flex-col items-center justify-center text-center px-8 gap-3">
                <BeanIcon className="h-8 w-8 text-gold" />
                <p className="font-display text-2xl text-ink">
                  See you soon
                </p>
                <p className="text-ink/50 text-sm max-w-[220px]">
                  Open daily 10AM–10PM in Mandurriao, Iloilo City
                </p>
              </div>
            </div>

            {/* spine shadow */}
            <div className="pointer-events-none absolute left-1/2 top-0 h-full w-8 -translate-x-1/2 bg-gradient-to-r from-black/25 via-black/0 to-black/25 z-30" />

            {/* leaves */}
            {menu.map((category, i) => {
              const isFlipped = i < flipped;
              const z = isFlipped ? i + 1 : TOTAL - i;
              const delay = isFlipped
                ? i * 0.045
                : (TOTAL - 1 - i) * 0.045;

              return (
                <motion.div
                  key={category.id}
                  className="absolute top-0 right-0 h-full"
                  style={{
                    width: "50%",
                    transformStyle: "preserve-3d",
                    transformOrigin: "left center",
                    zIndex: z,
                  }}
                  animate={{ rotateY: isFlipped ? -180 : 0 }}
                  transition={{
                    duration: 0.65,
                    delay,
                    ease: [0.65, 0, 0.35, 1],
                  }}
                >
                  {/* left page: category title + photo */}
                  <div
                    className="absolute inset-0 rounded-r-[1.25rem] overflow-hidden bg-paper border-l border-gold/10 flex flex-col"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="font-display text-5xl sm:text-6xl text-gold/20 leading-none">
                          {String(i + 1).padStart(2, "0")}
                        </p>
                        <h3 className="mt-3 font-display text-2xl sm:text-3xl text-ink leading-tight">
                          {category.title}
                        </h3>
                        {category.subtitle && (
                          <p className="mt-2 italic text-ink/50 font-display text-sm sm:text-base">
                            {category.subtitle}
                          </p>
                        )}
                      </div>
                      <div className="relative mt-4 aspect-[4/3] w-full overflow-hidden rounded-lg">
                        <Image
                          src={category.image}
                          alt={category.title}
                          fill
                          quality={92}
                          className="object-cover"
                          sizes="(min-width: 768px) 24vw, 45vw"
                        />
                      </div>
                    </div>
                  </div>

                  {/* middle + right pages: item list split into two columns */}
                  <div
                    className="absolute inset-0 rounded-l-[1.25rem] overflow-hidden bg-paper border-r border-gold/10"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <div className="menu-scroll relative h-full overflow-y-auto p-6 sm:p-8">
                      <p className="text-xs uppercase tracking-[0.2em] text-gold mb-4">
                        {category.title}
                      </p>
                      <div
                        className="pointer-events-none absolute left-1/2 top-16 bottom-6 w-px -translate-x-1/2 bg-ink/10 hidden sm:block"
                        aria-hidden
                      />
                      <ul className="sm:columns-2 sm:gap-x-10 space-y-4 sm:space-y-0 [&>li]:mb-4 [&>li]:break-inside-avoid">
                        {category.items.map((item) => (
                          <DishRow
                            key={item.name}
                            item={item}
                            onSelect={() => setSelected({ item, category })}
                          />
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* controls */}
          <div className="flex items-center justify-center gap-6 mt-10">
            <button
              aria-label="Previous page"
              onClick={prev}
              disabled={isClosed}
              className="h-12 w-12 flex items-center justify-center rounded-full border border-gold/40 text-gold hover:bg-gold hover:text-obsidian transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              &#8592;
            </button>
            <span className="text-paper/60 text-sm tracking-widest w-24 text-center">
              {isClosed
                ? "Closed"
                : isFinished
                  ? "The End"
                  : `${String(flipped).padStart(2, "0")} / ${String(TOTAL).padStart(2, "0")}`}
            </span>
            <button
              aria-label="Next page"
              onClick={next}
              className="h-12 w-12 flex items-center justify-center rounded-full border border-gold/40 text-gold hover:bg-gold hover:text-obsidian transition-colors"
            >
              {isFinished ? "↻" : "→"}
            </button>
          </div>

          <p className="text-center text-paper/40 text-xs uppercase tracking-[0.25em] mt-4">
            {isOpen
              ? "Click the arrows to turn the page"
              : "Click the arrow to open the book"}
          </p>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-10">
            {menu.map((cat, idx) => (
              <button
                key={cat.id}
                onClick={() => jumpTo(idx)}
                className={`text-xs uppercase tracking-[0.15em] transition-colors ${
                  idx === flipped - 1
                    ? "text-gold"
                    : "text-paper/40 hover:text-paper/70"
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </Reveal>
      </div>

      <DishModal
        item={selected?.item ?? null}
        categoryTitle={selected?.category.title ?? ""}
        image={selected?.item.image ?? selected?.category.image ?? ""}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
