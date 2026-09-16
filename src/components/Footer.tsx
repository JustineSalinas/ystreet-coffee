import Image from "next/image";
import { Mail } from "lucide-react";
import InstagramIcon from "./InstagramIcon";

export default function Footer() {
  return (
    <footer className="relative bg-obsidian text-paper/70 border-t border-gold/15">
      <div className="mx-auto max-w-6xl px-6 py-16 grid gap-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <a href="#top" className="flex items-center gap-3">
            <Image
              src="/images/logo-mark.png"
              alt="Y Street Coffee"
              width={36}
              height={36}
              className="invert"
            />
            <span className="font-display text-lg text-paper">
              y street <span className="italic text-gold">coffee</span>
            </span>
          </a>
          <p className="mt-4 text-sm leading-relaxed max-w-xs">
            A minimalist, premium coffee bar in Mandurriao, Iloilo City.
            Espresso, matcha, and all-day breakfast.
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold/70 mb-4">
            Explore
          </p>
          <ul className="space-y-3 text-sm">
            <li>
              <a href="#about" className="hover:text-gold transition-colors">
                About
              </a>
            </li>
            <li>
              <a href="#menu" className="hover:text-gold transition-colors">
                Menu
              </a>
            </li>
            <li>
              <a href="#gallery" className="hover:text-gold transition-colors">
                Gallery
              </a>
            </li>
            <li>
              <a href="#visit" className="hover:text-gold transition-colors">
                Visit
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold/70 mb-4">
            Visit
          </p>
          <p className="text-sm leading-relaxed max-w-[220px]">
            Villa Alegre Subd., Brgy. Buhang, Taft North St., Mandurriao,
            Iloilo City, Philippines, 5000
          </p>
          <p className="text-sm mt-3">Open daily · 10AM – 10PM</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold/70 mb-4">
            Say Hello
          </p>
          <ul className="space-y-3 text-sm">
            <li>
              <a
                href="mailto:ystreetcoffee@gmail.com"
                className="flex items-center gap-2 hover:text-gold transition-colors"
              >
                <Mail className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                ystreetcoffee@gmail.com
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/ystreetcoffee"
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-2 hover:text-gold transition-colors"
              >
                <InstagramIcon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gold/10">
        <div className="mx-auto max-w-6xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-paper/40">
          <p>&copy; {new Date().getFullYear()} Y Street Coffee. All rights reserved.</p>
          <p>Mandurriao, Iloilo City, Philippines</p>
        </div>
      </div>
    </footer>
  );
}
