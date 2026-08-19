import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { BookOpen } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { LandingHero } from "@/components/modules/landing/landing-hero";
import { LandingBentoGrid } from "@/components/modules/landing/landing-bento-grid";
import { LandingIntegrations } from "@/components/modules/landing/landing-integrations";
import { LandingTestimonials } from "@/components/modules/landing/landing-testimonials";

export const metadata = {
  title: "CoreShift | All-in-one HR & Unified Library Platform",
  description:
    "CoreShift is a modern, all-in-one HR and unified workspace platform designed to perfectly fit your business and library needs.",
};

export default async function HomePage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-brand-yellow selection:text-black overflow-hidden">
      <Navbar />

      <main className="flex-1">
        {/* 1. Hero Section */}
        <LandingHero />

        {/* 2. Bento Grid Section ("Built for Everyone") */}
        <LandingBentoGrid />

        {/* 3. Integrations Carousel */}
        <LandingIntegrations />

        {/* 4. Social Proof / Testimonials ("Words of Appreciation") */}
        <LandingTestimonials />
      </main>

      {/* 5. Footer Section with Large Frosted Brand Mark Watermark */}
      <footer className="relative border-t border-hairline bg-card py-16 overflow-hidden">
        {/* Large Frosted Background Watermark */}
        <div className="absolute bottom-[-2rem] left-1/2 -translate-x-1/2 text-[120px] sm:text-[180px] md:text-[220px] font-extrabold tracking-tighter text-foreground/[0.03] select-none pointer-events-none whitespace-nowrap z-0">
          CoreShift
        </div>

        <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative z-10 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Mission Statement */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-yellow text-black font-bold shadow-xs">
                  <BookOpen className="h-4 w-4" />
                </div>
                <span className="font-display text-xl font-bold tracking-tight text-foreground">
                  CoreShift
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm">
                CoreShift is the HRM platform that builds a thriving workplace culture—all in one place.
              </p>
            </div>

            {/* Product Links */}
            <div className="space-y-3">
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-foreground">Product</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link href="/catalog" className="hover:text-foreground transition-colors">CoreHR</Link></li>
                <li><Link href="/catalog" className="hover:text-foreground transition-colors">Recruit</Link></li>
                <li><Link href="/catalog" className="hover:text-foreground transition-colors">Perform</Link></li>
                <li><Link href="/catalog" className="hover:text-foreground transition-colors">Pulse</Link></li>
              </ul>
            </div>

            {/* Features Links */}
            <div className="space-y-3">
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-foreground">Features</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link href="/assistant" className="hover:text-foreground transition-colors">Desk</Link></li>
                <li><Link href="/assistant" className="hover:text-foreground transition-colors">Time</Link></li>
                <li><Link href="/admin" className="hover:text-foreground transition-colors">Analytics</Link></li>
              </ul>
            </div>

            {/* Resources & Pricing */}
            <div className="space-y-3">
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-foreground">Company</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link href="/catalog" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="/catalog" className="hover:text-foreground transition-colors">Resources</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar & Social Channels */}
          <div className="border-t border-hairline pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <div>&copy; {new Date().getFullYear()} CoreShift. All rights reserved.</div>
            <div className="flex items-center gap-4 font-medium">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
                Instagram
              </a>
              <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
                X (Twitter)
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
                TikTok
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
