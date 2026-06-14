import {
  ErrorState,
  forbiddenErrorStateProps,
} from "@/components/shared/ErrorState";

export default function RootForbiddenPage() {
  return (
    <ErrorState
      {...forbiddenErrorStateProps}
      secondaryAction={{
        label: "Fazer login",
        href: "/login",
      }}
    />
  );
}
