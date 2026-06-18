import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import {
  AUTH_SHELL_BASE_BG,
  AUTH_SHELL_OVERLAY_BG,
} from "@/lib/theme/auth-shell-gradient";

import { ShellGradientSurface } from "./ShellGradientSurface";

describe("ShellGradientSurface", () => {
  it("renderiza children no conteúdo visível", () => {
    render(
      <ShellGradientSurface>
        <span>Conteúdo do shell</span>
      </ShellGradientSurface>,
    );

    expect(screen.getByText("Conteúdo do shell")).toBeTruthy();
  });

  it("possui camadas base e overlay do gradiente de autenticação", () => {
    const { container } = render(
      <ShellGradientSurface data-testid="surface">
        <span>Conteúdo</span>
      </ShellGradientSurface>,
    );

    const surface = container.firstChild as HTMLElement;
    const layers = surface.querySelectorAll(":scope > div");

    expect(layers.length).toBeGreaterThanOrEqual(2);
    expect(layers[0].className).toContain(AUTH_SHELL_BASE_BG);
    expect(layers[1].className).toContain("radial-gradient");
    expect(layers[1].className).toContain(AUTH_SHELL_OVERLAY_BG);
  });

  it("aceita className opcional no container", () => {
    const { container } = render(
      <ShellGradientSurface className="custom-shell-class">
        <span>Conteúdo</span>
      </ShellGradientSurface>,
    );

    expect((container.firstChild as HTMLElement).className).toContain(
      "custom-shell-class",
    );
  });
});
