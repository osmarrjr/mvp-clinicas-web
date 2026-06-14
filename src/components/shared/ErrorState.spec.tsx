import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import {
  ErrorState,
  forbiddenErrorStateProps,
  notFoundErrorStateProps,
} from "./ErrorState";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("ErrorState", () => {
  it("renders not-found variant with title, description, status code and primary action", () => {
    render(<ErrorState {...notFoundErrorStateProps} />);

    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      notFoundErrorStateProps.title,
    );
    expect(screen.getByText(notFoundErrorStateProps.description)).toBeTruthy();
    expect(screen.getByText("404")).toBeTruthy();

    const action = screen.getByRole("link", {
      name: notFoundErrorStateProps.actionLabel,
    });
    expect(action.getAttribute("href")).toBe(notFoundErrorStateProps.actionHref);
  });

  it("renders forbidden variant with title, description, status code and primary action", () => {
    render(<ErrorState {...forbiddenErrorStateProps} />);

    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      forbiddenErrorStateProps.title,
    );
    expect(screen.getByText(forbiddenErrorStateProps.description)).toBeTruthy();
    expect(screen.getByText("403")).toBeTruthy();

    const action = screen.getByRole("link", {
      name: forbiddenErrorStateProps.actionLabel,
    });
    expect(action.getAttribute("href")).toBe(forbiddenErrorStateProps.actionHref);
  });

  it("renders optional secondary action when provided", () => {
    render(
      <ErrorState
        statusCode={404}
        title="Página não encontrada"
        description="O endereço pode estar incorreto."
        actionLabel="Ir para o início"
        actionHref="/"
        secondaryAction={{
          label: "Fazer login",
          href: "/login",
        }}
      />,
    );

    expect(screen.getByRole("link", { name: "Fazer login" }).getAttribute("href")).toBe(
      "/login",
    );
  });
});
