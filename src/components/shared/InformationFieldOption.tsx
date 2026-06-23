"use client";

import { Info } from "lucide-react";

import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type InformationFieldOptionProps = {
  htmlFor: string;
  children: React.ReactNode;
  tooltip: string;
  infoAriaLabel?: string;
};

export function InformationFieldOption({
  htmlFor,
  children,
  tooltip,
  infoAriaLabel = "Informações sobre o campo",
}: InformationFieldOptionProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Label htmlFor={htmlFor}>{children}</Label>

      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={infoAriaLabel}
              className="inline-flex items-center justify-center rounded-full text-orange-500 transition hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
            >
              <Info className="size-[1.125rem]" />
            </button>
          </TooltipTrigger>

          <TooltipContent side="top" align="center" className="max-w-[220px]">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
