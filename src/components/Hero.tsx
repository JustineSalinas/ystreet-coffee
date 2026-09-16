"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.55, 0.85]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-obsidian"
    >
      <motion.div
        style={{ y: imageY, scale: imageScale }}
        className="absolute inset-0"
      >
        <Image
          src="/images/hero-exterior.jpg"
          alt="Y Street Coffee storefront with arched black-framed windows"
          fill
          priority
          quality={95}
          className="object-cover"
          sizes="100vw"
        />
      </motion.div>
      <motion.div
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 bg-gradient-to-b from-obsidian/70 via-obsidian/40 to-obsidian"
      />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 flex h-full flex-col items-center justify-center text-center px-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center gap-3 mb-7"
        >
          <span className="h-px w-8 bg-gold/60" />
          <p className="text-gold-soft uppercase tracking-[0.35em] text-xs sm:text-sm">
            Mandurriao &middot; Iloilo City
          </p>
          <span className="h-px w-8 bg-gold/60" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35 }}
          className="font-display text-paper text-[3.2rem] leading-[0.95] sm:text-7xl md:text-8xl tracking-tight"
        >
          y street <span className="italic text-gold">coffee</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="mt-7 max-w-md text-paper/80 text-base sm:text-lg font-light"
        >
          A quiet white-walled corner in Iloilo, built for slow mornings,
          honest espresso, and matcha done right.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.65 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          <a
            href="#menu"
            className="uppercase tracking-[0.15em] text-sm bg-gold text-obsidian px-8 py-3.5 rounded-full hover:bg-gold-soft transition-colors"
          >
            View Menu
          </a>
          <a
            href="#visit"
            className="uppercase tracking-[0.15em] text-sm border border-paper/40 text-paper px-8 py-3.5 rounded-full hover:border-gold hover:text-gold-soft transition-colors"
          >
            Find Us
          </a>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-paper/60 text-[0.65rem] uppercase tracking-[0.3em]">
          Scroll
        </span>
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="h-8 w-px bg-gold/60"
        />
      </motion.div>
    </section>
  );
}
