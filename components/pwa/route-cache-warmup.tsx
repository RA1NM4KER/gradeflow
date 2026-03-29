"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function buildCurrentRouteUrl(pathname: string, searchParams: URLSearchParams) {
  const queryString = searchParams.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

export function RouteCacheWarmup() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastWarmedUrlRef = useRef<string>("");

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production" ||
      !navigator.onLine
    ) {
      return;
    }

    const routeUrl = buildCurrentRouteUrl(pathname, searchParams);

    if (lastWarmedUrlRef.current === routeUrl) {
      return;
    }

    lastWarmedUrlRef.current = routeUrl;

    void navigator.serviceWorker.ready.then((registration) => {
      registration.active?.postMessage({
        type: "CACHE_ROUTE",
        url: routeUrl,
      });
    });
  }, [pathname, searchParams]);

  return null;
}
