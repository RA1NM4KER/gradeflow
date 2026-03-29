import type { Metadata } from "next";
import type { Viewport } from "next";
import React from "react";

import { AppShell } from "@/components/layout/app-shell";
import { TopNav } from "@/components/layout/top-nav";
import { RouteCacheWarmup } from "@/components/pwa/route-cache-warmup";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { WorkspaceProvider } from "@/components/workspace/workspace-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Gradeflow",
  description:
    "A calm, premium grade tracker for students who want clarity without clutter.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Gradeflow",
  },
  icons: {
    apple: "/apple-icon.png",
    icon: [
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
  themeColor: "#171717",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <WorkspaceProvider>
          <AppShell>
            <RouteCacheWarmup />
            <TopNav />
            {children}
          </AppShell>
        </WorkspaceProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
