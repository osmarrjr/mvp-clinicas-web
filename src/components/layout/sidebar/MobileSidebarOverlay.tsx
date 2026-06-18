"use client";

import { useEffect, type ReactNode } from "react";

import { AUTH_SHELL_BORDER, AUTH_SHELL_FOREGROUND } from "@/lib/theme/auth-shell-gradient";
import { cn } from "@/lib/utils";

import { SIDEBAR_MOBILE_WIDTH } from "./config";
import { useSidebar } from "./SidebarContext";

type MobileSidebarOverlayProps = {
  children: ReactNode;
};

export function MobileSidebarOverlay({ children }: MobileSidebarOverlayProps) {
  const { openMobile, setOpenMobile, isMobile } = useSidebar();

  useEffect(() => {
    if (!openMobile) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenMobile(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [openMobile, setOpenMobile]);

  if (!isMobile) {
    return null;
  }

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/20 transition-opacity duration-200",
          openMobile
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        aria-hidden={!openMobile}
        onClick={() => setOpenMobile(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-hidden={!openMobile}
        data-slot="sidebar-mobile"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r transition-transform duration-200 ease-out",
          AUTH_SHELL_BORDER,
          AUTH_SHELL_FOREGROUND,
          openMobile
            ? "pointer-events-auto translate-x-0"
            : "pointer-events-none -translate-x-full",
        )}
        style={{ width: SIDEBAR_MOBILE_WIDTH }}
      >
        {children}
      </div>
    </>
  );
}
