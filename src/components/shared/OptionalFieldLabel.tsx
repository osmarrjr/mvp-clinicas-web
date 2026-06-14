"use client";

import { Info } from "lucide-react";

import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type OptionalFieldLabelProps = {
  htmlFor: string;
  children: React.ReactNode;
};

export function OptionalFieldLabel({
  htmlFor,
  children,
}: OptionalFieldLabelProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Label htmlFor={htmlFor}>{children}</Label>

      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Campo opcional"
              className="inline-flex items-center justify-center rounded-full text-orange-500 transition hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
            >
              <Info className="h-4 w-4" />
            </button>
          </TooltipTrigger>

          <TooltipContent side="top" align="center" className="max-w-[220px]">
            Campo opcional.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
