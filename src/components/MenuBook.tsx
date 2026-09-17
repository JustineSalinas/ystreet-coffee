"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import {
  animate,
  motion,
  motionValue,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Eye } from "lucide-react";
import { menu, type MenuItem, type MenuCategory } from "@/lib/menu";
import Reveal from "./Reveal";
import BeanIcon from "./BeanIcon";
import DishModal from "./DishModal";

/** Leaf 0 is the cover; leaves 1..n are the menu categories. */
const TOTAL = menu.length + 1;
const TURN_MS = 720;
const EASE: [number, number, number, number] = [0.65, 0, 0.35, 1];

/* ---------------------------------------- pages ---------------------------------------- */

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
        data-dish
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

function PageNumber({ n, side }: { n: number; side: "left" | "right" }) {
  return (
    <span
      className={`pointer-events-none absolute bottom-3 font-display text-[0.65rem] tracking-[0.2em] text-ink/35 ${
        side === "left" ? "left-5" : "right-5"
      }`}
    >
      {String(n).padStart(2, "0")}
    </span>
  );
}

function CoverFront() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-5 bg-charcoal">
      <div className="pointer-events-none absolute inset-3 rounded-[0.9rem] border border-gold/30" />
      <Image
        src="/images/logo-mark.png"
        alt="Y Street Coffee"
        width={64}
        height={64}
        className="invert opacity-90"
      />
      <div className="text-center">
        <p className="font-display text-2xl sm:text-3xl text-paper">
          y street <span className="italic text-gold">coffee</span>
        </p>
        <p className="mt-2 text-[0.65rem] uppercase tracking-[0.35em] text-gold/80">
          The Menu
        </p>
      </div>
      <p className="absolute bottom-6 text-[0.6rem] uppercase tracking-[0.25em] text-paper/40">
        Mandurriao &middot; Iloilo City
      </p>
    </div>
  );
}

function CoverInside() {
  return (
    <div className="paper-page relative flex h-full w-full flex-col items-center justify-center gap-4 px-8 text-center">
      <BeanIcon className="h-7 w-7 text-gold" />
      <p className="font-display italic text-ink/70 text-lg sm:text-xl max-w-[16rem] leading-snug">
        Pulled to order, whisked fresh, and built for people who linger.
      </p>
      <div className="mt-2 h-px w-10 bg-gold/50" />
      <p className="text-ink/55 text-xs sm:text-sm leading-relaxed">
        Open daily &middot; 10AM – 10PM
        <br />
        Prices in PHP &middot; Tap any dish for a closer look
      </p>
    </div>
  );
}

function TitlePage({ category, index }: { category: MenuCategory; index: number }) {
  return (
    <div className="paper-page relative flex h-full w-full flex-col p-6 sm:p-8">
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <p className="font-display text-5xl sm:text-6xl text-gold/20 leading-none">
            {String(index + 1).padStart(2, "0")}
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
            draggable={false}
            className="object-cover"
            sizes="(min-width: 768px) 24vw, 45vw"
          />
        </div>
      </div>
      <PageNumber n={index * 2 + 1} side="right" />
    </div>
  );
}

function ItemsPage({
  category,
  index,
  onSelect,
}: {
  category: MenuCategory;
  index: number;
  onSelect: (item: MenuItem) => void;
}) {
  return (
    <div className="paper-page relative h-full w-full">
      <div
        className="menu-scroll relative h-full overflow-y-auto p-6 pb-9 sm:p-8 sm:pb-9"
        style={{ touchAction: "pan-y" }}
      >
        <p className="text-xs uppercase tracking-[0.2em] text-gold mb-4">
          {category.title}
        </p>
        <div
          className="pointer-events-none absolute left-1/2 top-16 bottom-9 w-px -translate-x-1/2 bg-ink/10 hidden sm:block"
          aria-hidden
        />
        <ul className="sm:columns-2 sm:gap-x-10 space-y-4 sm:space-y-0 [&>li]:mb-4 [&>li]:break-inside-avoid">
          {category.items.map((item) => (
            <DishRow key={item.name} item={item} onSelect={() => onSelect(item)} />
          ))}
        </ul>
      </div>
      <PageNumber n={index * 2 + 2} side="left" />
    </div>
  );
}

/* ---------------------------------------- leaf ----------------------------------------- */

