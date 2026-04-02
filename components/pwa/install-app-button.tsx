"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { isNativeApp } from "@/lib/platform";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function isStandalone() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    ("standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

function getInstallHint() {
  if (typeof navigator === "undefined") {
    return null;
  }

  const userAgent = navigator.userAgent;

  if (/SamsungBrowser/i.test(userAgent)) {
    return {
      body: "Open the browser menu and tap Add app to Home screen.",
      title: "Install from browser menu",
    };
  }

  if (/Android/i.test(userAgent) && /Firefox/i.test(userAgent)) {
    return {
      body: "Open the browser menu and tap Add app to Home screen.",
      title: "Install from browser menu",
    };
  }

  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    return {
      body: "Use Share, then choose Add to Home Screen.",
      title: "Install from browser menu",
    };
  }

  if (/Android/i.test(userAgent)) {
    return {
      body: "Use your browser menu to install this app if the prompt does not appear.",
      title: "Install from browser menu",
    };
  }

  return null;
}

export function InstallAppButton({
  className,
  onInstalled,
}: {
  className?: string;
  onInstalled?: () => void;
}) {
  const nativeApp = isNativeApp();
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isPrompting, setIsPrompting] = useState(false);
  const [installHint, setInstallHint] = useState<{
    body: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    if (nativeApp) {
      return;
    }

    setIsInstalled(isStandalone());
    setInstallHint(getInstallHint());

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      setIsInstalled(true);
      setPromptEvent(null);
      onInstalled?.();
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [nativeApp, onInstalled]);

  if (nativeApp) {
    return null;
  }

  if (isInstalled || !promptEvent) {
    if (!isInstalled && installHint) {
      return (
        <div
          className={cn(
            "grid gap-1.5 rounded-[18px] border border-white/24 bg-white/44 px-4 py-3 shadow-card backdrop-blur-sm dark:border-white/10 dark:bg-white/6",
            className,
          )}
        >
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Download className="h-4 w-4" />
            <span>{installHint.title}</span>
          </div>
          <p className="text-sm leading-6 text-ink-soft">{installHint.body}</p>
        </div>
      );
    }

    return null;
  }

  return (
    <Button
      className={className}
      disabled={isPrompting}
      onClick={async () => {
        if (!promptEvent) {
          return;
        }

        setIsPrompting(true);

        try {
          await promptEvent.prompt();
          const result = await promptEvent.userChoice;

          if (result.outcome === "accepted") {
            setPromptEvent(null);
            onInstalled?.();
          }
        } finally {
          setIsPrompting(false);
        }
      }}
      type="button"
      variant="outline"
    >
      <Download className="h-4 w-4" />
      Install app
    </Button>
  );
}
