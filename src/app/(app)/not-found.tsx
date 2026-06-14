import {
  ErrorState,
  notFoundErrorStateProps,
} from "@/components/shared/ErrorState";

export default function AppNotFoundPage() {
  return (
    <ErrorState
      {...notFoundErrorStateProps}
      title="Página não encontrada"
      description="Não encontramos esta seção do sistema. Volte ao painel principal para continuar."
      actionLabel="Ir para o painel"
      actionHref="/dashboard"
    />
  );
}
