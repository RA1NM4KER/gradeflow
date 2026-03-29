import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-5.5rem)] max-w-5xl items-center px-5 py-8 sm:px-8">
      <Card className="w-full max-w-2xl bg-white/85 shadow-card">
        <CardHeader className="space-y-2">
          <CardTitle className="text-base">Offline for now</CardTitle>
          <CardDescription className="max-w-xl text-sm leading-6">
            Gradeflow can reopen offline for pages you have already visited on
            this device. Reconnect once to open this route, then it will be
            available offline after that.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            className="inline-flex h-11 items-center rounded-full bg-stone-950 px-5 text-sm font-semibold text-stone-50"
            href="/"
          >
            Open home
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
