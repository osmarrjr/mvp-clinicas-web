import * as React from "react"

import { cn } from "@/lib/utils"
import { disabledFormControlClassName } from "@/lib/styles/disabled-field"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-12 w-full rounded-lg border border-input bg-white px-4 py-2 text-base text-foreground transition-colors outline-none placeholder:text-sm placeholder:text-muted-foreground focus-visible:border-ring/50 aria-invalid:border-destructive dark:bg-input/30 dark:aria-invalid:border-destructive/50",
        disabledFormControlClassName,
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
