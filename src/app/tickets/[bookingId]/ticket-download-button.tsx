"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type TicketDownloadButtonProps = {
  autoDownload?: boolean;
  downloadUrl: string;
  fileName: string;
  label?: string;
};

async function getDownloadError(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    return payload?.error ?? "Unable to download your ticket PDF.";
  }

  return "Unable to download your ticket PDF.";
}

export function TicketDownloadButton({
  autoDownload = false,
  downloadUrl,
  fileName,
  label = "Download PDF Ticket",
}: TicketDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const autoDownloadStartedRef = useRef(false);

  const startDownload = useCallback(async () => {
    if (isDownloading) {
      return;
    }

    setIsDownloading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(downloadUrl, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(await getDownloadError(response));
      }

      const pdfBlob = await response.blob();
      const contentType = response.headers.get("content-type") ?? pdfBlob.type;

      if (!contentType.includes("application/pdf")) {
        throw new Error("Ticket download did not return a PDF file.");
      }

      const objectUrl = window.URL.createObjectURL(pdfBlob);

      try {
        const anchor = document.createElement("a");
        anchor.href = objectUrl;
        anchor.download = fileName;
        anchor.style.display = "none";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
      } finally {
        window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 0);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to download your ticket PDF.");
    } finally {
      setIsDownloading(false);
    }
  }, [downloadUrl, fileName, isDownloading]);

  useEffect(() => {
    if (!autoDownload || autoDownloadStartedRef.current) {
      return;
    }

    autoDownloadStartedRef.current = true;
    void startDownload();
  }, [autoDownload, startDownload]);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => void startDownload()}
        disabled={isDownloading}
        className="inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-black hover:-translate-y-0.5 hover:bg-white/92 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isDownloading ? "Preparing PDF..." : label}
      </button>

      {autoDownload && !errorMessage ? (
        <p className="text-xs leading-6 text-white/54">
          Your ticket PDF should begin downloading automatically. If it does not, use the button above.
        </p>
      ) : null}

      {errorMessage ? (
        <p className="rounded-[20px] border border-rose-300/16 bg-rose-400/[0.08] px-4 py-3 text-xs leading-6 text-rose-100/88">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
