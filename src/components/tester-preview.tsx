"use client";

import { useEffect, useState } from "react";
import { DeviceFrame } from "@/components/device-frame";
import type { Device } from "@/types";

const MOBILE_QUERY = "(max-width: 767px)";

export default function TesterPreview({
  slug,
  label,
  device,
  title,
}: {
  slug: string;
  label: string;
  device: Device;
  title: string;
}) {
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobileViewport(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const banner =
    device === "desktop" && isMobileViewport
      ? "Lebih enak dibuka di desktop"
      : device === "mobile" && !isMobileViewport
        ? "Lebih enak dibuka di smartphone"
        : null;

  const showBanner = banner !== null && !bannerDismissed;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {showBanner ? (
        <div className="flex items-center justify-between gap-3 border-b border-amber-300 bg-amber-50 px-4 py-2">
          <span className="text-sm font-medium text-amber-900">{banner}</span>
          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            className="shrink-0 rounded-md px-2 py-0.5 text-xs font-medium text-amber-800 transition hover:bg-amber-100"
          >
            Tutup
          </button>
        </div>
      ) : null}
      <DeviceFrame device={device} className="min-h-0 flex-1" contentClassName="h-full">
        <iframe
          title={title}
          src={`/r/${slug}/${label}`}
          sandbox="allow-scripts"
          className="block h-full w-full border-0"
        />
      </DeviceFrame>
    </div>
  );
}