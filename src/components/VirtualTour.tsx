"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Reveal from "./Reveal";

const MODEL_SRC = "/models/shop-tour.glb";

const ShopScene = dynamic(() => import("./ShopScene"), {
  ssr: false,
  loading: () => null,
});

const RealModelViewer = dynamic(() => import("./RealModelViewer"), {
  ssr: false,
  loading: () => null,
});

export default function VirtualTour() {
  // Only one WebGL context may be mounted at a time, so probe for the scanned
  // model first and fall back to the stylized scene when it isn't there yet.
  const [hasModel, setHasModel] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(MODEL_SRC, { method: "HEAD" })
      .then((res) => {
        if (!cancelled) setHasModel(res.ok);
      })
      .catch(() => {
        if (!cancelled) setHasModel(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="relative bg-obsidian py-28 md:py-36 overflow-hidden">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="h-px w-8 bg-gold/60" />
            <p className="uppercase tracking-[0.3em] text-xs text-gold">
              Walk Through
            </p>
            <span className="h-px w-8 bg-gold/60" />
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-paper">
            Step inside, from anywhere
          </h2>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
            </span>
            <p className="text-paper/60 text-sm uppercase tracking-[0.15em]">
              In Progress &middot; Preview
            </p>
          </div>
          <p className="mt-2 text-paper/40 text-sm">
            Drag to look &middot; Walk in through the middle arch
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative mx-auto aspect-[16/10] w-full max-w-4xl overflow-hidden rounded-[1.5rem] border border-gold/25 bg-charcoal shadow-[0_40px_90px_-20px_rgba(0,0,0,0.75)]">
            {hasModel === true && <RealModelViewer src={MODEL_SRC} />}
            {hasModel === false && (
              <>
                <ShopScene />
                <span className="pointer-events-none absolute top-4 right-4 z-20 flex items-center gap-1.5 rounded-full border border-gold/30 bg-obsidian/60 px-3 py-1 text-[0.65rem] uppercase tracking-[0.15em] text-gold backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                  In Progress
                </span>
              </>
            )}
          </div>
        </Reveal>

        <p className="mt-6 text-center text-paper/35 text-xs max-w-lg mx-auto leading-relaxed">
          This is an early, hand-built preview and not yet an accurate model
          of the shop &mdash; a true-to-life 3D walkthrough is still in
          progress.
        </p>
      </div>
    </section>
  );
}
