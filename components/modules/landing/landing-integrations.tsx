import {
  Shield,
  QrCode,
  BookOpen,
  Mail,
  GraduationCap,
} from "lucide-react";

export function LandingIntegrations() {
  const integrations = [
    {
      name: "Campus SSO & OAuth",
      desc: "Identity provider integration for instant student & faculty auth",
      icon: Shield,
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      name: "Barcode & RFID Scanners",
      desc: "Hardware scanner integration for 10-second desk checkouts",
      icon: QrCode,
      color: "bg-emerald-500/10 text-emerald-500",
    },
    {
      name: "OpenLibrary & MARC21",
      desc: "Automated ISBN metadata import and MARC cataloging",
      icon: BookOpen,
      color: "bg-purple-500/10 text-purple-500",
    },
    {
      name: "Email Hold Alerts",
      desc: "Instant pickup notifications when reserved books arrive",
      icon: Mail,
      color: "bg-amber-500/10 text-amber-500",
    },
    {
      name: "Institutional LMS",
      desc: "Seamless integration with university course reserve systems",
      icon: GraduationCap,
      color: "bg-indigo-500/10 text-indigo-500",
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-canvas-warm dark:bg-canvas-dark border-b border-hairline overflow-hidden">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-foreground text-xs font-mono border border-hairline">
            <span>Seamless Ecosystem</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground tracking-tight">
            Library Ecosystem Integrations
          </h2>
          <p className="text-sm text-muted-foreground">
            Connect ShelfSync with your campus scanners, identity providers, and catalog databases.
          </p>
        </div>

        {/* Integrations Grid / Showcase Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {integrations.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-3xl border border-hairline bg-card shadow-soft-floating flex flex-col justify-between space-y-4 transition-spring hover:scale-[1.03]"
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
