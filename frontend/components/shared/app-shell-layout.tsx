"use client";

import { SidebarProvider, useSidebar } from "@/components/providers/sidebar-provider";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { AppHeader } from "@/components/shared/app-header";
import { cn } from "@/lib/utils";

interface AppShellLayoutProps {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
}

function AppShellContent({ children, rightPanel }: AppShellLayoutProps) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Left Navigation Sidebar */}
      <AppSidebar />

      {/* Main App Container */}
      <div
        className={cn(
          "flex flex-1 flex-col min-w-0 transition-all duration-300 ease-in-out",
          isCollapsed ? "md:pl-[68px]" : "md:pl-64"
        )}
      >
        {/* Top Header */}
        <AppHeader />

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

export function AppShellLayout(props: AppShellLayoutProps) {
  return (
    <SidebarProvider>
      <AppShellContent {...props} />
    </SidebarProvider>
  );
}
