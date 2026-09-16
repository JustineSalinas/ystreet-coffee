import Image from "next/image";
import Reveal from "./Reveal";

export default function About() {
  return (
    <section id="about" className="relative bg-paper py-28 md:py-36">
      <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-14 md:gap-20 items-center">
        <Reveal>
          <div className="relative">
            <div className="absolute -inset-3 border border-gold/40 rounded-[2rem] pointer-events-none hidden sm:block" />
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem]">
              <Image
                src="/images/barista-2.jpg"
                alt="Barista pulling espresso behind the Y Street Coffee counter"
                fill
                loading="eager"
                quality={95}
                className="object-cover"
                sizes="(min-width: 768px) 40vw, 90vw"
              />
            </div>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-8 bg-gold" />
              <p className="uppercase tracking-[0.3em] text-xs text-gold">
                Our Story
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="font-display text-4xl sm:text-5xl leading-[1.05] text-ink">
              Built white, kept quiet, poured slow.
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-7 text-ink/70 text-lg leading-relaxed max-w-xl">
              Y Street Coffee started on a corner of Taft North in
              Mandurriao — arched windows, bare concrete, a single espresso
              machine, and a lot of care put into small details. No rush, no
              noise. Just good coffee, honest pastries, and a room that gets
              out of the way so conversations can happen.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <p className="mt-4 text-ink/70 text-lg leading-relaxed max-w-xl">
              Every cup is pulled to order on our WEGA machine, every matcha
              whisked fresh, and every plate built for people who linger.
            </p>
          </Reveal>

          <Reveal delay={0.32}>
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-md border-t border-line pt-8">
              <div>
                <p className="font-display text-3xl text-gold">10–10</p>
                <p className="text-xs uppercase tracking-wider text-ink/50 mt-1">
                  Open Daily
                </p>
              </div>
              <div>
                <p className="font-display text-3xl text-gold">40+</p>
                <p className="text-xs uppercase tracking-wider text-ink/50 mt-1">
                  Menu Items
                </p>
              </div>
              <div>
                <p className="font-display text-3xl text-gold">Iloilo</p>
                <p className="text-xs uppercase tracking-wider text-ink/50 mt-1">
                  City Roots
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
