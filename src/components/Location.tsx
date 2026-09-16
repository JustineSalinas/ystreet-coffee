import Reveal from "./Reveal";

const MAPS_QUERY = encodeURIComponent(
  "Y Street Coffee, Villa Alegre Subd., Brgy. Buhang, Taft North St., Mandurriao, Iloilo City, Philippines, 5000"
);

export default function Location() {
  return (
    <section id="visit" className="relative bg-paper py-28 md:py-36">
      <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-14 items-stretch">
        <Reveal className="flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-5">
            <span className="h-px w-8 bg-gold" />
            <p className="uppercase tracking-[0.3em] text-xs text-gold">
              Visit Us
            </p>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-ink leading-tight">
            Come find the arches on Taft North.
          </h2>

          <div className="mt-10 space-y-7">
            <div>
              <p className="text-xs uppercase tracking-wider text-ink/50 mb-1.5">
                Address
              </p>
              <p className="text-lg text-ink/80 leading-relaxed max-w-sm">
                Villa Alegre Subd., Brgy. Buhang, Taft North St.,
                Mandurriao, Iloilo City, Philippines, 5000
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-ink/50 mb-1.5">
                Hours
              </p>
              <p className="text-lg text-ink/80">Open daily · 10AM – 10PM</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-ink/50 mb-1.5">
                Reach Us
              </p>
              <p className="text-lg text-ink/80">
                <a
                  href="mailto:ystreetcoffee@gmail.com"
                  className="hover:text-gold transition-colors"
                >
                  ystreetcoffee@gmail.com
                </a>
              </p>
              <p className="text-lg text-ink/80">
                <a
                  href="https://www.instagram.com/ystreetcoffee"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-gold transition-colors"
                >
                  @ystreetcoffee
                </a>
              </p>
            </div>
          </div>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-10 inline-flex items-center justify-center w-fit uppercase tracking-[0.15em] text-sm bg-ink text-paper px-8 py-3.5 rounded-full hover:bg-gold hover:text-obsidian transition-colors"
          >
            Get Directions
          </a>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="relative min-h-[420px] h-full overflow-hidden rounded-[2rem] border border-gold/25">
            <iframe
              title="Y Street Coffee location map"
              src={`https://www.google.com/maps?q=${MAPS_QUERY}&output=embed`}
              className="grayscale-map absolute inset-0 h-full w-full"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
