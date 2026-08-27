"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { AppShellLayout } from "@/components/shared/app-shell-layout";
import { ReservationCancelButton } from "@/app/reservations/reservation-cancel-button";
import { useLanguage } from "@/components/providers/language-provider";
import type { StudentReservationItem } from "@/lib/services/reservation-service";

interface StudentReservationsViewProps {
  reservations: StudentReservationItem[];
}

export function StudentReservationsView({ reservations }: StudentReservationsViewProps) {
  const { t, language } = useLanguage();

  const activeReservations = reservations.filter((r) => r.status === "PENDING");
  const pastReservations = reservations.filter((r) => r.status !== "PENDING");

  const headerTitle = t("myHolds");
  const activeCountLabel = language === "uz"
    ? `${activeReservations.length} ta faol bandlik`
    : language === "ru"
    ? `${activeReservations.length} активных броней`
    : `${activeReservations.length} Active Hold${activeReservations.length === 1 ? "" : "s"}`;

  const noHoldsText = language === "uz"
    ? "Hozirda faol band qilingan kitoblar yo'q"
    : language === "ru"
    ? "Нет активных бронирований"
    : "No active book reservations";

  const exploreCatalogSubtitle = language === "uz"
    ? "Katalogdan istalgan kitobni topib, nusxasini band qiling va kutubxonadan olib keting."
    : language === "ru"
    ? "Выберите любую книгу в каталоге и забронируйте экземпляр для самовывоза."
    : "Explore the catalog and click 'Reserve Book for Pickup' on any available title to hold a physical copy.";

  const browseCatalogText = language === "uz" ? "Katalogni ko'rish →" : language === "ru" ? "Открыть каталог →" : "Browse Catalog →";
  const historyHeading = language === "uz" ? `Bandliklar tarixi (${pastReservations.length})` : language === "ru" ? `История бронирований (${pastReservations.length})` : `Reservation History (${pastReservations.length})`;

  return (
    <AppShellLayout>
      <div className="space-y-6 max-w-5xl">
        {/* Header Title */}
        <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
          <h1 className="font-display font-bold text-2xl text-foreground">
            {headerTitle}
          </h1>
          <span className="text-xs px-3 py-1 rounded-full bg-accent text-foreground border border-border">
            {activeCountLabel}
          </span>
        </div>

        {/* Active Reservations Section */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
          <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5 text-brand-blue" />
            {t("activeHoldCount")} ({activeReservations.length})
          </h2>

          {activeReservations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-card space-y-3">
              <BookOpen className="h-8 w-8 text-muted-foreground/40 mx-auto" />
              <p className="text-sm font-medium text-foreground">{noHoldsText}</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                {exploreCatalogSubtitle}
              </p>
              <Link href="/catalog">
                <button className="text-xs font-bold text-brand-blue hover:underline pt-2 cursor-pointer inline-flex items-center gap-1">
                  {browseCatalogText}
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {activeReservations.map((item) => {
                const expiresDate = new Date(item.expiresAt);
                const isNearingExpiry = expiresDate.getTime() - Date.now() < 1000 * 60 * 60 * 12;

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
                            alt={`Book cover thumbnail for reserved title "${item.bookTitle}"`}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-brand-blue/10 text-brand-blue">
                            <BookOpen className="h-5 w-5" />
                          </div>
                        )}
                      </div>

                      {/* Details (Preserved dynamic title/author) */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-accent text-foreground border border-border">
                          {item.category}
                        </span>
                        <h3 className="font-display font-bold text-base text-foreground leading-snug">
                          <Link href={`/books/${item.bookId}`} className="hover:text-brand-blue transition-colors">
                            {item.bookTitle}
                          </Link>
                        </h3>
                        <p className="text-xs text-muted-foreground">by {item.bookAuthor}</p>
                        {item.copyBarcode && (
                          <p className="text-[11px] text-muted-foreground">
                            Barcode: <span className="font-semibold text-foreground">{item.copyBarcode}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Expiration & Cancellation */}
                    <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-border pt-3 sm:pt-0">
                      <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                        <Clock className="h-3.5 w-3.5 text-brand-blue" />
                        <span>{t("expirationDate")}: {expiresDate.toLocaleDateString()} {expiresDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      {isNearingExpiry && (
                        <span className="text-[11px] text-foreground flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-brand-blue" />
                          {language === "uz" ? "Olib ketish muddati tugamoqda" : language === "ru" ? "Срок выдачи скоро истечет" : "Pickup window expiring soon"}
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
          <section className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
            <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              {historyHeading}
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
                    <span className="text-[11px] text-muted-foreground hidden sm:inline">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>

                    {item.status === "FULFILLED" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue dark:text-blue-400 border border-brand-blue/20 font-semibold text-[11px]">
                        <CheckCircle2 className="h-3 w-3" /> {t("holdFulfilled")}
                      </span>
                    )}

                    {item.status === "CANCELLED" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border font-medium text-[11px]">
                        <XCircle className="h-3 w-3" /> {t("holdCancelled")}
                      </span>
                    )}

                    {item.status === "EXPIRED" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border font-medium text-[11px]">
                        <AlertTriangle className="h-3 w-3" /> {t("holdExpired")}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShellLayout>
  );
}
