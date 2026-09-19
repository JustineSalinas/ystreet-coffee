import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, Space_Mono } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import Preloader from "@/components/Preloader";
import "./globals.css";

const SITE_URL = "https://ystreetproject.vercel.app";
const TITLE = "Y Street Coffee — Mandurriao, Iloilo City";
const DESCRIPTION =
  "Y Street Coffee is a minimalist coffee bar in Mandurriao, Iloilo City serving espresso, matcha, frappes, and all-day breakfast. Open daily 10AM–10PM.";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s — Y Street Coffee",
  },
  description: DESCRIPTION,
  keywords: [
    "Y Street Coffee",
    "coffee shop Iloilo",
    "cafe Mandurriao",
    "Iloilo City coffee",
    "specialty coffee Iloilo",
    "matcha Iloilo",
  ],
  applicationName: "Y Street Coffee",
  // Not yet approved by the business owners — keep this build out of search
  // results and previews until they sign off. Remove once live for real.
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: "/",
    siteName: "Y Street Coffee",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/og-cover.jpg",
        width: 1200,
        height: 630,
        alt: "Inside Y Street Coffee — Mandurriao, Iloilo City",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-cover.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a09",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <Preloader />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
