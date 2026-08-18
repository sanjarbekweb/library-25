import Link from "next/link";
import { MessageSquareQuote, ShieldAlert, Users, BarChart3, ArrowRight, BookOpen, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Admin Control Console | ShelfSync",
  description: "Administrative controls for library moderation, user management, and analytics.",
};

export default function AdminDashboardPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-foreground flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue border border-brand-blue/20 shadow-sm">
              <ShieldAlert className="h-5 w-5" />
            </div>
            Admin Control Console
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            System administration tools for review moderation, user RBAC permissions, and library intelligence.
          </p>
        </div>

        <div>
          <Link href="/">
            <Button variant="outline" size="sm" className="rounded-full gap-2 text-xs font-semibold hover:bg-accent border-border">
              <LogOut className="w-4 h-4 text-muted-foreground" />
              <span>Exit Admin Console</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Feedback Moderation Card */}
        <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden hover:border-brand-blue/50 transition-all group">
          <CardContent className="p-6 flex flex-col justify-between h-full space-y-6">
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <MessageSquareQuote className="h-6 w-6" />
              </div>
              <h2 className="font-display font-bold text-xl text-foreground group-hover:text-brand-blue transition-colors">
                Feedback &amp; Reviews Moderation
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Review student 1–5 star ratings and comments. Moderate, hide, or delete inappropriate catalog feedback.
              </p>
            </div>
            <Link href="/admin/feedback">
              <Button className="w-full rounded-full bg-brand-blue text-white hover:bg-brand-blue/90 font-medium text-xs gap-2">
                <span>Manage Reviews</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* User Management Card */}
        <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden hover:border-brand-blue/50 transition-all group opacity-80">
          <CardContent className="p-6 flex flex-col justify-between h-full space-y-6">
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                <Users className="h-6 w-6" />
              </div>
              <h2 className="font-display font-bold text-xl text-foreground">
                User &amp; Role Management
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Manage user accounts, elevate assistant credentials, and configure RBAC permission policies. (Unit 09)
              </p>
            </div>
            <Button variant="outline" disabled className="w-full rounded-full text-xs gap-2">
              <span>Coming in Unit 09</span>
            </Button>
          </CardContent>
        </Card>

        {/* Analytics Card */}
        <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden hover:border-brand-blue/50 transition-all group opacity-80">
          <CardContent className="p-6 flex flex-col justify-between h-full space-y-6">
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h2 className="font-display font-bold text-xl text-foreground">
                Circulation &amp; Growth Analytics
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Analyze borrowing velocity, category trends, and overdue ratios across the library collection. (Unit 10)
              </p>
            </div>
            <Button variant="outline" disabled className="w-full rounded-full text-xs gap-2">
              <span>Coming in Unit 10</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
