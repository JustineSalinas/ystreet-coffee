"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useAnimationFrame } from "framer-motion";
import { reviews, overallRating, type Review } from "@/lib/reviews";
import Reveal from "./Reveal";
import Stars from "./Stars";

function wrap(min: number, max: number, value: number) {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
}

function TestimonialCard({ review }: { review: Review }) {
  const initial = review.name.trim().charAt(0).toUpperCase() || "Y";
  return (
    <div className="w-[300px] sm:w-[340px] shrink-0 select-none rounded-2xl border border-line bg-paper p-6 shadow-[0_20px_40px_-25px_rgba(0,0,0,0.25)]">
      <Stars rating={review.rating} className="h-3.5 w-3.5 text-gold" />
      <p className="mt-4 text-ink/80 text-sm leading-relaxed min-h-[4.5rem]">
        {review.quote}
      </p>
      <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
        <div className="h-9 w-9 shrink-0 rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center text-gold font-display text-sm">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="text-ink text-sm font-medium truncate">{review.name}</p>
          <p className="text-ink/40 text-xs">{review.time} &middot; Google Review</p>
        </div>
      </div>
    </div>
  );
}

function FlowRow({
  items,
  direction,
  speed,
}: {
  items: Review[];
  direction: 1 | -1;
  speed: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const halted = useRef(false);
  const wheelTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [setWidth, setSetWidth] = useState(0);

  const doubled = [...items, ...items];

  useEffect(() => {
    const measure = () => {
      if (trackRef.current) {
        setSetWidth(trackRef.current.scrollWidth / 2);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [items]);

  // continuous velocity-based loop; picks up from wherever x currently is,
  // so dragging or scrolling never causes a jump when it resumes.
  useAnimationFrame((_, delta) => {
    if (halted.current || !setWidth) return;
    const moveBy = direction * -1 * speed * (delta / 1000);
    x.set(wrap(-setWidth, 0, x.get() + moveBy));
  });

  const halt = () => {
    halted.current = true;
  };
  const resume = () => {
    halted.current = false;
  };

  const onWheel = (e: React.WheelEvent) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (delta === 0 || !setWidth) return;
    e.preventDefault();
    halt();
    x.set(wrap(-setWidth, 0, x.get() - delta));
    if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
    wheelTimeout.current = setTimeout(resume, 700);
  };

  return (
    <div
      className="overflow-hidden py-2"
      style={{
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        maskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
      }}
      onMouseEnter={halt}
      onMouseLeave={resume}
      onWheel={onWheel}
    >
      <motion.div
        ref={trackRef}
        className="flex w-max gap-5 cursor-grab active:cursor-grabbing"
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -setWidth * 3, right: setWidth }}
        dragElastic={0.06}
        onDragStart={halt}
        onDragEnd={resume}
      >
        {doubled.map((review, i) => (
          <TestimonialCard key={`${review.name}-${i}`} review={review} />
        ))}
      </motion.div>
    </div>
  );
}

export default function TestimonialFlow() {
  const mid = Math.ceil(reviews.length / 2);
  const rowA = reviews.slice(0, mid);
  const rowB = reviews.slice(mid);

  return (
    <section className="relative bg-paper py-28 md:py-36 overflow-hidden">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="h-px w-8 bg-gold" />
            <p className="uppercase tracking-[0.3em] text-xs text-gold">
              Reviews
            </p>
            <span className="h-px w-8 bg-gold" />
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-ink">
            What guests are saying
          </h2>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Stars rating={overallRating} className="h-5 w-5 text-gold" />
            <span className="text-ink/70 text-sm">
              {overallRating.toFixed(1)} out of 5 &middot; Google Reviews
            </span>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.1}>
        <div className="space-y-6">
          <FlowRow items={rowA} direction={1} speed={38} />
          <FlowRow items={rowB} direction={-1} speed={32} />
        </div>
      </Reveal>

      <p className="mt-10 text-center text-ink/35 text-xs uppercase tracking-[0.25em]">
        Drag, scroll, or hover to explore
      </p>
    </section>
  );
}
