import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PlanSelectionStep } from "./PlanSelectionStep";

describe("PlanSelectionStep", () => {
  it("renderiza os três planos com nome, valor e benefícios", () => {
    render(<PlanSelectionStep onSelectPlan={vi.fn()} />);

    expect(screen.getByText(/escolha seu plano/i)).toBeTruthy();
    expect(screen.getByText("Basic")).toBeTruthy();
    expect(screen.getByText("Medium")).toBeTruthy();
    expect(screen.getByText("Pro")).toBeTruthy();
    expect(screen.getByText("R$ 35,00/mês")).toBeTruthy();
    expect(screen.getByText("R$ 75,00/mês")).toBeTruthy();
    expect(screen.getByText("R$ 135,00/mês")).toBeTruthy();
    expect(
      screen.getByText(/até 2 profissionais cadastrados/i),
    ).toBeTruthy();
  });

  it("chama onSelectPlan ao selecionar um plano", async () => {
    const onSelectPlan = vi.fn();
    const user = userEvent.setup();

    render(<PlanSelectionStep onSelectPlan={onSelectPlan} />);

    await user.click(
      screen.getByRole("button", { name: /selecionar medium/i }),
    );

    expect(onSelectPlan).toHaveBeenCalledWith("medium");
  });
});
