"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { X } from "lucide-react";
import type { MenuItem } from "@/lib/menu";

export default function DishModal({
  item,
  categoryTitle,
  image,
  onClose,
}: {
  item: MenuItem | null;
  categoryTitle: string;
  image: string;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-obsidian/90 backdrop-blur-sm p-4 sm:p-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gold/25 bg-paper shadow-[0_40px_90px_-20px_rgba(0,0,0,0.6)]"
          >
            <button
              aria-label="Close"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 h-9 w-9 flex items-center justify-center rounded-full bg-obsidian/60 text-paper hover:bg-gold hover:text-obsidian transition-colors"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>

            <div className="relative aspect-[4/3] w-full">
              <Image
                src={image}
                alt={item.name}
                fill
                quality={92}
                className="object-cover"
                sizes="(min-width: 640px) 480px, 90vw"
              />
            </div>

            <div className="p-6 sm:p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-gold mb-2">
                {categoryTitle}
              </p>
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-display text-2xl text-ink leading-tight">
                  {item.name}
                </h3>
                {item.hotPrice ? (
                  <span className="flex shrink-0 gap-4 font-mono mt-1">
                    <span className="flex flex-col items-center leading-none">
                      <span className="text-[0.55rem] tracking-[0.15em] text-ink/45">HOT</span>
                      <span className="mt-1 text-sm font-bold text-ink">{item.hotPrice}PHP</span>
                    </span>
                    <span className="flex flex-col items-center leading-none">
                      <span className="text-[0.55rem] tracking-[0.15em] text-ink/45">ICED</span>
                      <span className="mt-1 text-sm font-bold text-ink">{item.icedPrice}PHP</span>
                    </span>
                  </span>
                ) : (
                  <span className="font-mono text-base font-bold text-ink shrink-0 mt-1">
                    {item.price}PHP
                  </span>
                )}
              </div>
              {item.description ? (
                <p className="mt-3 text-ink/60 text-sm leading-relaxed">
                  {item.description}
                </p>
              ) : (
                <p className="mt-3 text-ink/40 text-sm italic">
                  A Y Street favorite from our {categoryTitle.toLowerCase()}.
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
