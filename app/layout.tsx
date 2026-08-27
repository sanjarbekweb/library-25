import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LanguageProvider } from "@/components/providers/language-provider";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  variable: "--font-sans-main",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "libra25 — School Library Management",
    template: "%s | libra25",
  },
  description:
    "libra25 is a modern school library management platform with typo-tolerant search, rapid circulation desk workflows, and real-time collection analytics.",
  icons: {
    icon: "/images/logo.jpg",
    shortcut: "/images/logo.jpg",
    apple: "/images/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className={cn(
          "h-full antialiased font-sans",
          inter.variable
        )}
      >
        <head>
          <link rel="preconnect" href="https://images.unsplash.com" />
          <link rel="preconnect" href="https://m.media-amazon.com" />
          <link rel="dns-prefetch" href="https://covers.openlibrary.org" />
        </head>
        <body className="min-h-full flex flex-col bg-background text-foreground">
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
            <LanguageProvider>
              <LenisProvider>
                <QueryProvider>
                  {children}
                  <ToastProvider />
                </QueryProvider>
              </LenisProvider>
            </LanguageProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
