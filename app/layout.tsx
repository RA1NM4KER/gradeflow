import type { Metadata } from "next";
import type { Viewport } from "next";
import React from "react";

import { AppShell } from "@/components/layout/app-shell";
import { TopNav } from "@/components/layout/top-nav";
import { RouteCacheWarmup } from "@/components/pwa/route-cache-warmup";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { CoursesProvider } from "@/components/workspace/courses-provider";
import { THEME_STORAGE_KEY } from "@/lib/theme";

import "./globals.css";

export const metadata: Metadata = {
  title: "GradeLog",
  description:
    "A calm, premium grade tracker for students who want clarity without clutter.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GradeLog",
  },
  icons: {
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
    icon: [
      {
        url: "/favicon.ico",
        sizes: "64x64",
        type: "image/png",
      },
      {
        url: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { color: "#f5f5f3", media: "(prefers-color-scheme: light)" },
    { color: "#17181b", media: "(prefers-color-scheme: dark)" },
  ],
};

const themeInitializerScript = `
(() => {
  const storageKey = ${JSON.stringify(THEME_STORAGE_KEY)};
  const root = document.documentElement;
  const storedTheme = window.localStorage.getItem(storageKey);
  const theme =
    storedTheme === "light" || storedTheme === "dark" || storedTheme === "system"
      ? storedTheme
      : "system";
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolvedTheme =
    theme === "system" ? (prefersDark ? "dark" : "light") : theme;

  root.classList.toggle("dark", resolvedTheme === "dark");
  root.style.colorScheme = resolvedTheme;
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeInitializerScript }} />
        <ThemeProvider>
          <CoursesProvider>
            <AppShell>
              <RouteCacheWarmup />
              <TopNav />
              {children}
            </AppShell>
          </CoursesProvider>
        </ThemeProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