function Leaf({
  rotate,
  zIndex,
  front,
  back,
  isCover = false,
}: {
  rotate: MotionValue<number>;
  zIndex: number;
  front: ReactNode;
  back: ReactNode;
  isCover?: boolean;
}) {
  // Faces darken as they turn edge-on, strongest near the spine; a soft cast
  // shadow swells around the midpoint of the turn.
  const frontShade = useTransform(rotate, [0, -90, -180], [0, 0.55, 0]);
  const backShade = useTransform(rotate, [0, -90, -180], [0, 0.55, 0]);
  const shadow = useTransform(
    rotate,
    [0, -90, -180],
    [
      "0px 0px 0px rgba(0,0,0,0)",
      "-30px 0px 44px rgba(0,0,0,0.45)",
      "0px 0px 0px rgba(0,0,0,0)",
    ]
  );

  return (
    <motion.div
      className="absolute top-0 right-0 h-full w-1/2"
      style={{
        rotateY: rotate,
        boxShadow: shadow,
        transformStyle: "preserve-3d",
        transformOrigin: "left center",
        zIndex,
      }}
    >
      <div
        className={`absolute inset-0 overflow-hidden rounded-r-[1.25rem] border-l border-gold/10 ${
          isCover ? "rounded-l-[1.25rem] border border-gold/25" : ""
        }`}
        style={{ backfaceVisibility: "hidden" }}
      >
        {front}
        <motion.div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"
          style={{ opacity: frontShade }}
        />
      </div>
      <div
        className="absolute inset-0 overflow-hidden rounded-l-[1.25rem] border-r border-gold/10"
        style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
      >
        {back}
        <motion.div
          className="pointer-events-none absolute inset-0 bg-gradient-to-l from-black via-black/40 to-transparent"
          style={{ opacity: backShade }}
        />
      </div>
    </motion.div>
  );
}

/* ---------------------------------------- book ----------------------------------------- */

type Drag = {
  pointerId: number;
  leaf: number;
  dir: 1 | -1;
  startX: number;
  startY: number;
  axis: "x" | "y" | null;
  progress: number;
  onDish: boolean;
};

