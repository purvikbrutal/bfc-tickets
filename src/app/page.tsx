import { BookingModalProvider } from "@/components/providers/booking-modal-provider";
import { BookingSection } from "@/components/sections/booking-section";
import { CountdownSection } from "@/components/sections/countdown-section";
import { FaqSection } from "@/components/sections/faq-section";
import { FooterSection } from "@/components/sections/footer-section";
import { HeroSection } from "@/components/sections/hero-section";
import { PhotoGallerySection } from "@/components/sections/photo-gallery-section";
import { StickyNavbar } from "@/components/sections/sticky-navbar";
import { VenueSection } from "@/components/sections/venue-section";

export default function HomePage() {
  return (
    <BookingModalProvider>
      <div className="relative min-h-screen overflow-x-clip bg-background text-foreground">
        <StickyNavbar />
        <main className="relative isolate">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[760px] bg-[radial-gradient(circle_at_center,_rgba(180,31,50,0.12),_transparent_44%)]" />
          <HeroSection />
          <CountdownSection />
          <PhotoGallerySection />
          <BookingSection />
          <VenueSection />
          <FaqSection />
        </main>
        <FooterSection />
      </div>
    </BookingModalProvider>
  );
}
