import type { ReactNode } from "react";

import { APP_SHELL_SIDEBAR_BG } from "@/lib/theme/auth-shell-gradient";
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
    <div className={cn("relative isolate", APP_SHELL_SIDEBAR_BG, className)}>
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
