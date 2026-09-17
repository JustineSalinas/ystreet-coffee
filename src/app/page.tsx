import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import MenuBook from "@/components/MenuBook";
import TestimonialFlow from "@/components/TestimonialFlow";
import Gallery from "@/components/Gallery";
import VirtualTour from "@/components/VirtualTour";
import Location from "@/components/Location";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <About />
        <MenuBook />
        <TestimonialFlow />
        <Gallery />
        <VirtualTour />
        <Location />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
