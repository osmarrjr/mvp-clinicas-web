import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
};

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn("flex-1 overflow-auto p-4 md:p-6 lg:p-8", className)}>
      {children}
    </div>
  );
}
