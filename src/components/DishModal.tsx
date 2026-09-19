"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { X } from "lucide-react";
import type { MenuItem } from "@/lib/menu";
import BeanIcon from "@/components/BeanIcon";

export default function DishModal({
  item,
  categoryTitle,
  image,
  onClose,
}: {
  item: MenuItem | null;
  categoryTitle: string;
  image?: string;
  onClose: () => void;
}) {
  // Allow dismissing with the Escape key
  useEffect(() => {
    if (!item) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-obsidian/85 p-4 backdrop-blur-md sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dish-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="paper-page relative w-full max-w-md overflow-hidden rounded-2xl border border-gold/35 p-6 sm:p-7 shadow-[0_35px_90px_-15px_rgba(10,10,9,0.7)] ring-1 ring-gold/20"
          >
            {/* Subtle inner parchment hairline frame */}
            <div className="pointer-events-none absolute inset-2.5 rounded-xl border border-gold/15" />

            {/* Header: Category & Clean Close Button */}
            <div className="relative z-10 flex items-center justify-between gap-3 border-b border-gold/25 pb-3">
              <div className="flex items-center gap-2">
                <BeanIcon className="h-3.5 w-3.5 text-gold" />
                <span className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-ink/75">
                  {categoryTitle}
                </span>
              </div>
              <button
                aria-label="Close modal"
                onClick={onClose}
                className="group flex items-center gap-1.5 rounded-md px-2.5 py-1 text-ink/50 transition-colors hover:bg-gold/15 hover:text-ink cursor-pointer"
              >
                <span className="font-mono text-[0.62rem] uppercase tracking-widest">close</span>
                <X className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-90" strokeWidth={2} />
              </button>
            </div>

            {/* Authentic food photo: ONLY shown when a genuine photo exists for this specific dish */}
            {image && (
              <div className="relative my-4 overflow-hidden rounded-lg border border-gold/25 bg-paper-dim/40 shadow-sm">
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src={image}
                    alt={item.name}
                    fill
                    quality={92}
                    className="object-cover transition-transform duration-500 hover:scale-105"
                    sizes="(min-width: 640px) 440px, 90vw"
                  />
                </div>
              </div>
            )}

            {/* Dish Details */}
            <div className={`relative z-10 ${image ? "pt-1" : "pt-4"}`}>
              {/* Dish Name */}
              <h3
                id="dish-modal-title"
                className="font-display text-2xl sm:text-3xl leading-tight text-ink font-normal"
              >
                {item.name}
              </h3>

              {/* Price Row */}
              {item.hotPrice && item.icedPrice ? (
                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  <div className="flex items-baseline justify-between rounded-lg border border-ink/10 bg-paper/60 px-3.5 py-2">
                    <span className="font-mono text-[0.62rem] uppercase tracking-widest text-ink/50">HOT</span>
                    <span className="font-mono text-sm font-bold text-ink">
                      {item.hotPrice} <span className="text-[0.65rem] font-normal text-ink/40">PHP</span>
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between rounded-lg border border-gold/30 bg-gold/5 px-3.5 py-2">
                    <span className="font-mono text-[0.62rem] uppercase tracking-widest text-gold">ICED</span>
                    <span className="font-mono text-sm font-bold text-ink">
                      {item.icedPrice} <span className="text-[0.65rem] font-normal text-ink/40">PHP</span>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="font-display text-2xl sm:text-3xl text-gold font-medium">{item.price}</span>
                  <span className="font-mono text-xs text-ink/40">PHP</span>
                </div>
              )}

              {/* Dotted separator */}
              <div className="my-4 border-b border-dotted border-ink/20" />

              {/* Description */}
              {item.description ? (
                <p className="font-display italic text-[0.92rem] leading-relaxed text-ink/75">
                  &ldquo;{item.description}&rdquo;
                </p>
              ) : (
                <p className="font-display italic text-[0.88rem] leading-relaxed text-ink/50">
                  Crafted fresh to order at our Mandurriao coffee bar.
                </p>
              )}

              {/* Artisanal Seal / Footer */}
              <div className="mt-5 flex items-center justify-between border-t border-gold/20 pt-3 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-ink/40">
                <span>Y Street Coffee Bar</span>
                <span>Mandurriao · Iloilo City</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
