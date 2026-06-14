import Link from "next/link";
import { FileQuestion, ShieldX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ErrorStateProps = {
  statusCode: 404 | 403;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  secondaryAction?: {
    label: string;
    href: string;
  };
  className?: string;
};

export const notFoundErrorStateProps: ErrorStateProps = {
  statusCode: 404,
  title: "Página não encontrada",
  description:
    "Não encontramos o endereço solicitado. Verifique o link ou volte para uma área disponível do sistema.",
  actionLabel: "Ir para o início",
  actionHref: "/",
};

export const forbiddenErrorStateProps: ErrorStateProps = {
  statusCode: 403,
  title: "Acesso não permitido",
  description:
    "Você não tem permissão para acessar este conteúdo. Se acredita que isso é um engano, fale com o administrador da clínica.",
  actionLabel: "Ir para o início",
  actionHref: "/",
};

const STATUS_ICONS = {
  404: FileQuestion,
  403: ShieldX,
} as const;

export function ErrorState({
  statusCode,
  title,
  description,
  actionLabel,
  actionHref,
  secondaryAction,
  className,
}: ErrorStateProps) {
  const Icon = STATUS_ICONS[statusCode];

  return (
    <section
      role="alert"
      aria-labelledby="error-state-title"
      className={cn(
        "flex min-h-[50vh] flex-col items-center justify-center px-4 py-12 text-center",
        className,
      )}
    >
      <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-8" aria-hidden="true" />
      </div>

      <p className="mb-2 text-sm font-semibold tracking-wide text-muted-foreground">
        {statusCode}
      </p>

      <h1
        id="error-state-title"
        className="mb-3 text-2xl font-semibold text-foreground md:text-3xl"
      >
        {title}
      </h1>

      <p className="mb-8 max-w-lg text-sm text-muted-foreground md:text-base">
        {description}
      </p>

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Button asChild autoFocus>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>

        {secondaryAction ? (
          <Button asChild variant="outline">
            <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
          </Button>
        ) : null}
      </div>
    </section>
  );
}
