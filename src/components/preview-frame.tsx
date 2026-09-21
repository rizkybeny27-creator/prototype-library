"use client";

import { useEffect, useRef, useState } from "react";
import { DeviceFrame } from "@/components/device-frame";
import type { Device } from "@/types";

export const PREVIEW_SANDBOX = "allow-scripts allow-forms";

const HEIGHT_MSG = "__penHeight";
const FALLBACK_HEIGHT = "75vh";

export default function PreviewFrame({
  slug,
  label,
  device,
  title,
  className = "min-h-0 flex-1",
  autoHeight = true,
}: {
  slug: string;
  label: string;
  device: Device;
  title: string;
  className?: string;
  autoHeight?: boolean;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [contentHeight, setContentHeight] = useState<number | null>(null);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { [HEIGHT_MSG]?: number } | null;
      if (
        event.source === frameRef.current?.contentWindow &&
        data &&
        typeof data === "object" &&
        typeof data[HEIGHT_MSG] === "number"
      ) {
        setContentHeight(data[HEIGHT_MSG]);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const style = autoHeight
    ? {
        height: contentHeight ? `${contentHeight}px` : undefined,
        minHeight: contentHeight ? undefined : FALLBACK_HEIGHT,
      }
    : undefined;

  return (
    <DeviceFrame
      device={device}
      className={className}
      contentClassName={autoHeight ? "" : "h-full"}
    >
      <iframe
        ref={frameRef}
        title={title}
        src={`/r/${slug}/${label}`}
        sandbox={PREVIEW_SANDBOX}
        scrolling="auto"
        className={`block w-full border-0 ${autoHeight ? "" : "h-full"}`}
        style={style}
      />
    </DeviceFrame>
  );
}