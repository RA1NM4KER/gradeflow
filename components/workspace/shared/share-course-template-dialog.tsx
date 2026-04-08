"use client";

import Image from "next/image";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { Check, Copy, QrCode, Share2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingCard } from "@/components/ui/loading-card";
import { NoticePanel } from "@/components/ui/notice-panel";
import { SectionLabel } from "@/components/ui/section-label";
import { Course } from "@/lib/shared/types";
import {
  buildCourseTemplateQrCode,
  createCourseTemplateShare,
  SharedCourseTemplate,
} from "@/lib/course/course-template";
import { isSupabaseConfigured } from "@/lib/supabase/supabase-browser";

interface ShareCourseTemplateDialogProps {
  course: Course;
  triggerChildren: ReactNode;
}

export function ShareCourseTemplateDialog({
  course,
  triggerChildren,
}: ShareCourseTemplateDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [didCopyLink, setDidCopyLink] = useState(false);
  const [shareData, setShareData] = useState<SharedCourseTemplate | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isConfigured = isSupabaseConfigured();
  const canUseNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";
  const shareDescription = useMemo(
    () =>
      "Anyone with this link can add this course setup to one of their semesters. Your marks are not included.",
    [],
  );

  useEffect(() => {
    if (!open || !isConfigured) {
      return;
    }

    let cancelled = false;

    async function prepareShareData() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const nextShare = await createCourseTemplateShare(course);
        const nextQrCode = await buildCourseTemplateQrCode(nextShare.shareUrl);

        if (cancelled) {
          return;
        }

        setShareData(nextShare);
        setQrCodeDataUrl(nextQrCode);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "The course template link could not be created.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void prepareShareData();

    return () => {
      cancelled = true;
    };
  }, [course, isConfigured, open]);

  useEffect(() => {
    if (!didCopyLink) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDidCopyLink(false);
    }, 1800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [didCopyLink]);

  async function handleCopyLink() {
    if (!shareData?.shareUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareData.shareUrl);
      setDidCopyLink(true);
    } catch (error) {
      setDidCopyLink(false);
      throw error;
    }
  }

  async function handleShareLink() {
    if (!shareData?.shareUrl) {
      return;
    }

    if (canUseNativeShare) {
      await navigator.share({
        text: `Add the ${course.name} course setup in GradeLog.`,
        title: `Share ${course.name}`,
        url: shareData.shareUrl,
      });
      return;
    }

    await handleCopyLink();
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{triggerChildren}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share course setup</DialogTitle>
          <DialogDescription>{shareDescription}</DialogDescription>
        </DialogHeader>

        {!isConfigured ? (
          <NoticePanel className="rounded-2xl px-4 py-3" tone="warning">
            Course sharing needs Supabase to be configured in this build.
          </NoticePanel>
        ) : isLoading ? (
          <LoadingCard message="Preparing your share link" />
        ) : errorMessage ? (
          <NoticePanel className="rounded-2xl px-4 py-3" tone="error">
            {errorMessage}
          </NoticePanel>
        ) : shareData ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
              <Card className="rounded-[24px]" variant="surface-panel">
                <CardContent className="flex flex-col items-center justify-center p-4">
                  {qrCodeDataUrl ? (
                    <Image
                      alt="QR code for the course template share link"
                      className="h-40 w-40 rounded-2xl bg-white p-2"
                      height={160}
                      src={qrCodeDataUrl}
                      unoptimized
                      width={160}
                    />
                  ) : (
                    <div className="flex h-40 w-40 items-center justify-center rounded-2xl border border-dashed border-line bg-surface text-ink-muted">
                      <QrCode className="h-10 w-10" />
                    </div>
                  )}
                  <p className="mt-3 text-center text-xs text-ink-soft">
                    Scan to open this course setup on another device.
                  </p>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="rounded-[24px]" variant="surface-panel">
                  <CardContent className="p-4">
                    <SectionLabel>Share link</SectionLabel>
                    <p className="mt-2 break-all text-sm text-foreground">
                      {shareData.shareUrl}
                    </p>
                  </CardContent>
                </Card>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    className="flex-1"
                    onClick={() => void handleCopyLink()}
                    type="button"
                    variant="outline"
                  >
                    {didCopyLink ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {didCopyLink ? "Copied" : "Copy link"}
                  </Button>
                  {canUseNativeShare ? (
                    <Button
                      className="flex-1"
                      onClick={() => void handleShareLink()}
                      type="button"
                    >
                      <Share2 className="h-4 w-4" />
                      Share link
                    </Button>
                  ) : null}
                </div>

                <Card className="rounded-[24px]" variant="surface-panel">
                  <CardContent className="p-4 text-sm text-ink-soft">
                    This shares the course layout, assignments, and grading
                    scale. It does not share your marks.
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
