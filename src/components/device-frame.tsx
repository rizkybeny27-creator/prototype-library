import type { ReactNode } from "react";
import type { Device } from "@/types";

export const MOBILE_FRAME_WIDTH = 393;

export function DeviceFrame({
  device,
  children,
  className = "",
  contentClassName = "",
}: {
  device: Device;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  const isMobile = device === "mobile";
  return (
    <div className={`flex justify-center overflow-hidden ${className}`}>
      <div
        className={
          isMobile
            ? `w-full shrink-0 border-x border-zinc-200 bg-white shadow-sm ${contentClassName}`
            : `w-full bg-white ${contentClassName}`
        }
        style={isMobile ? { maxWidth: MOBILE_FRAME_WIDTH } : undefined}
      >
        {children}
      </div>
    </div>
  );
}