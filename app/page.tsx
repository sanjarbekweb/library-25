import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Navbar } from "@/components/shared/navbar";
import { LandingHero } from "@/components/modules/landing/landing-hero";
import { LandingBentoGrid } from "@/components/modules/landing/landing-bento-grid";
import { LandingIntegrations } from "@/components/modules/landing/landing-integrations";
import { LandingTestimonials } from "@/components/modules/landing/landing-testimonials";
import { LandingFaq } from "@/components/modules/landing/landing-faq";
import { LandingContact } from "@/components/modules/landing/landing-contact";
import { LandingFooter } from "@/components/modules/landing/landing-footer";

export const metadata = {
  title: "libra25 | Unified Campus Library Management Platform",
  description:
    "libra25 is a modern, all-in-one library management platform designed to streamline book discovery, hold reservations, desk checkouts, and collection tracking.",
};

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/catalog");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-brand-blue selection:text-white overflow-hidden">
      <Navbar />

      <main className="flex-1">
        {/* 1. Hero Section */}
        <LandingHero />

        {/* 2. Bento Grid Section ("Built for Modern Libraries") */}
        <LandingBentoGrid />

        {/* 3. Integrations Carousel */}
        <LandingIntegrations />

        {/* 4. Social Proof / Testimonials ("Trusted by Librarians & Students") */}
        <LandingTestimonials />

        {/* 5. FAQ Section (Headless Animated Accordion) */}
        <LandingFaq />

        {/* 6. Direct Telegram Contact & Feedback */}
        <LandingContact />
      </main>

      {/* 7. Modern Campus Library Footer */}
      <LandingFooter />
    </div>
  );
}

