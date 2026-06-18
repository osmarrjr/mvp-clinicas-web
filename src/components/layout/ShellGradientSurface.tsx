import type { ReactNode } from "react";

import {
  AUTH_SHELL_BASE_BG,
  AUTH_SHELL_OVERLAY_BG,
} from "@/lib/theme/auth-shell-gradient";
import { cn } from "@/lib/utils";

type ShellGradientSurfaceProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function ShellGradientSurface({
  children,
  className,
  contentClassName,
}: ShellGradientSurfaceProps) {
  return (
    <div className={cn("relative isolate", className)}>
      <div
        className={cn("pointer-events-none absolute inset-0", AUTH_SHELL_BASE_BG)}
        aria-hidden="true"
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          AUTH_SHELL_OVERLAY_BG,
        )}
        aria-hidden="true"
      />
      <div
        className={cn(
          "relative z-10 h-full w-full min-h-0 min-w-0",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
