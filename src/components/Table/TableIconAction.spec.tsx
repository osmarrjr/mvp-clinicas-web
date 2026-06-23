import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pencil } from "lucide-react";

import { TooltipProvider } from "@/components/ui/tooltip";

import { TableIconAction } from "./TableIconAction";

function renderTableIconAction(ui: ReactElement) {
  return render(<TooltipProvider>{ui}</TooltipProvider>);
}

describe("TableIconAction", () => {
  it("renderiza botão acessível com estilo padrão de tabela", () => {
    renderTableIconAction(
      <TableIconAction label="Editar registro" tooltip="Editar registro">
        <Pencil />
      </TableIconAction>,
    );

    const button = screen.getByRole("button", { name: "Editar registro" });

    expect(button.className).toContain("text-muted-foreground");
    expect(button.className).toContain("hover:text-primary");
    expect(button.className).toContain("hover:!bg-transparent");
  });

  it("dispara onClick quando informado", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    renderTableIconAction(
      <TableIconAction
        label="Editar registro"
        onClick={onClick}
      >
        <Pencil />
      </TableIconAction>,
    );

    await user.click(screen.getByRole("button", { name: "Editar registro" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
