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
          <p className="mt-4 text-paper/50">
            Drag to look &middot; Walk in through the middle arch
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative mx-auto aspect-[16/10] w-full max-w-4xl overflow-hidden rounded-[1.5rem] border border-gold/25 bg-charcoal shadow-[0_40px_90px_-20px_rgba(0,0,0,0.75)]">
            {hasModel === true && <RealModelViewer src={MODEL_SRC} />}
            {hasModel === false && (
              <>
                <ShopScene />
                <span className="pointer-events-none absolute top-4 right-4 z-20 rounded-full border border-gold/30 bg-obsidian/60 px-3 py-1 text-[0.65rem] uppercase tracking-[0.15em] text-gold backdrop-blur-sm">
                  Artist&apos;s Impression
                </span>
              </>
            )}
          </div>
        </Reveal>

        <p className="mt-6 text-center text-paper/35 text-xs max-w-lg mx-auto leading-relaxed">
          A stylized interpretation of Y Street&apos;s storefront and interior
          &mdash; a real scanned walkthrough of the shop is in the works.
        </p>
      </div>
    </section>
  );
}
