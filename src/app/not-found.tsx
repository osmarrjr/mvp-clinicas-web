import {
  ErrorState,
  notFoundErrorStateProps,
} from "@/components/shared/ErrorState";

export default function RootNotFoundPage() {
  return (
    <ErrorState
      {...notFoundErrorStateProps}
      secondaryAction={{
        label: "Fazer login",
        href: "/login",
      }}
    />
  );
}
