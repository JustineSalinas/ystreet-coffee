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
import { menu, type MenuItem, type MenuCategory } from "@/lib/menu";
import Reveal from "./Reveal";
import BeanIcon from "./BeanIcon";
import DishModal from "./DishModal";

/**
 * Desktop shows an open spread: leaf 0 is the cover and each following leaf
 * carries two menu pages (front/back). Phones show one page at a time, so every
 * page becomes its own leaf: cover, inside cover, the categories, back page.
 */
const CONTENT_LEAVES = Math.ceil(menu.length / 2);
const SPREAD_TOTAL = CONTENT_LEAVES + 1;
const SINGLE_TOTAL = menu.length + 3;
const MAX_LEAVES = Math.max(SPREAD_TOTAL, SINGLE_TOTAL);
const TURN_MS = 720;
const EASE: [number, number, number, number] = [0.65, 0, 0.35, 1];

/* ---------------------------------------- pages ---------------------------------------- */
/* A classic printed-menu treatment: serif item names on a dotted leader out to
   the price, with monospace reserved for structural type (labels, page numbers,
   the price figures themselves) as an accent rather than the whole page.       */

function Price({ item }: { item: MenuItem }) {
  if (item.hotPrice && item.icedPrice) {
    return (
      <span className="shrink-0 whitespace-nowrap font-mono text-[0.68rem] text-ink/60">
        <span className="mr-1 text-[0.55rem] tracking-[0.1em] text-ink/40">HOT</span>
        {item.hotPrice}
        <span className="mx-1.5 text-ink/30">/</span>
        <span className="mr-1 text-[0.55rem] tracking-[0.1em] text-ink/40">ICED</span>
        {item.icedPrice}
      </span>
    );
  }
  return (
    <span className="shrink-0 whitespace-nowrap font-display text-[1.05rem] leading-none text-gold">
      {item.price}
      <span className="ml-0.5 font-mono text-[0.55rem] text-ink/40">PHP</span>
    </span>
  );
}

function DishCard({
  item,
  onSelect,
}: {
  item: MenuItem;
  onSelect: () => void;
}) {
  return (
    <li className="break-inside-avoid">
      <button
        onClick={onSelect}
        data-dish
        className="group flex w-full items-baseline gap-2 rounded-md px-1.5 py-1.5 text-left transition-colors hover:bg-gold/10"
      >
        <span className="shrink-0 whitespace-nowrap font-display text-[0.98rem] leading-tight text-ink transition-colors group-hover:text-gold">
          {item.name}
        </span>
        <span className="mb-[3px] flex-1 border-b border-dotted border-ink/25" />
        <Price item={item} />
      </button>
      {item.description && (
        <p className="px-1.5 pb-1.5 -mt-0.5 text-[0.68rem] italic leading-snug text-ink/45">
          {item.description}
        </p>
      )}
    </li>
  );
}

function PageChrome({
  label,
  pageNo,
  side,
  children,
}: {
  label: string;
  pageNo: number;
  side: "left" | "right";
  children: ReactNode;
}) {
  return (
    <div className="paper-page relative flex h-full w-full flex-col px-5 pt-5 pb-7 sm:px-7 sm:pt-6">
      <div className="flex items-baseline justify-between border-b border-gold/25 pb-2">
        <span className="font-display text-[0.95rem] uppercase tracking-[0.15em] text-ink">
          {label}
        </span>
        <span className="font-mono text-[0.6rem] text-ink/40">{String(pageNo).padStart(2, "0")}</span>
      </div>
      <div className="menu-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden" style={{ touchAction: "pan-y" }}>
        <div className="flex min-h-full flex-col">{children}</div>
      </div>
      <span
        className={`pointer-events-none absolute bottom-2.5 font-mono text-[0.55rem] tracking-[0.25em] text-ink/35 ${
          side === "left" ? "left-5 sm:left-7" : "right-5 sm:right-7"
        }`}
      >
        Y STREET COFFEE
      </span>
    </div>
  );
}