export default function MenuBook() {
  const [flipped, setFlipped] = useState(0);
  const [dragLeaf, setDragLeaf] = useState<number | null>(null);
  const [selected, setSelected] = useState<{
    item: MenuItem;
    category: MenuCategory;
  } | null>(null);

  const bookRef = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const prevFlipped = useRef(0);
  const hovering = useRef(false);

  const rotations = useMemo(
    () => Array.from({ length: TOTAL }, () => motionValue(0)),
    []
  );

  // Drive every leaf toward its resting angle. Single steps run at full speed
  // (or proportionally faster when a drag already did part of the turn);
  // multi-leaf jumps cascade with a short stagger.
  useEffect(() => {
    const changed = Math.abs(flipped - prevFlipped.current);
    const closing = flipped < prevFlipped.current;
    prevFlipped.current = flipped;

    rotations.forEach((mv, i) => {
      const target = i < flipped ? -180 : 0;
      const remaining = Math.abs(target - mv.get());
      if (remaining < 0.5) return;
      const delay =
        changed > 1 ? (closing ? TOTAL - 1 - i : i) * 0.045 : 0;
      const duration = Math.max(0.28, (TURN_MS / 1000) * (remaining / 180));
      animate(mv, target, { duration, delay, ease: EASE });
    });
  }, [flipped, rotations]);

  const next = () => setFlipped((c) => (c >= TOTAL ? 0 : c + 1));
  const prev = () => setFlipped((c) => Math.max(0, c - 1));
  const jumpTo = (categoryIdx: number) => setFlipped(categoryIdx + 2);

  /* ---- drag / tap to turn ---- */

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const rect = bookRef.current?.getBoundingClientRect();
    if (!rect) return;

    // When closed, the whole visible book is the cover: any press turns it.
    const onRight = flipped === 0 || e.clientX > rect.left + rect.width / 2;
    const dir: 1 | -1 = onRight ? 1 : -1;
    if (dir === 1 && flipped >= TOTAL) return;
    if (dir === -1 && flipped <= 0) return;

    const leaf = dir === 1 ? flipped : flipped - 1;
    drag.current = {
      pointerId: e.pointerId,
      leaf,
      dir,
      startX: e.clientX,
      startY: e.clientY,
      axis: null,
      progress: 0,
      onDish: !!(e.target as Element).closest("[data-dish]"),
    };
    setDragLeaf(leaf);
    // Capture deliberately waits until a horizontal drag is confirmed, so a
    // plain tap on a dish still delivers its click to the dish button.
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;

    if (d.axis === null) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      d.axis = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
      if (d.axis === "y") {
        // Vertical intent (scrolling a long item list): hand back to the browser.
        drag.current = null;
        setDragLeaf(null);
        return;
      }
      e.currentTarget.setPointerCapture(e.pointerId);
    }

    const pageWidth = (bookRef.current?.getBoundingClientRect().width ?? 800) / 2;
    d.progress = Math.min(1, Math.max(0, (d.dir === 1 ? -dx : dx) / pageWidth));
    rotations[d.leaf].set(d.dir === 1 ? -180 * d.progress : -180 + 180 * d.progress);
  };

  const releasePointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    drag.current = null;
    setDragLeaf(null);
    releasePointer(e);

    if (d.axis === null) {
      // A tap: turn the page, unless it was on a dish (its own click opens the modal).
      if (!d.onDish) setFlipped((c) => c + d.dir);
      return;
    }
    if (d.progress > 0.35) {
      setFlipped((c) => c + d.dir);
    } else {
      animate(rotations[d.leaf], d.dir === 1 ? 0 : -180, {
        duration: 0.35,
        ease: EASE,
      });
    }
  };

  // The browser took the pointer (e.g. it started scrolling the item list):
  // never commit a turn from this, just put the page back.
  const onPointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    drag.current = null;
    setDragLeaf(null);
    releasePointer(e);
    animate(rotations[d.leaf], d.dir === 1 ? 0 : -180, { duration: 0.3, ease: EASE });
  };

  /* ---- keyboard, only while the pointer is over the book ---- */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!hovering.current) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isClosed = flipped === 0;
  const isFinished = flipped >= TOTAL;
  const activeCategory = flipped - 2;

  const counter = isClosed
    ? "Closed"
    : isFinished
      ? "The End"
      : flipped === 1
        ? "Welcome"
        : `${String(flipped - 1).padStart(2, "0")} / ${String(menu.length).padStart(2, "0")}`;

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
            Drag a page corner or tap to turn &middot; Tap a dish for a closer look
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          {/* Closed, the book slides right so the cover sits centred; it opens out to a spread. */}
          <motion.div
            animate={{ x: isClosed ? "-25%" : "0%" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="relative mx-auto"
            style={{ width: "min(94vw, 940px)" }}
          >
            <div
              ref={bookRef}
              className="relative select-none"
              style={{
                aspectRatio: "16 / 9",
                perspective: 2600,
                touchAction: "pan-y",
                cursor: dragLeaf !== null ? "grabbing" : "grab",
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerCancel}
              // Native drag-and-drop (images, selected text) would cancel the pointer stream mid-turn.
              onDragStart={(e) => e.preventDefault()}
              onMouseEnter={() => {
                hovering.current = true;
              }}
              onMouseLeave={() => {
                hovering.current = false;
              }}
            >
              {/* boards beneath the leaves: back cover (left) and closing page (right) */}
              <div className="absolute inset-0 flex">
                <motion.div
                  animate={{ opacity: isClosed ? 0 : 1 }}
                  transition={{ duration: 0.4 }}
                  className="relative w-1/2 h-full rounded-l-[1.25rem] bg-charcoal border border-r-0 border-gold/25 shadow-[0_40px_90px_-20px_rgba(0,0,0,0.75)]"
                />
                <div className="paper-page relative w-1/2 h-full flex flex-col items-center justify-center text-center px-8 gap-3 rounded-r-[1.25rem] border border-l-0 border-gold/25 shadow-[0_40px_90px_-20px_rgba(0,0,0,0.75)]">
                  <BeanIcon className="h-8 w-8 text-gold" />
                  <p className="font-display text-2xl text-ink">See you soon</p>
                  <p className="text-ink/50 text-sm max-w-[220px]">
                    Open daily 10AM–10PM in Mandurriao, Iloilo City
                  </p>
                </div>
              </div>

              {/* page-edge thickness on each stack */}
              <motion.div
                animate={{ opacity: isClosed ? 0 : Math.min(1, flipped / 3) }}
                className="pointer-events-none absolute left-0 top-[3%] bottom-[3%] w-[6px] rounded-l-sm bg-[repeating-linear-gradient(to_right,rgba(0,0,0,0.18)_0,rgba(0,0,0,0.18)_1px,transparent_1px,transparent_2px)] z-30"
              />
              <motion.div
                animate={{ opacity: Math.min(1, (TOTAL - flipped) / 3) }}
                className="pointer-events-none absolute right-0 top-[3%] bottom-[3%] w-[6px] rounded-r-sm bg-[repeating-linear-gradient(to_left,rgba(0,0,0,0.18)_0,rgba(0,0,0,0.18)_1px,transparent_1px,transparent_2px)] z-30"
              />

              {/* spine */}
              <motion.div
                animate={{ opacity: isClosed ? 0 : 1 }}
                className="pointer-events-none absolute left-1/2 top-0 h-full w-8 -translate-x-1/2 bg-gradient-to-r from-black/25 via-black/0 to-black/25 z-30"
              />

              {/* leaves */}
              <Leaf
                isCover
                rotate={rotations[0]}
                zIndex={dragLeaf === 0 ? TOTAL + 5 : 0 < flipped ? 1 : TOTAL}
                front={<CoverFront />}
                back={<CoverInside />}
              />
              {menu.map((category, ci) => {
                const i = ci + 1;
                const z =
                  dragLeaf === i ? TOTAL + 5 : i < flipped ? i + 1 : TOTAL - i;
                return (
                  <Leaf
                    key={category.id}
                    rotate={rotations[i]}
                    zIndex={z}
                    front={<TitlePage category={category} index={ci} />}
                    back={
                      <ItemsPage
                        category={category}
                        index={ci}
                        onSelect={(item) => setSelected({ item, category })}
                      />
                    }
                  />
                );
              })}
            </div>
          </motion.div>

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
              {counter}
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
            {isClosed ? "Tap the cover to open" : "Drag a page or use ← → to turn"}
          </p>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-10">
            {menu.map((cat, idx) => (
              <button
                key={cat.id}
                onClick={() => jumpTo(idx)}
                className={`text-xs uppercase tracking-[0.15em] transition-colors ${
                  idx === activeCategory
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
