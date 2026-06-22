import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type FeaturePageLayoutProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
  cardClassName?: string;
  cardContentClassName?: string;
};

const defaultCardClassName =
  "mt-6 w-full border border-blue-200/50 shadow-[0_8px_32px_rgba(37,99,235,0.18)] ring-1 ring-blue-500/10";

export function FeaturePageLayout({
  title,
  description,
  children,
  className,
  cardClassName,
  cardContentClassName,
}: FeaturePageLayoutProps) {
  return (
    <div className={cn("w-full max-w", className)}>
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-primary">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </header>

      <Card className={cn(defaultCardClassName, cardClassName)}>
        <CardContent className={cn("pt-6", cardContentClassName)}>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
