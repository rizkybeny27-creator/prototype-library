"use client";

import { useEffect, useRef, useState } from "react";
import TesterFeedbackForm from "@/components/tester-feedback-form";

function ChatIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-6 w-6"
    >
      <path d="M12 3C6.477 3 2 6.925 2 11.77c0 2.71 1.373 5.132 3.54 6.76-.09.9-.42 1.99-1.26 3.05-.14.18 0 .45.23.42 1.49-.16 2.9-.66 3.9-1.27.94.23 1.95.35 3.02.35 5.523 0 10-3.925 10-8.77S17.523 3 12 3Z" />
      <circle cx="7.5" cy="11.77" r="1.1" fill="#fff" />
      <circle cx="12" cy="11.77" r="1.1" fill="#fff" />
      <circle cx="16.5" cy="11.77" r="1.1" fill="#fff" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className="h-5 w-5"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export default function TesterFeedbackWidget({
  versionId,
}: {
  versionId: number;
}) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  function showToast(message: string) {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }

  function handleSubmitted() {
    setOpen(false);
    showToast("Feedback terkirim, terima kasih!");
  }

  return (
    <>
      {toast ? (
        <div
          role="status"
          className="fixed bottom-24 right-6 z-50 flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-medium text-emerald-800 shadow-lg"
        >
          <CheckIcon />
          {toast}
        </div>
      ) : null}

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Kirim feedback"
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl focus:outline-none"
          >
          <div className="flex items-start justify-between gap-3 border-b border-zinc-100 bg-zinc-50 px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">
                Kirim feedback
              </h3>
              <p className="mt-0.5 text-xs text-zinc-500">
                Seberapa mudah prototype ini digunakan?
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Tutup feedback"
              className="rounded-md p-1 text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-900"
            >
              <CloseIcon />
            </button>
          </div>
          <div className="overflow-y-auto px-5 py-5">
            <TesterFeedbackForm versionId={versionId} onSubmitted={handleSubmitted} />
          </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={open ? "Tutup feedback" : "Buka feedback"}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-zinc-900 py-3 pl-3.5 pr-5 text-sm font-semibold text-white shadow-lg transition hover:bg-zinc-700"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
          {open ? <CloseIcon /> : <ChatIcon />}
        </span>
        {open ? "Tutup" : "Feedback"}
      </button>
    </>
  );
}