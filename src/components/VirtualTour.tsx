"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Reveal from "./Reveal";

const MODEL_SRC = "/models/shop-tour.glb";

const ShopScene = dynamic(() => import("./ShopScene"), {
  ssr: false,
  loading: () => null,
});

export default function VirtualTour() {
  const [ready, setReady] = useState(false);
  const [missing, setMissing] = useState(false);
  const viewerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    import("@google/model-viewer");
  }, []);

  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;
    const onLoad = () => setReady(true);
    const onError = () => setMissing(true);
    el.addEventListener("load", onLoad);
    el.addEventListener("error", onError);
    return () => {
      el.removeEventListener("load", onLoad);
      el.removeEventListener("error", onError);
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
            Drag to orbit &middot; Scroll to zoom
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative mx-auto aspect-[16/10] w-full max-w-4xl overflow-hidden rounded-[1.5rem] border border-gold/25 bg-charcoal shadow-[0_40px_90px_-20px_rgba(0,0,0,0.75)]">
            <model-viewer
              ref={viewerRef}
              src={MODEL_SRC}
              alt="Interactive 3D walkthrough of Y Street Coffee"
              camera-controls
              auto-rotate
              auto-rotate-delay={2000}
              rotation-per-second="8deg"
              shadow-intensity="0.9"
              exposure="0.95"
              ar
              ar-modes="webxr scene-viewer quick-look"
              loading="lazy"
              reveal="auto"
              style={{
                width: "100%",
                height: "100%",
                opacity: ready ? 1 : 0,
                position: ready ? "relative" : "absolute",
                transition: "opacity 0.6s ease",
              }}
            />

            {!ready && (
              <>
                <ShopScene />
                <span className="absolute top-4 right-4 z-10 rounded-full border border-gold/30 bg-obsidian/60 px-3 py-1 text-[0.65rem] uppercase tracking-[0.15em] text-gold backdrop-blur-sm">
                  Artist&apos;s Impression
                </span>
              </>
            )}
          </div>
        </Reveal>

        <p className="mt-6 text-center text-paper/35 text-xs max-w-lg mx-auto leading-relaxed">
          A stylized interpretation of Y Street&apos;s signature arches
          &mdash; a real scanned walkthrough of the shop is in the works.
        </p>
      </div>
    </section>
  );
}
