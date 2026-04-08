"use client";

import Link from "next/link";
import { SyntheticEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormPageContainer } from "@/components/ui/form-page-container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingMessage } from "@/components/ui/loading-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  clearPasswordRecoverySession,
  getCurrentSyncSession,
  hasPasswordRecoverySession,
  signOutFromSync,
  updateCurrentSyncPassword,
} from "@/lib/sync/sync-auth";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [hasCompletedReset, setHasCompletedReset] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isPasswordValid = password.length >= 8;
  const passwordsMatch = password === confirmPassword;
  const canSubmit = isPasswordValid && passwordsMatch;

  useEffect(() => {
    let cancelled = false;

    async function restoreRecoverySession() {
      try {
        const inRecoveryFlow = hasPasswordRecoverySession();
        const session = await getCurrentSyncSession();

        if (cancelled) {
          return;
        }

        setHasRecoverySession(inRecoveryFlow && Boolean(session?.user));

        if (!inRecoveryFlow && session?.user) {
          setErrorMessage(
            "This page only works from a password reset email. Signed-in sessions cannot change the password here.",
          );
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "GradeLog could not verify your password reset link.",
        );
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    }

    void restoreRecoverySession();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { error } = await updateCurrentSyncPassword(password);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      clearPasswordRecoverySession();
      await signOutFromSync();
      setHasCompletedReset(true);
      setHasRecoverySession(false);
      setSuccessMessage(
        "Your password has been updated. Sign in again with the new password.",
      );
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "GradeLog could not update your password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <FormPageContainer>
      <Card className="w-full" variant="glass-panel">
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            Choose a new password for your connected-devices account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {!isReady ? (
            <LoadingMessage>Verifying your reset link…</LoadingMessage>
          ) : hasCompletedReset ? (
            <div className="grid gap-3">
              <p className="text-sm text-success">{successMessage}</p>
              <Button asChild variant="outline">
                <Link href="/">Back to GradeLog</Link>
              </Button>
            </div>
          ) : !hasRecoverySession ? (
            <div className="grid gap-3">
              <p className="text-sm text-danger">
                {errorMessage ??
                  "This password reset link is invalid or has expired. Request a new one from the sign-in screen."}
              </p>
              <Button asChild type="button" variant="outline">
                <Link href="/">Back to GradeLog</Link>
              </Button>
            </div>
          ) : (
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="reset-password">New password</Label>
                <Input
                  autoComplete="new-password"
                  id="reset-password"
                  minLength={8}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  required
                  type="password"
                  value={password}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reset-password-confirm">Confirm password</Label>
                <Input
                  autoComplete="new-password"
                  id="reset-password-confirm"
                  minLength={8}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  required
                  type="password"
                  value={confirmPassword}
                />
              </div>

              <p className="text-sm text-ink-soft">
                Use at least 8 characters.
              </p>

              {!passwordsMatch && confirmPassword.length > 0 ? (
                <p className="text-sm text-danger">Passwords do not match.</p>
              ) : null}

              {errorMessage ? (
                <p className="text-sm text-danger">{errorMessage}</p>
              ) : null}

              {successMessage ? (
                <p className="text-sm text-success">{successMessage}</p>
              ) : null}

              <Button
                disabled={isSubmitting || !canSubmit}
                type="submit"
                variant={canSubmit ? "glass-strong" : "glass-muted"}
              >
                {isSubmitting ? <LoadingSpinner /> : null}
                Update password
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </FormPageContainer>
  );
}
