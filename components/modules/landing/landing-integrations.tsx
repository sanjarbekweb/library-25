import {
  Shield,
  QrCode,
  BookOpen,
  Mail,
  GraduationCap,
  Scan,
  Database,
  Cpu,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function LandingIntegrations() {
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

  return (
    <section id="pricing" className="py-20 bg-slate-50/70 dark:bg-zinc-950/60 border-b border-border/80 overflow-hidden">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Section Header */}
        <div data-aos="fade-up" className="text-center space-y-3 max-w-2xl mx-auto">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {integrations.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                data-aos="zoom-in"
                data-aos-delay={100 + idx * 80}
                className="p-5 rounded-3xl border border-border/90 bg-card shadow-xs flex flex-col justify-between space-y-4 hover-scale-subtle"
              >
                <div className={`h-11 w-11 rounded-2xl ${item.color} flex items-center justify-center font-bold`}>
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
