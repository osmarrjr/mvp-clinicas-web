"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { tableIconActionClassName } from "./tableIconActionStyles";

type TableIconActionProps = {
  label: string;
  tooltip?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
};

export function TableIconAction({
  label,
  tooltip,
  onClick,
  children,
  className,
}: TableIconActionProps) {
  const button = (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn(tableIconActionClassName, className)}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </Button>
  );

  if (!tooltip) {
    return button;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="top" align="center">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
