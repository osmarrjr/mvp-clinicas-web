import {
  ErrorState,
  forbiddenErrorStateProps,
} from "@/components/shared/ErrorState";

export default function AppForbiddenPage() {
  return (
    <ErrorState
      {...forbiddenErrorStateProps}
      actionLabel="Ir para o painel"
      actionHref="/dashboard"
    />
  );
}
