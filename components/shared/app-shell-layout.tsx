"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { AppHeader } from "@/components/shared/app-header";

interface AppShellLayoutProps {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
}

export function AppShellLayout({ children, rightPanel }: AppShellLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Left Navigation Sidebar */}
      <AppSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main App Container */}
      <div className="flex flex-1 flex-col md:pl-60 min-w-0">
        {/* Top Header */}
        <AppHeader onOpenMobile={() => setMobileSidebarOpen(true)} />

        {/* Content Body & Optional Right Panel */}
        <div className="flex flex-1 min-w-0">
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
            {children}
          </main>

          {rightPanel && rightPanel}
        </div>
      </div>
    </div>
  );
}
