import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TooltipProvider } from "@/components/ui/tooltip";

import { InformationFieldOption } from "./InformationFieldOption";

function renderInformationFieldOption(
  props: Partial<React.ComponentProps<typeof InformationFieldOption>> = {},
) {
  const defaultProps = {
    htmlFor: "test-field",
    tooltip: "Texto explicativo do campo.",
    children: "Label do campo",
  };

  return render(
    <TooltipProvider>
      <InformationFieldOption {...defaultProps} {...props} />
    </TooltipProvider>,
  );
}

describe("InformationFieldOption", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });

  it("renderiza o label com o texto filho", () => {
    renderInformationFieldOption({ children: "Registro ANS" });

    expect(screen.getByText("Registro ANS")).toBeTruthy();
  });

  it("renderiza botão de informação com aria-label padrão", () => {
    renderInformationFieldOption();

    expect(
      screen.getByRole("button", { name: "Informações sobre o campo" }),
    ).toBeTruthy();
  });

  it("aceita aria-label customizado no botão de informação", () => {
    renderInformationFieldOption({
      infoAriaLabel: "Detalhes do registro ANS",
    });

    expect(
      screen.getByRole("button", { name: "Detalhes do registro ANS" }),
    ).toBeTruthy();
  });

  it("exibe conteúdo customizado do tooltip", async () => {
    const user = userEvent.setup();

    renderInformationFieldOption({
      tooltip: "Informe até 6 dígitos numéricos do registro na ANS.",
    });

    await user.hover(
      screen.getByRole("button", { name: "Informações sobre o campo" }),
    );

    expect(
      await screen.findByRole("tooltip", {
        name: "Informe até 6 dígitos numéricos do registro na ANS.",
      }),
    ).toBeTruthy();
  });
});
