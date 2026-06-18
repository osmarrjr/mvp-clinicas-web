"use client";

import * as React from "react";
import { useCallback, useMemo, useState } from "react";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type SidebarContextValue = {
  state: "expanded" | "collapsed";
  open: boolean;
  openMobile: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
  setOpenMobile: (open: boolean) => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function SidebarProvider({
  children,
  className,
  style,
  ...props
}: React.ComponentProps<"div">) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(true);
  const [openMobile, setOpenMobileState] = useState(false);

  const setOpenMobile = useCallback((value: boolean) => {
    setOpenMobileState(value);
  }, []);

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setOpenMobileState((current) => !current);
      return;
    }

    setOpen((current) => !current);
  }, [isMobile]);

  const state = open ? "expanded" : "collapsed";

  const value = useMemo<SidebarContextValue>(
    () => ({
      state,
      open,
      openMobile,
      isMobile,
      toggleSidebar,
      setOpenMobile,
    }),
    [state, open, openMobile, isMobile, toggleSidebar, setOpenMobile],
  );

  return (
    <SidebarContext.Provider value={value}>
      <div
        data-slot="sidebar-wrapper"
        className={cn("flex min-h-svh w-full", className)}
        style={style}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = React.useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}