function CategoryPage({
  category,
  pageNo,
  side,
  onSelect,
}: {
  category: MenuCategory;
  pageNo: number;
  side: "left" | "right";
  onSelect: (item: MenuItem) => void;
}) {
  return (
    <PageChrome label={category.title} pageNo={pageNo} side={side}>
      {category.subtitle && (
        <p className="mt-3 font-display italic text-[0.8rem] text-ink/55">{category.subtitle}</p>
      )}
      <ul className="mt-4">
        {category.items.map((item) => (
          <DishCard key={item.name} item={item} onSelect={() => onSelect(item)} />
        ))}
      </ul>
      {category.items.length <= 6 && (
        <div className="relative mt-4 min-h-[6.5rem] flex-1 w-full overflow-hidden rounded-[3px]">
          <Image
            src={category.image}
            alt={category.title}
            fill
            quality={90}
            draggable={false}
            className="object-cover"
            sizes="(min-width: 768px) 28vw, 45vw"
          />
        </div>
      )}
    </PageChrome>
  );
}

function CoverFront() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-5 bg-charcoal">
      <div className="pointer-events-none absolute inset-2.5 rounded-[4px] border border-gold/30" />
      <Image
        src="/images/logo-mark.png"
        alt="Y Street Coffee"
        width={64}
        height={64}
        draggable={false}
        className="invert opacity-90"
      />
      <div className="text-center">
        <p className="font-display text-2xl sm:text-3xl text-paper">
          y street <span className="italic text-gold">coffee</span>
        </p>
        <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.35em] text-gold/80">
          menu
        </p>
      </div>
      <p className="absolute bottom-6 font-mono text-[0.55rem] uppercase tracking-[0.25em] text-paper/40">
        Open daily 10AM – 10PM
      </p>
    </div>
  );
}

function CoverInside() {
  return (
    <div className="paper-page relative flex h-full w-full flex-col items-center justify-center gap-4 px-8 text-center">
      <div className="relative mb-2 aspect-[4/3] w-3/4 overflow-hidden rounded-[3px]">
        <Image
          src="/images/counter-drinks.jpg"
          alt="Drinks on the counter at Y Street Coffee"
          fill
          quality={90}
          draggable={false}
          className="object-cover"
          sizes="30vw"
        />
      </div>
      <p className="font-display italic text-ink/70 text-base sm:text-lg max-w-[15rem] leading-snug">
        Pulled to order, whisked fresh, and built for people who linger.
      </p>
      <div className="h-px w-10 bg-gold/50" />
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ink/50 leading-loose">
        All prices in PHP
        <br />
        Tap any item for a closer look
      </p>
    </div>
  );
}

function BackInside() {
  return (
    <div className="paper-page relative flex h-full w-full flex-col items-center justify-center gap-3 px-8 text-center">
      <BeanIcon className="h-7 w-7 text-gold" />
      <p className="font-display text-2xl text-ink">See you soon</p>
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ink/50 leading-loose">
        Open daily 10AM – 10PM
        <br />
        Mandurriao, Iloilo City
      </p>
    </div>
  );
}

/* ---------------------------------------- leaf ----------------------------------------- */

