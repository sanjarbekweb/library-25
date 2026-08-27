"use client";

import Link from "next/link";
import { BookOpen, MapPin, Clock, Send } from "lucide-react";

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
              className="inline-flex items-center gap-2.5 group transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-brand-blue rounded-xl"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue text-white font-bold shadow-xs transition-shadow group-hover:shadow-md">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-xl font-extrabold tracking-tight text-foreground">
                  libra25
                </span>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground -mt-1">
                  Campus Library System
                </span>
              </div>
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
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                aria-label="Telegram Bot"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-brand-blue hover:border-brand-blue/50 transition-colors shadow-2xs"
              >
                <Send className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors shadow-2xs text-xs font-semibold"
              >
                IG
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="X Twitter"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors shadow-2xs text-xs font-semibold"
              >
                𝕏
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
                  <a href="#resources" className="hover:text-brand-blue transition-colors block py-0.5">
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
