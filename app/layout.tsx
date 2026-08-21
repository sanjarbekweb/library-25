import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Rubik } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LanguageProvider } from "@/components/providers/language-provider";
import "./globals.css";
import { cn } from "@/lib/utils";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ShelfSync — School Library Management",
    template: "%s | ShelfSync",
  },
  description:
    "ShelfSync is a modern school library management platform with typo-tolerant search, rapid circulation desk workflows, and real-time collection analytics.",
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
          rubik.variable
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
