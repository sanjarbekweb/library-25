import Link from "next/link";
import { MessageSquareQuote, Users, BarChart3, ArrowRight, ArrowLeft } from "lucide-react";
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
      <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href="/catalog">
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full w-9 h-9 border border-border hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer shadow-2xs"
              title="Exit Admin Console"
              aria-label="Exit Admin Console"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold font-display text-foreground">
            Admin Console
          </h1>
        </div>
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Feedback Moderation Card */}
        <Card className="border border-border bg-card shadow-sm rounded-2xl overflow-hidden hover:border-foreground/20 hover:shadow-md transition-all group">
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
        <Card className="border border-border bg-card shadow-sm rounded-2xl overflow-hidden hover:border-foreground/20 hover:shadow-md transition-all group">
          <CardContent className="p-6 flex flex-col justify-between h-full space-y-6">
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                <Users className="h-6 w-6" />
              </div>
              <h2 className="font-display font-bold text-xl text-foreground group-hover:text-brand-blue transition-colors">
                User &amp; Role Management
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Manage user accounts, elevate assistant credentials, promote roles, and set account activation status.
              </p>
            </div>
            <Link href="/admin/users">
              <Button className="w-full rounded-full bg-brand-blue text-white hover:bg-brand-blue/90 font-medium text-xs gap-2">
                <span>Manage Users &amp; Roles</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Analytics Card */}
        <Card className="border border-border bg-card shadow-sm rounded-2xl overflow-hidden hover:border-foreground/20 hover:shadow-md transition-all group">
          <CardContent className="p-6 flex flex-col justify-between h-full space-y-6">
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h2 className="font-display font-bold text-xl text-foreground group-hover:text-brand-blue transition-colors">
                Circulation &amp; Growth Analytics
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Analyze borrowing velocity, category trends, overdue ratios, and reader cohorts across the library collection.
              </p>
            </div>
            <Link href="/admin/analytics">
              <Button className="w-full rounded-full bg-brand-blue text-white hover:bg-brand-blue/90 font-medium text-xs gap-2">
                <span>View Analytics</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
