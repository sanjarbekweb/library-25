"use client";

import Link from "next/link";
import { BookOpen, MapPin, Clock } from "lucide-react";
import { AppLogo } from "@/components/shared/app-logo";

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border/80 bg-slate-50/80 dark:bg-[#07090D] py-16 sm:py-20 overflow-hidden text-foreground transition-colors duration-300">
      {/* Large Frosted Background Watermark */}
      <div
        className="absolute bottom-[-1.5rem] left-1/2 -translate-x-1/2 text-[110px] sm:text-[160px] md:text-[220px] font-extrabold tracking-tighter text-foreground/[0.03] select-none pointer-events-none whitespace-nowrap z-0"
        aria-hidden="true"
      >
        libra25
      </div>

      {/* Subtle Background Radial Ambient Glows */}
      <div
        className="absolute bottom-0 right-10 w-96 h-96 bg-brand-blue/5 dark:bg-brand-blue/10 rounded-full blur-[130px] pointer-events-none -z-0"
        aria-hidden="true"
      />
      <div
        className="absolute top-10 left-10 w-80 h-80 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[110px] pointer-events-none -z-0"
        aria-hidden="true"
      />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12 sm:space-y-14">
        {/* Main 5-Column Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand Identity & Campus Desk Info (5 cols on lg) */}
          <div className="md:col-span-5 space-y-5 text-left">
            <Link
              href="/"
              className="inline-flex items-center group focus-visible:ring-2 focus-visible:ring-brand-blue rounded-xl"
            >
              <AppLogo size="lg" labelSubtitle="Campus Library System" />
            </Link>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md">
              The next-generation campus library platform empowering students, faculty, and circulation staff with lightning-fast catalog search, 10-second desk checkouts, and real-time inventory telemetry.
            </p>

            {/* Campus Desk Telemetry & Physical Location Card */}
            <div className="p-3.5 rounded-2xl border border-border/80 bg-card/70 dark:bg-zinc-900/60 backdrop-blur-xs space-y-2 text-xs shadow-2xs max-w-md">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-brand-blue shrink-0" />
                <span className="font-medium text-foreground/90">Central Campus Library, Ground Floor Desk</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>Mon – Sat: 08:30 – 20:00 &bull; Sun: 10:00 – 17:00</span>
              </div>
            </div>

            {/* Social & Channel Links */}
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                aria-label="Telegram"
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground hover:text-brand-blue hover:border-brand-blue/40 hover:bg-brand-blue/5 transition-all duration-200 shadow-2xs"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground hover:text-pink-600 dark:hover:text-pink-400 hover:border-pink-500/40 hover:bg-pink-500/5 transition-all duration-200 shadow-2xs"
              >
                <svg className="h-4 w-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="X (Twitter)"
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-foreground/5 transition-all duration-200 shadow-2xs"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-foreground/5 transition-all duration-200 shadow-2xs"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation Link Columns (7 cols on lg: 3 columns) */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Column 1: Catalog & Discovery */}
            <div className="space-y-3.5">
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-foreground">
                Catalog &amp; Discovery
              </h4>
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li>
                  <Link href="/catalog" className="hover:text-brand-blue transition-colors block py-0.5">
                    Book Catalog Index
                  </Link>
                </li>
                <li>
                  <Link href="/reservations" className="hover:text-brand-blue transition-colors block py-0.5">
                    Hold Reservations
                  </Link>
                </li>
                <li>
                  <Link href="/loans" className="hover:text-brand-blue transition-colors block py-0.5">
                    My Active Loans
                  </Link>
                </li>
                <li>
                  <Link href="/catalog" className="hover:text-brand-blue transition-colors block py-0.5">
                    Course Reserves
                  </Link>
                </li>
                <li>
                  <Link href="/catalog" className="hover:text-brand-blue transition-colors block py-0.5">
                    Shelf Stock Map
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Desk Console */}
            <div className="space-y-3.5">
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-foreground">
                Desk Console
              </h4>
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li>
                  <Link href="/assistant" className="hover:text-brand-blue transition-colors block py-0.5">
                    Circulation Desk
                  </Link>
                </li>
                <li>
                  <Link href="/assistant/books" className="hover:text-brand-blue transition-colors block py-0.5">
                    Barcode Cataloging
                  </Link>
                </li>
                <li>
                  <Link href="/assistant/history" className="hover:text-brand-blue transition-colors block py-0.5">
                    Circulation Logs
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-brand-blue transition-colors block py-0.5">
                    Library Intelligence
                  </Link>
                </li>
                <li>
                  <Link href="/admin/users" className="hover:text-brand-blue transition-colors block py-0.5">
                    Patron Permissions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Campus & Policies */}
            <div className="space-y-3.5 col-span-2 sm:col-span-1">
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-foreground">
                Campus Policies
              </h4>
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li>
                  <Link href="/catalog" className="hover:text-brand-blue transition-colors block py-0.5">
                    14-Day Loan Policy
                  </Link>
                </li>
                <li>
                  <Link href="/reservations" className="hover:text-brand-blue transition-colors block py-0.5">
                    Hold Pickup Rules
                  </Link>
                </li>
                <li>
                  <Link href="/catalog" className="hover:text-brand-blue transition-colors block py-0.5">
                    Renewal Guidelines
                  </Link>
                </li>
                <li>
                  <a href="#contact" className="hover:text-brand-blue transition-colors block py-0.5">
                    Telegram Help Desk
                  </a>
                </li>
                <li>
                  <a href="#testimonials" className="hover:text-brand-blue transition-colors block py-0.5">
                    Student Reviews
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Telemetry Status, Copyright & Legal */}
        <div className="border-t border-border/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-medium text-foreground/90">
              Circulation Desk &amp; Catalog Services: Online
            </span>
          </div>

          <div className="text-center sm:text-right text-muted-foreground text-[11px] sm:text-xs">
            &copy; {currentYear} libra25 Library System. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
