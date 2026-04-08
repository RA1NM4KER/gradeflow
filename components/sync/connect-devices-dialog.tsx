"use client";

import { ReactNode, SyntheticEvent, useMemo, useState } from "react";
import { ChevronDown, Cloud, Smartphone, TriangleAlert } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DialogTriggerAction } from "@/components/ui/dialog-trigger-action";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingMessage } from "@/components/ui/loading-message";
import { NoticePanel } from "@/components/ui/notice-panel";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SelectableCardButton } from "@/components/ui/selectable-card-button";
import { useSyncConnection } from "@/components/sync/sync-provider";
import { formatLastSyncedAt, getSyncStatusLabel } from "@/lib/sync/sync-status";
import { cn } from "@/lib/shared/utils";

type AuthMode = "sign-in" | "sign-up";

export function ConnectDevicesDialog({
  triggerAsChild = false,
  triggerChildren,
}: {
  triggerAsChild?: boolean;
  triggerChildren?: ReactNode;
}) {
  const {
    deleteAccount,
    errorMessage,
    isAuthenticated,
    isConfigured,
    isRestoringSession,
    requestPasswordReset,
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
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isDangerZoneOpen, setIsDangerZoneOpen] = useState(false);
  const [resetNotice, setResetNotice] = useState<string | null>(null);
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
  const canDeleteAccount = deleteConfirmation.trim() === "DELETE";

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

  async function handleSubmit(
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setResetNotice(null);

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
    setResetNotice(null);

    try {
      await syncNow();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteAccount() {
    if (!canDeleteAccount) {
      return;
    }

    setIsDeletingAccount(true);
    setDeleteError(null);

    try {
      const result = await deleteAccount();

      if (!result.ok) {
        setDeleteError(result.errorMessage);
        return;
      }

      setDeleteConfirmation("");
      setDeleteError(null);
      setIsDangerZoneOpen(false);
      setMode("sign-in");
      setPassword("");
      setSubmitError(null);
      setResetNotice(null);
    } finally {
      setIsDeletingAccount(false);
    }
  }

  async function handleForgotPassword() {
    if (!isEmailValid) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setResetNotice(null);

    try {
      const result = await requestPasswordReset(trimmedEmail);

      if (result.ok) {
        setResetNotice(
          `Password reset email sent to ${trimmedEmail}. Open the link there to choose a new password.`,
        );
      } else {
        setSubmitError(result.errorMessage);
      }
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
          setDeleteConfirmation("");
          setDeleteError(null);
          setIsDangerZoneOpen(false);
          setSubmitError(null);
          setResetNotice(null);
        }
      }}
      open={open}
    >
      <DialogTriggerAction
        asChild={triggerAsChild}
        fallback={<Button variant="outline">Connect devices</Button>}
      >
        {triggerChildren}
      </DialogTriggerAction>
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
            <LoadingMessage size="sm">
              Restoring your connected devices session…
            </LoadingMessage>
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
                    ? "border-success-soft bg-success-soft text-success"
                    : status === "offline-pending"
                      ? "border-warning-soft bg-warning-soft text-warning"
                      : status === "error"
                        ? "border-danger-soft bg-danger-soft text-danger"
                        : "border-line bg-surface text-ink-muted",
                )}
              >
                <Cloud className="h-3.5 w-3.5" />
                {statusLabel}
              </span>
            </div>
          </div>

          {statusNotice && !isAuthenticated ? (
            <NoticePanel tone="success">{statusNotice}</NoticePanel>
          ) : null}

          {!isConfigured ? (
            <NoticePanel tone="warning">
              Sync is not configured in this build yet. Add
              `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to
              enable connected devices.
            </NoticePanel>
          ) : isAuthenticated ? (
            <>
              <Card className="rounded-[24px]" variant="glass-panel">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold text-foreground">
                    Connected devices are enabled
                  </p>
                  <p className="mt-1 text-sm leading-6 text-ink-soft">
                    {connectedStateCopy}
                  </p>
                  {statusNotice ? (
                    <p className="mt-2 text-sm text-ink-muted">
                      {statusNotice}
                    </p>
                  ) : null}
                  {status === "error" && errorMessage ? (
                    <p className="mt-2 text-sm text-danger">{errorMessage}</p>
                  ) : null}
                  <div className="mt-4">
                    <Button
                      disabled={isSubmitting || isSyncing}
                      onClick={handleSyncNow}
                      type="button"
                      variant="outline"
                    >
                      {isSubmitting || isSyncing ? <LoadingSpinner /> : null}
                      Sync now
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <div className="rounded-[24px] border border-line/80 bg-surface/70 shadow-card backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                <button
                  className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
                  onClick={() => {
                    setIsDangerZoneOpen((current) => !current);
                    setDeleteError(null);
                  }}
                  type="button"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-700 dark:border-red-950/40 dark:bg-red-950/30 dark:text-red-200">
                      <TriangleAlert className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Danger zone
                      </p>
                      <p className="mt-1 text-sm leading-5 text-ink-soft">
                        Delete your cloud account and synced data.
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-ink-muted transition-transform",
                      isDangerZoneOpen ? "rotate-180" : "",
                    )}
                  />
                </button>

                {isDangerZoneOpen ? (
                  <div className="border-t border-red-200/70 bg-red-50/80 px-4 py-4 dark:border-red-950/40 dark:bg-red-950/20">
                    <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                      Delete cloud account
                    </p>
                    <p className="mt-1 text-sm leading-6 text-red-800 dark:text-red-200">
                      This permanently deletes your GradeLog account, synced
                      devices, shared course links, and cloud sync history.
                      Courses saved only on this device will stay here.
                    </p>
                    <div className="mt-4 space-y-2">
                      <Label htmlFor="delete-account-confirmation">
                        Type DELETE to confirm
                      </Label>
                      <Input
                        id="delete-account-confirmation"
                        onChange={(event) => {
                          setDeleteConfirmation(event.target.value);
                          setDeleteError(null);
                        }}
                        placeholder="DELETE"
                        value={deleteConfirmation}
                      />
                    </div>
                    {deleteError ? (
                      <p className="mt-3 text-sm text-red-700 dark:text-red-200">
                        {deleteError}
                      </p>
                    ) : null}
                    <div className="mt-4">
                      <Button
                        disabled={isDeletingAccount || !canDeleteAccount}
                        onClick={handleDeleteAccount}
                        type="button"
                        variant="destructive"
                      >
                        {isDeletingAccount ? <LoadingSpinner /> : null}
                        Delete account
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                <SelectableCardButton
                  className={cn("text-left text-sm font-medium")}
                  onClick={() => {
                    setMode("sign-up");
                    setSubmitError(null);
                    setResetNotice(null);
                  }}
                  size="compact"
                  tone={mode === "sign-up" ? "active" : "inactive"}
                >
                  Create account
                </SelectableCardButton>
                <SelectableCardButton
                  className={cn("text-left text-sm font-medium")}
                  onClick={() => {
                    setMode("sign-in");
                    setSubmitError(null);
                    setResetNotice(null);
                  }}
                  size="compact"
                  tone={mode === "sign-in" ? "active" : "inactive"}
                >
                  Sign in
                </SelectableCardButton>
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
                      setResetNotice(null);
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

                {mode === "sign-in" ? (
                  <div className="flex justify-start">
                    <button
                      className="text-sm font-medium text-foreground underline decoration-line underline-offset-4 transition hover:text-foreground/80 disabled:cursor-not-allowed disabled:text-ink-muted"
                      disabled={isSubmitting || !isEmailValid}
                      onClick={handleForgotPassword}
                      type="button"
                    >
                      Forgot password?
                    </button>
                  </div>
                ) : null}
              </div>

              {resetNotice ? (
                <p className="text-sm text-success">{resetNotice}</p>
              ) : null}

              {(submitError ?? errorMessage) ? (
                <div className="grid gap-2">
                  <p className="text-sm text-danger">
                    {submitError ?? errorMessage}
                  </p>
                  {showsExistingUserError && mode === "sign-up" ? (
                    <button
                      className="justify-self-start text-sm font-medium text-foreground underline decoration-line underline-offset-4 transition hover:text-foreground/80"
                      onClick={() => {
                        setMode("sign-in");
                        setSubmitError(null);
                        setResetNotice(null);
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
                  disabled={isSubmitting || !isFormValid}
                  type="submit"
                  variant={isFormValid ? "glass-strong" : "glass-muted"}
                >
                  {isSubmitting ? <LoadingSpinner /> : null}
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
              {isSubmitting ? <LoadingSpinner /> : null}
              Disconnect this device
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
