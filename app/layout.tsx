import type { Metadata } from "next";
import type { Viewport } from "next";
import React from "react";

import { AppProviders } from "@/components/layout/app-providers";
import { AppShell } from "@/components/layout/app-shell";
import { TopNav } from "@/components/layout/top-nav";
import { RouteCacheWarmup } from "@/components/pwa/route-cache-warmup";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { getThemeInitializerScript } from "@/lib/theme/theme";
import { Analytics } from "@vercel/analytics/next";

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
    shortcut: "/favicon.png",
    apple: "/apple-icon.png",
    icon: [
      {
        url: "/favicon.png",
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

const themeInitializerScript = getThemeInitializerScript();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeInitializerScript }} />
        <AppProviders>
          <AppShell>
            <RouteCacheWarmup />
            <TopNav />
            {children}
          </AppShell>
        </AppProviders>
        <Analytics />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
