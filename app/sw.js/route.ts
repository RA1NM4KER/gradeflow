import { NextResponse } from "next/server";
import { getServiceWorkerSource } from "@/lib/service-worker-source";

export function GET() {
  return new NextResponse(getServiceWorkerSource(), {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Service-Worker-Allowed": "/",
    },
  });
}
