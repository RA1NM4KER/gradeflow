"use client";

import { useEffect } from "react";

import { isNativeApp } from "@/lib/platform";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      isNativeApp() ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    ) {
      return;
    }

    void navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
  }, []);

  return null;
}
