import {
  Mail,
  MessageCircle,
  Video,
  Calendar,
  Share2,
} from "lucide-react";

export function LandingIntegrations() {
  const integrations = [
    {
      name: "Google Workspace / Gmail",
      desc: "Unified inbox and calendar synchronization",
      icon: Mail,
      color: "bg-red-500/10 text-red-500",
    },
    {
      name: "Slack",
      desc: "Instant team notifications and slash commands",
      icon: MessageCircle,
      color: "bg-purple-500/10 text-purple-500",
    },
    {
      name: "Google Meet",
      desc: "Seamless video meetings",
      icon: Video,
      color: "bg-emerald-500/10 text-emerald-500",
    },
    {
      name: "Microsoft Outlook",
      desc: "Email & schedule management",
      icon: Calendar,
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      name: "Microsoft Teams",
      desc: "Collaborative communication & video channels",
      icon: Share2,
      color: "bg-indigo-500/10 text-indigo-500",
    },
  ];

  return (
    <section className="py-20 bg-canvas-warm dark:bg-canvas-dark border-b border-hairline overflow-hidden">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-foreground text-xs font-mono border border-hairline">
            <span>Seamless Ecosystem</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground tracking-tight">
            Integrate with your existing tools in seconds
          </h2>
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
