"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { RotateCw } from "lucide-react";
import Reveal from "./Reveal";
import BeanIcon from "./BeanIcon";

const MODEL_SRC = "/models/shop-tour.glb";

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
            Drag to look around &middot; Pinch or scroll to zoom
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative mx-auto aspect-[16/10] w-full max-w-4xl overflow-hidden rounded-[1.5rem] border border-gold/25 bg-charcoal shadow-[0_40px_90px_-20px_rgba(0,0,0,0.75)]">
            <model-viewer
              ref={viewerRef}
              src={MODEL_SRC}
              poster="/images/hero-exterior.jpg"
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
                opacity: missing ? 0 : 1,
                transition: "opacity 0.6s ease",
              }}
            />

            {!ready && (
              <div className="absolute inset-0">
                <Image
                  src="/images/hero-exterior.jpg"
                  alt="Y Street Coffee storefront"
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 60vw, 90vw"
                />
                <div className="absolute inset-0 bg-obsidian/70" />
              </div>
            )}

            {missing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
                <BeanIcon className="h-8 w-8 text-gold" />
                <p className="font-display text-2xl text-paper">
                  3D tour in progress
                </p>
                <p className="max-w-sm text-paper/50 text-sm leading-relaxed">
                  We&apos;re scanning the shop right now. Once it&apos;s
                  ready, you&apos;ll be able to walk the arched corridor and
                  look around in full 3D &mdash; right from this page.
                </p>
                <span className="mt-2 inline-flex items-center gap-2 rounded-full border border-gold/30 px-4 py-1.5 text-xs uppercase tracking-[0.15em] text-gold">
                  <RotateCw className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Coming soon
                </span>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
