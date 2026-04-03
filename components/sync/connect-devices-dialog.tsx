"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";
import { Cloud, LoaderCircle, Smartphone } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSyncConnection } from "@/components/sync/sync-provider";
import { formatLastSyncedAt, getSyncStatusLabel } from "@/lib/sync-status";
import { cn } from "@/lib/utils";

type AuthMode = "sign-in" | "sign-up";

export function ConnectDevicesDialog({
  triggerAsChild = false,
  triggerChildren,
}: {
  triggerAsChild?: boolean;
  triggerChildren?: ReactNode;
}) {
  const {
    errorMessage,
    isAuthenticated,
    isConfigured,
    isRestoringSession,
    isSyncEnabled,
    isSyncing,
    lastSyncedAt,
    signIn,
    signOut,
    signUp,
    statusNotice,
    status,
    syncNow,
    user,
  } = useSyncConnection();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("sign-up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const trimmedEmail = email.trim();
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
  const isPasswordValid = password.length >= 8;
  const isFormValid = isEmailValid && isPasswordValid;
  const showsExistingUserError = submitError?.includes("user_already_exists");

  const statusLabel = useMemo(() => getSyncStatusLabel(status), [status]);
  const lastSyncedLabel = useMemo(
    () => formatLastSyncedAt(lastSyncedAt),
    [lastSyncedAt],
  );

  const connectedStateCopy = useMemo(() => {
    if (
      status === "connecting" ||
      (status === "syncing" && lastSyncedAt === null)
    ) {
      return "Connecting this device and checking your saved grades.";
    }

    if (status === "syncing") {
      return "Syncing your latest changes across devices.";
    }

    if (status === "offline-pending") {
      return "Your changes are saved here and will sync when you're back online.";
    }

    if (status === "error") {
      return "GradeLog could not finish syncing right now. Your local data is still safe on this device.";
    }

    return "Keep using GradeLog locally. This device can now push and pull your grades when you sync.";
  }, [lastSyncedAt, status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result =
        mode === "sign-in"
          ? await signIn(email.trim(), password)
          : await signUp(email.trim(), password);

      if (result.ok) {
        setPassword("");
        setOpen(false);
      } else {
        setSubmitError(result.errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignOut() {
    setIsSubmitting(true);

    try {
      await signOut();
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSyncNow() {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await syncNow();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (!nextOpen) {
          setPassword("");
          setSubmitError(null);
        }
      }}
      open={open}
    >
      {triggerChildren ? (
        <DialogTrigger asChild={triggerAsChild}>
          {triggerChildren}
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline">Connect devices</Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect your devices</DialogTitle>
          <DialogDescription>
            Keep your grades in sync across your devices. Your data stays on
            this device by default until you choose to connect.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {isRestoringSession ? (
            <p className="flex items-center gap-2 text-sm text-ink-muted">
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
              Restoring your connected devices session…
            </p>
          ) : null}

          <div className="rounded-[20px] border border-white/18 bg-white/24 p-3 shadow-card backdrop-blur-sm dark:border-white/8 dark:bg-white/4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/24 bg-white/52 text-foreground shadow-card dark:border-white/10 dark:bg-white/8">
                  <Smartphone className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {statusLabel}
                  </p>
                  <p className="mt-1 text-sm leading-5 text-ink-soft">
                    {isSyncEnabled && isAuthenticated
                      ? `Connected as ${user?.email ?? "your account"}.`
                      : "You can keep using GradeLog locally without connecting anything."}
                  </p>
                  {isAuthenticated && lastSyncedLabel ? (
                    <p className="mt-1 text-xs text-ink-muted">
                      {lastSyncedLabel}
                    </p>
                  ) : null}
                </div>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.12em]",
                  status === "up-to-date"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : status === "offline-pending"
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : status === "error"
                        ? "border-rose-200 bg-rose-50 text-rose-700"
                        : "border-line bg-surface text-ink-muted",
                )}
              >
                <Cloud className="h-3.5 w-3.5" />
                {statusLabel}
              </span>
            </div>
          </div>

          {!isConfigured ? (
            <div className="rounded-[24px] border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-900">
              Sync is not configured in this build yet. Add
              `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to
              enable connected devices.
            </div>
          ) : isAuthenticated ? (
            <div className="rounded-[24px] border border-white/24 bg-white/38 p-4 shadow-card backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-semibold text-foreground">
                Connected devices are enabled
              </p>
              <p className="mt-1 text-sm leading-6 text-ink-soft">
                {connectedStateCopy}
              </p>
              {statusNotice ? (
                <p className="mt-2 text-sm text-ink-muted">{statusNotice}</p>
              ) : null}
              {status === "error" && errorMessage ? (
                <p className="mt-2 text-sm text-rose-700">{errorMessage}</p>
              ) : null}
              <div className="mt-4">
                <Button
                  disabled={isSubmitting || isSyncing}
                  onClick={handleSyncNow}
                  type="button"
                  variant="outline"
                >
                  {isSubmitting || isSyncing ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : null}
                  Sync now
                </Button>
              </div>
            </div>
          ) : (
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="flex rounded-full border border-white/30 bg-white/60 p-1 shadow-card dark:border-white/10 dark:bg-white/8">
                <button
                  className={cn(
                    "flex-1 rounded-full px-3 py-2 text-sm font-medium transition",
                    mode === "sign-up"
                      ? "border border-stone-300/80 bg-stone-900 text-white shadow-[0_10px_24px_-16px_rgba(15,23,42,0.28)] dark:border-white/14 dark:bg-white/18 dark:text-white"
                      : "text-ink-soft hover:bg-white/55 hover:text-foreground dark:hover:bg-white/10",
                  )}
                  onClick={() => {
                    setMode("sign-up");
                    setSubmitError(null);
                  }}
                  type="button"
                >
                  Create account
                </button>
                <button
                  className={cn(
                    "flex-1 rounded-full px-3 py-2 text-sm font-medium transition",
                    mode === "sign-in"
                      ? "border border-stone-300/80 bg-stone-900 text-white shadow-[0_10px_24px_-16px_rgba(15,23,42,0.28)] dark:border-white/14 dark:bg-white/18 dark:text-white"
                      : "text-ink-soft hover:bg-white/55 hover:text-foreground dark:hover:bg-white/10",
                  )}
                  onClick={() => {
                    setMode("sign-in");
                    setSubmitError(null);
                  }}
                  type="button"
                >
                  Sign in
                </button>
              </div>

              <div className="grid gap-4 rounded-[24px] border border-white/28 bg-white/52 p-4 shadow-card backdrop-blur-sm dark:border-white/10 dark:bg-white/6">
                <div className="space-y-2">
                  <Label htmlFor="sync-email">Email</Label>
                  <Input
                    autoComplete="email"
                    id="sync-email"
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setSubmitError(null);
                    }}
                    required
                    type="email"
                    value={email}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sync-password">Password</Label>
                  <Input
                    autoComplete={
                      mode === "sign-in" ? "current-password" : "new-password"
                    }
                    id="sync-password"
                    minLength={8}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setSubmitError(null);
                    }}
                    required
                    type="password"
                    value={password}
                  />
                </div>

                <p className="text-sm leading-5 text-ink-soft">
                  {mode === "sign-in"
                    ? "Only needed for syncing across devices."
                    : "Your data stays on this device unless you choose to connect."}
                </p>
              </div>

              {(submitError ?? errorMessage) ? (
                <div className="grid gap-2">
                  <p className="text-sm text-rose-700">
                    {submitError ?? errorMessage}
                  </p>
                  {showsExistingUserError && mode === "sign-up" ? (
                    <button
                      className="justify-self-start text-sm font-medium text-foreground underline decoration-line underline-offset-4 transition hover:text-foreground/80"
                      onClick={() => {
                        setMode("sign-in");
                        setSubmitError(null);
                      }}
                      type="button"
                    >
                      Sign in instead
                    </button>
                  ) : null}
                </div>
              ) : null}

              <DialogFooter>
                <Button
                  className={cn(
                    isFormValid
                      ? "border border-stone-300/80 bg-stone-900 text-white shadow-[0_10px_24px_-16px_rgba(15,23,42,0.28)] hover:bg-stone-800 dark:border-white/14 dark:bg-white/18 dark:text-white dark:hover:bg-white/24"
                      : "border border-white/35 bg-white/82 text-ink-muted shadow-[0_10px_24px_-18px_rgba(15,23,42,0.14)] hover:bg-white/82 dark:border-white/12 dark:bg-white/10 dark:text-ink-muted dark:hover:bg-white/10",
                  )}
                  disabled={isSubmitting || !isFormValid}
                  type="submit"
                  variant="outline"
                >
                  {isSubmitting ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : null}
                  {mode === "sign-in" ? "Sign in" : "Create account"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </div>

        {isAuthenticated ? (
          <DialogFooter>
            <Button
              disabled={isSubmitting}
              onClick={handleSignOut}
              type="button"
              variant="outline"
            >
              {isSubmitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : null}
              Disconnect this device
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
