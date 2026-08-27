"use client";

import { useState } from "react";
import { Bell, Check, CheckCheck, Clock, Sparkles, AlertCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

interface NotificationsToggleProps {
  isCollapsed?: boolean;
}

interface NotificationItem {
  id: string;
  titleKey: string;
  descKey: string;
  icon: "hold" | "due" | "system";
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    titleKey: "holdReadyAlert",
    descKey: "holdReadyDesc",
    icon: "hold",
    time: "10m ago",
    read: false,
  },
  {
    id: "notif-2",
    titleKey: "dueSoonAlert",
    descKey: "dueSoonDesc",
    icon: "due",
    time: "2h ago",
    read: false,
  },
  {
    id: "notif-3",
    titleKey: "systemNotice",
    descKey: "systemNoticeDesc",
    icon: "system",
    time: "1d ago",
    read: false,
  },
];

export function NotificationsToggle({ isCollapsed = false }: NotificationsToggleProps) {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const markSingleAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  };

  const renderIcon = (type: NotificationItem["icon"]) => {
    switch (type) {
      case "hold":
        return <Sparkles className="h-3.5 w-3.5 text-brand-blue" />;
      case "due":
        return <Clock className="h-3.5 w-3.5 text-amber-500" />;
      case "system":
        return <AlertCircle className="h-3.5 w-3.5 text-emerald-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="w-full h-10 flex items-center rounded-2xl text-xs font-semibold text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-all duration-200 cursor-pointer group px-2.5"
          aria-label={t("notifications")}
          title={isCollapsed ? t("notifications") : undefined}
        >
          <div className="flex h-5 w-5 shrink-0 items-center justify-center relative">
            <Bell className="h-4 w-4 text-brand-blue transition-transform group-hover:scale-110" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-destructive animate-pulse ring-2 ring-card" />
            )}
          </div>
          <span
            className={cn(
              "ml-3 font-semibold text-foreground/90 whitespace-nowrap overflow-hidden transition-all duration-300",
              isCollapsed ? "w-0 opacity-0 pointer-events-none" : "w-auto opacity-100"
            )}
          >
            {t("notifications")}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={isCollapsed ? "start" : "end"}
        side="right"
        className="w-80 sm:w-88 rounded-2xl p-0 shadow-2xl border border-border bg-card overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/70 bg-accent/30">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-brand-blue" />
            <span className="text-xs font-bold text-foreground">{t("notifications")}</span>
            {unreadCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-destructive/15 text-destructive font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-[11px] text-brand-blue hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="h-3 w-3" />
              <span>{t("markAllAsRead")}</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-72 overflow-y-auto divide-y divide-border/50">
          {notifications.length === 0 || (unreadCount === 0 && notifications.every((n) => n.read)) ? (
            <div className="p-6 text-center space-y-2">
              <div className="mx-auto w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Check className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-foreground">{t("allCaughtUp")}</p>
              <p className="text-[11px] text-muted-foreground">{t("noNewNotifications")}</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => markSingleAsRead(item.id)}
                className={cn(
                  "p-3 text-left transition-colors cursor-pointer flex gap-3 items-start",
                  item.read
                    ? "opacity-60 bg-transparent hover:bg-accent/30"
                    : "bg-accent/40 hover:bg-accent/60"
                )}
              >
                <div className="p-2 rounded-xl bg-background border border-border/60 shrink-0 mt-0.5">
                  {renderIcon(item.icon)}
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-bold text-foreground truncate">
                      {t(item.titleKey)}
                    </p>
                    <span className="text-[10px] text-muted-foreground shrink-0">{item.time}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {t(item.descKey)}
                  </p>
                </div>
                {!item.read && (
                  <span className="h-2 w-2 rounded-full bg-brand-blue shrink-0 mt-1.5" />
                )}
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