function Leaf({
  rotate,
  frontZ,
  backZ,
  dragging = false,
  front,
  back,
  isCover = false,
  single = false,
}: {
  rotate: MotionValue<number>;
  /** Stacking order while this leaf rests flat (unflipped) vs. turned (flipped). */
  frontZ: number;
  backZ: number;
  dragging?: boolean;
  front: ReactNode;
  back: ReactNode;
  isCover?: boolean;
  single?: boolean;
}) {
  // Faces darken as they turn edge-on, strongest near the spine; a soft cast
  // shadow swells around the midpoint of the turn. In single-page mode a fully
  // turned page fades out instead of hanging off the left of the screen.
  const frontShade = useTransform(rotate, [0, -90, -180], [0, 0.55, 0]);
  const backShade = useTransform(rotate, [0, -90, -180], [0, 0.55, 0]);
  const opacity = useTransform(rotate, [-180, -140, 0], single ? [0, 1, 1] : [1, 1, 1]);
  const shadow = useTransform(
    rotate,
    [0, -90, -180],
    [
      "0px 0px 0px rgba(0,0,0,0)",
      "-30px 0px 44px rgba(0,0,0,0.45)",
      "0px 0px 0px rgba(0,0,0,0)",
    ]
  );
  // Swap stacking order only once the leaf is edge-on (±90°) and effectively
  // invisible, instead of the instant a page-turn is requested — otherwise the
  // leaf pops behind/in front of its neighbours mid-turn, worst on a quick
  // prev-button tap where the swap used to happen before the turn even started.
  const liveZ = useTransform(rotate, (r) => (r <= -90 ? backZ : frontZ));

  return (
    <motion.div
      className={`absolute h-[calc(100%-2*var(--board))] ${
        single ? "w-[calc(100%-2*var(--board))]" : "w-[calc(50%-var(--board))]"
      }`}
      style={{
        top: "var(--board)",
        right: "var(--board)",
        rotateY: rotate,
        opacity,
        boxShadow: shadow,
        transformStyle: "preserve-3d",
        transformOrigin: "left center",
        zIndex: dragging ? 999 : liveZ,
      }}
    >
      <div
        className={`absolute inset-0 overflow-hidden ${
          isCover ? "rounded-[5px] border border-gold/25" : single ? "rounded-[3px]" : "rounded-r-[2px]"
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
        className="absolute inset-0 overflow-hidden rounded-l-[2px]"
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
  leaf: number | null;
  dir: 1 | -1 | null;
  startX: number;
  startY: number;
  axis: "x" | "y" | null;
  progress: number;
  onDish: boolean;
};

function useSinglePage() {
  const [single, setSingle] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setSingle(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return single;
}

export default function MenuBook() {
  const single = useSinglePage();
  const TOTAL = single ? SINGLE_TOTAL : SPREAD_TOTAL;

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
    () => Array.from({ length: MAX_LEAVES }, () => motionValue(0)),
    []
  );

  // Switching layouts re-maps pages to leaves, so start the book closed again.
  const [prevSingle, setPrevSingle] = useState(single);
  if (single !== prevSingle) {
    setPrevSingle(single);
    setFlipped(0);
  }

  useEffect(() => {
    rotations.forEach((mv) => mv.set(0));
    prevFlipped.current = 0;
  }, [single, rotations]);

  // Drive every leaf toward its resting angle. Single steps run at full speed
  // (or proportionally faster when a drag already did part of the turn);
  // multi-leaf jumps cascade with a short stagger.
  useEffect(() => {
    const changed = Math.abs(flipped - prevFlipped.current);
    const closing = flipped < prevFlipped.current;
    prevFlipped.current = flipped;

    rotations.slice(0, TOTAL).forEach((mv, i) => {
      const target = i < flipped ? -180 : 0;
      const remaining = Math.abs(target - mv.get());
      if (remaining < 0.5) return;
      const delay = changed > 1 ? (closing ? TOTAL - 1 - i : i) * 0.045 : 0;
      const duration = Math.max(0.28, (TURN_MS / 1000) * (remaining / 180));
      animate(mv, target, { duration, delay, ease: EASE });
    });
  }, [flipped, rotations, TOTAL]);

  const next = () => setFlipped((c) => (c >= TOTAL ? 0 : c + 1));
  const prev = () => setFlipped((c) => Math.max(0, c - 1));

  // Spread: content page p (1-based) sits on leaf ceil(p/2), odd pages on the
  // front, even on the back; it is visible once that many leaves are turned.
  // Single: category ci is leaf ci + 2 and is on top once ci + 2 leaves are turned.
  const jumpTo = (categoryIdx: number) => {
    if (single) {
      setFlipped(categoryIdx + 2);
      return;
    }
    const p = categoryIdx + 1;
    setFlipped(p % 2 === 1 ? (p + 1) / 2 : p / 2 + 1);
  };

  /* ---- drag / tap to turn ---- */

  const leafFor = (dir: 1 | -1) => (dir === 1 ? flipped : flipped - 1);
  const canTurn = (dir: 1 | -1) => (dir === 1 ? flipped < TOTAL : flipped > 0);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const rect = bookRef.current?.getBoundingClientRect();
    if (!rect) return;

    let dir: 1 | -1 | null = null;
    if (!single) {
      // On a spread the side you press decides the direction; when closed the
      // whole visible book is the cover, so any press opens it.
      const onRight = flipped === 0 || e.clientX > rect.left + rect.width / 2;
      dir = onRight ? 1 : -1;
      if (!canTurn(dir)) return;
    }
    // In single-page mode the direction comes from the swipe itself.

    drag.current = {
      pointerId: e.pointerId,
      leaf: dir === null ? null : leafFor(dir),
      dir,
      startX: e.clientX,
      startY: e.clientY,
      axis: null,
      progress: 0,
      onDish: !!(e.target as Element).closest("[data-dish]"),
    };
    if (dir !== null) setDragLeaf(leafFor(dir));
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
      if (d.dir === null) {
        const dir: 1 | -1 = dx < 0 ? 1 : -1;
        if (!canTurn(dir)) {
          drag.current = null;
          return;
        }
        d.dir = dir;
        d.leaf = leafFor(dir);
        setDragLeaf(d.leaf);
      }
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (d.dir === null || d.leaf === null) return;

    const width = bookRef.current?.getBoundingClientRect().width ?? 800;
    const pageWidth = single ? width : width / 2;
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
      if (d.onDish) return;
      const dir = d.dir ?? 1;
      if (canTurn(dir)) setFlipped((c) => c + dir);
      return;
    }
    if (d.dir === null || d.leaf === null) return;
    if (d.progress > 0.35) {
      setFlipped((c) => c + d.dir!);
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
    if (d.dir !== null && d.leaf !== null) {
      animate(rotations[d.leaf], d.dir === 1 ? 0 : -180, { duration: 0.3, ease: EASE });
    }
  };

  /* ---- keyboard, only while the pointer is over the book ---- */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!hovering.current) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setFlipped((c) => (c >= TOTAL ? 0 : c + 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setFlipped((c) => Math.max(0, c - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [TOTAL]);

  const isClosed = flipped === 0;
  const isFinished = flipped >= TOTAL;

  // Which categories are showing, and a page label, for the controls below.
  let visibleCategories: number[] = [];
  let counter = "Closed";
  if (!isClosed) {
    if (single) {
      const top = flipped; // index of the leaf now showing
      const ci = top - 2;
      if (top === 1) counter = "Welcome";
      else if (ci >= 0 && ci < menu.length) {
        visibleCategories = [ci];
        counter = `p. ${ci + 1}`;
      } else counter = "The End";
    } else {
      const leftPage = flipped * 2 - 2;
      const rightPage = flipped * 2 - 1;
      visibleCategories = [leftPage, rightPage]
        .filter((p) => p >= 1 && p <= menu.length)
        .map((p) => p - 1);
      counter =
        visibleCategories.length === 0
          ? "The End"
          : visibleCategories.length === 2
            ? `pp. ${leftPage}–${rightPage}`
            : `p. ${visibleCategories[0] + 1}`;
    }
  }

  const spreadLeaves = Array.from({ length: CONTENT_LEAVES }, (_, li) => {
    const i = li + 1;
    const frontCat = menu[li * 2];
    const backCat = menu[li * 2 + 1];
    return (
      <Leaf
        key={frontCat.id}
        rotate={rotations[i]}
        frontZ={TOTAL - i}
        backZ={i + 1}
        dragging={dragLeaf === i}
        front={
          <CategoryPage
            category={frontCat}
            pageNo={li * 2 + 1}
            side="right"
            onSelect={(item) => setSelected({ item, category: frontCat })}
          />
        }
        back={
          backCat ? (
            <CategoryPage
              category={backCat}
              pageNo={li * 2 + 2}
              side="left"
              onSelect={(item) => setSelected({ item, category: backCat })}
            />
          ) : (
            <BackInside />
          )
        }
      />
    );
  });

  const singlePages: ReactNode[] = [
    <CoverInside key="inside" />,
    ...menu.map((category, ci) => (
      <CategoryPage
        key={category.id}
        category={category}
        pageNo={ci + 1}
        side="right"
        onSelect={(item) => setSelected({ item, category })}
      />
    )),
    <BackInside key="back" />,
  ];
  const singleLeaves = singlePages.map((page, k) => {
    const i = k + 1;
    return (
      <Leaf
        key={i}
        single
        rotate={rotations[i]}
        frontZ={TOTAL - i}
        backZ={i + 1}
        dragging={dragLeaf === i}
        front={page}
        back={<div className="paper-page h-full w-full" />}
      />
    );
  });

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
            {single
              ? "Swipe to turn the page · Tap a dish for a closer look"
              : "Drag a page corner or tap to turn · Tap a dish for a closer look"}
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          {/* On a spread the closed book slides so the cover sits centred, then opens out. */}
          <motion.div
            animate={{ x: !single && isClosed ? "-25%" : "0%" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="relative mx-auto"
            style={{ width: single ? "min(100%, 400px)" : "min(94vw, 900px)" }}
          >
            <div
              ref={bookRef}
              className="relative select-none"
              style={{
                // Desktop: a landscape booklet of two portrait pages. Phone: one
                // portrait page. The hardcover boards stand proud by --board.
                aspectRatio: single ? "0.74 / 1" : "1.5 / 1",
                ["--board" as string]: "clamp(4px, 0.8vw, 8px)",
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
              {/* hardcover boards beneath the leaves */}
              {single ? (
                <div className="absolute inset-0 rounded-[6px] bg-charcoal shadow-[0_40px_90px_-20px_rgba(0,0,0,0.8)]">
                  <div className="absolute inset-[var(--board)] overflow-hidden rounded-[3px]">
                    <BackInside />
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex">
                  {/* No page content here by design: this is the binding/shadow
                      backdrop behind the left leaf stack, only glimpsed for an
                      instant when 3D perspective foreshortens a turning leaf.
                      Real content always comes from whichever leaf has flipped
                      to rest here — showing a blank page here (instead of the
                      dark spine colour) used to read as a phantom empty page. */}
                  <motion.div
                    animate={{ opacity: isClosed ? 0 : 1 }}
                    transition={{ duration: 0.4 }}
                    className="relative h-full w-1/2 rounded-l-[6px] bg-charcoal shadow-[0_40px_90px_-20px_rgba(0,0,0,0.8)]"
                  />
                  <div className="relative h-full w-1/2 rounded-r-[6px] bg-charcoal shadow-[0_40px_90px_-20px_rgba(0,0,0,0.8)]">
                    <div className="absolute inset-y-[var(--board)] right-[var(--board)] left-0 overflow-hidden rounded-r-[2px]">
                      <BackInside />
                    </div>
                  </div>
                </div>
              )}

              {/* page-edge thickness */}
              {!single && (
                <motion.div
                  animate={{ opacity: isClosed ? 0 : Math.min(1, flipped / 2) }}
                  className="pointer-events-none absolute left-[var(--board)] top-[calc(var(--board)+4px)] bottom-[calc(var(--board)+4px)] w-[7px] bg-[repeating-linear-gradient(to_right,rgba(0,0,0,0.16)_0,rgba(0,0,0,0.16)_1px,transparent_1px,transparent_2px)] z-30"
                />
              )}
              <motion.div
                animate={{ opacity: Math.min(1, (TOTAL - flipped) / 2) }}
                className="pointer-events-none absolute right-[var(--board)] top-[calc(var(--board)+4px)] bottom-[calc(var(--board)+4px)] w-[7px] bg-[repeating-linear-gradient(to_left,rgba(0,0,0,0.16)_0,rgba(0,0,0,0.16)_1px,transparent_1px,transparent_2px)] z-30"
              />

              {/* gutter */}
              {!single && (
                <motion.div
                  animate={{ opacity: isClosed ? 0 : 1 }}
                  className="pointer-events-none absolute left-1/2 top-[var(--board)] bottom-[var(--board)] w-10 -translate-x-1/2 bg-gradient-to-r from-black/0 via-black/30 to-black/0 z-30"
                />
              )}

              {/* leaves */}
              <Leaf
                isCover
                single={single}
                rotate={rotations[0]}
                frontZ={TOTAL}
                backZ={1}
                dragging={dragLeaf === 0}
                front={<CoverFront />}
                back={single ? <div className="paper-page h-full w-full" /> : <CoverInside />}
              />
              {single ? singleLeaves : spreadLeaves}
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
            <span className="text-paper/60 text-sm tracking-widest min-w-[6rem] text-center">
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
            {isClosed
              ? "Tap the cover to open"
              : single
                ? "Swipe left or right to turn"
                : "Drag a page or use ← → to turn"}
          </p>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-10">
            {menu.map((cat, idx) => (
              <button
                key={cat.id}
                onClick={() => jumpTo(idx)}
                className={`text-xs uppercase tracking-[0.15em] transition-colors ${
                  visibleCategories.includes(idx)
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
        image={selected?.item.image}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
