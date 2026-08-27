"use client";

import { useRef } from "react";
import {
  Shield,
  Scan,
  Database,
  Cpu,
  Zap,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Badge } from "@/components/ui/badge";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export function LandingIntegrations() {
  const sectionRef = useRef<HTMLElement>(null);

  const integrations = [
    {
      name: "Barcode & RFID Scanners",
      desc: "Instant desk checkouts",
      icon: Scan,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      name: "Single Sign-On (SSO)",
      desc: "OIDC & SAML 2.0 Auth",
      icon: Shield,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      name: "MARC21 Catalogs",
      desc: "Z39.50 & OPAC sync",
      icon: Database,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      name: "Course Management",
      desc: "Canvas & Blackboard sync",
      icon: Cpu,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
    {
      name: "High-Volume Print",
      desc: "Receipt & spine tags",
      icon: Zap,
      color: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    },
  ];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { reduceMotion } = context.conditions as { reduceMotion: boolean };

          if (reduceMotion) {
            gsap.set([".integrations-header", ".integration-card"], {
              autoAlpha: 1,
              y: 0,
              scale: 1,
            });
            return;
          }

          // Header entrance
          gsap.from(".integrations-header", {
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 82%",
              toggleActions: "play none none none",
            },
            autoAlpha: 0,
            y: 30,
            duration: 0.8,
            ease: "power3.out",
          });

          // Cards staggered entrance
          gsap.from(".integration-card", {
            scrollTrigger: {
              trigger: ".integrations-grid",
              start: "top 80%",
              toggleActions: "play none none none",
            },
            autoAlpha: 0,
            scale: 0.92,
            y: 30,
            duration: 0.7,
            stagger: 0.08,
            ease: "power3.out",
          });
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="py-20 bg-slate-50/70 dark:bg-zinc-950/60 border-b border-border/80 overflow-hidden"
    >
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Section Header */}
        <div className="integrations-header text-center space-y-3 max-w-2xl mx-auto will-change-transform">
          <Badge variant="outline" className="px-3 py-1 font-mono text-xs border-border/80 bg-card">
            Seamless Ecosystem
          </Badge>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground tracking-tight">
            Library Ecosystem Integrations
          </h2>
          <p className="text-sm text-muted-foreground">
            Connect libra25 with your campus scanners, identity providers, and catalog databases.
          </p>
        </div>

        {/* Integrations Grid / Showcase Cards */}
        <div className="integrations-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {integrations.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className="integration-card p-5 rounded-3xl border border-border/90 bg-card shadow-xs flex flex-col justify-between space-y-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md will-change-transform cursor-default"
              >
                <div className={`h-11 w-11 rounded-2xl ${item.color} flex items-center justify-center font-bold transition-transform duration-300 group-hover:scale-110`}>
                  <IconComp className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-sm text-foreground">{item.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
