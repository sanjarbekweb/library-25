import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import {
  Bookmark,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BookOpen,
  MapPin,
  ChevronLeft,
} from "lucide-react";
import { getStudentReservations } from "@/lib/services/reservation-service";
import { Navbar } from "@/components/shared/navbar";
import { ReservationCancelButton } from "./reservation-cancel-button";

export const metadata = {
  title: "My Reservations & Active Holds",
  description: "View active online book reservations, expiration countdowns, and pickup instructions at the school library circulation desk.",
};

export default async function StudentReservationsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const reservations = await getStudentReservations(userId);

  const activeReservations = reservations.filter((r) => r.status === "PENDING");
  const pastReservations = reservations.filter((r) => r.status !== "PENDING");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header Breadcrumb & Title */}
        <div className="space-y-3">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Catalog
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
            <div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground flex items-center gap-2.5">
                <Bookmark className="h-7 w-7 text-brand-yellow fill-current" />
                My Book Reservations
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your physical book pickup holds and reservation history.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-accent text-foreground border border-border">
                {activeReservations.length} Active Hold{activeReservations.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </div>

        {/* Pickup Location Instructions Callout */}
        <div className="rounded-3xl border border-brand-blue/20 bg-brand-blue/5 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="h-10 w-10 rounded-2xl bg-brand-blue text-white flex items-center justify-center shrink-0 shadow-xs">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="space-y-0.5 flex-1">
            <h3 className="font-display font-bold text-sm text-foreground">
              Circulation Desk Pickup Instructions
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When a reservation status is <strong className="text-foreground font-semibold">Active Hold Pending</strong>, visit the library circulation desk within 48 hours. Present your student ID to complete checkout in under 10 seconds.
            </p>
          </div>
        </div>

        {/* Active Reservations Section */}
        <section className="space-y-4">
          <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Active Holds ({activeReservations.length})
          </h2>

          {activeReservations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-card space-y-3">
              <BookOpen className="h-8 w-8 text-muted-foreground/40 mx-auto" />
              <p className="text-sm font-medium text-foreground">No active book reservations</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Explore the catalog and click &ldquo;Reserve Book for Pickup&rdquo; on any available title to hold a physical copy.
              </p>
              <Link href="/catalog">
                <button className="text-xs font-bold text-brand-blue hover:underline pt-2">
                  Browse Catalog &rarr;
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {activeReservations.map((item) => {
                const expiresDate = new Date(item.expiresAt);
                const isNearingExpiry = expiresDate.getTime() - Date.now() < 1000 * 60 * 60 * 12; // < 12 hours

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-border bg-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="flex items-center gap-4">
                      {/* Cover Thumbnail */}
                      <div className="relative h-16 w-12 rounded-lg bg-muted overflow-hidden shrink-0 border border-border">
                        {item.coverImageUrl ? (
                          <Image
                            src={item.coverImageUrl}
                            alt={item.bookTitle}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-brand-yellow/20 text-brand-yellow">
                            <BookOpen className="h-5 w-5" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-accent text-foreground border border-border">
                          {item.category}
                        </span>
                        <h3 className="font-display font-bold text-base text-foreground leading-snug">
                          <Link href={`/books/${item.bookId}`} className="hover:text-brand-blue transition-colors">
                            {item.bookTitle}
                          </Link>
                        </h3>
                        <p className="text-xs text-muted-foreground">by {item.bookAuthor}</p>
                        {item.copyBarcode && (
                          <p className="text-[11px] font-mono text-muted-foreground">
                            Copy Barcode: <span className="font-semibold text-foreground">{item.copyBarcode}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Expiration & Cancellation */}
                    <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-border pt-3 sm:pt-0">
                      <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Expires: {expiresDate.toLocaleDateString()} {expiresDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      {isNearingExpiry && (
                        <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Pickup window expiring soon
                        </span>
                      )}

                      <ReservationCancelButton reservationId={item.id} bookId={item.bookId} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Past Reservation History */}
        {pastReservations.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-border">
            <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              Reservation History ({pastReservations.length})
            </h2>

            <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border/60">
              {pastReservations.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="space-y-0.5">
                      <Link href={`/books/${item.bookId}`} className="font-bold text-foreground hover:underline">
                        {item.bookTitle}
                      </Link>
                      <p className="text-muted-foreground">by {item.bookAuthor}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>

                    {item.status === "FULFILLED" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold text-[11px]">
                        <CheckCircle2 className="h-3 w-3" /> Checked Out
                      </span>
                    )}

                    {item.status === "CANCELLED" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border font-medium text-[11px]">
                        <XCircle className="h-3 w-3" /> Cancelled
                      </span>
                    )}

                    {item.status === "EXPIRED" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium text-[11px]">
                        <AlertTriangle className="h-3 w-3" /> Expired
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
