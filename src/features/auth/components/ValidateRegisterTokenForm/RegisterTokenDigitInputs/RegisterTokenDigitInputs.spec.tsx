import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { RegisterTokenDigitInputs } from "./RegisterTokenDigitInputs";

function ControlledWrapper({
  initialValue = "",
  disabled,
}: {
  initialValue?: string;
  disabled?: boolean;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <>
      <label id="register-token-label" htmlFor="register-token-digit-1">
        Token de validação
      </label>
      <RegisterTokenDigitInputs
        value={value}
        onChange={setValue}
        inputClassName="test-digit-input"
        disabled={disabled}
        ariaDescribedBy="register-token-hint"
      />
      <p data-testid="current-value">{value}</p>
    </>
  );
}

describe("RegisterTokenDigitInputs", () => {
  it("renderiza 6 inputs com separador visual e labels acessíveis", () => {
    render(<ControlledWrapper />);

    expect(screen.getByRole("group")).toBeTruthy();
    expect(screen.getByText("-").getAttribute("aria-hidden")).toBe("true");

    for (let digit = 1; digit <= 6; digit += 1) {
      expect(screen.getByLabelText(`Dígito ${digit} de 6`)).toBeTruthy();
    }
  });

  it("avança foco ao digitar dígito", async () => {
    const user = userEvent.setup();
    render(<ControlledWrapper />);

    const firstDigit = screen.getByLabelText("Dígito 1 de 6");
    const secondDigit = screen.getByLabelText("Dígito 2 de 6");

    await user.click(firstDigit);
    await user.type(firstDigit, "1");

    expect(document.activeElement).toBe(secondDigit);
    expect(screen.getByTestId("current-value").textContent).toBe("1");
  });

  it("retorna foco ao campo anterior com backspace em slot vazio", async () => {
    const user = userEvent.setup();
    render(<ControlledWrapper initialValue="1" />);

    const secondDigit = screen.getByLabelText("Dígito 2 de 6");
    const firstDigit = screen.getByLabelText("Dígito 1 de 6");

    await user.click(secondDigit);
    await user.keyboard("{Backspace}");

    expect(document.activeElement).toBe(firstDigit);
  });

  it("preenche os 6 campos ao colar 123456", async () => {
    const user = userEvent.setup();
    render(<ControlledWrapper />);

    const firstDigit = screen.getByLabelText("Dígito 1 de 6");
    await user.click(firstDigit);
    await user.paste("123456");

    expect(screen.getByTestId("current-value").textContent).toBe("123-456");
    expect(
      (screen.getByLabelText("Dígito 6 de 6") as HTMLInputElement).value,
    ).toBe("6");
  });

  it("preenche os 6 campos ao colar 123-456", async () => {
    const user = userEvent.setup();
    render(<ControlledWrapper />);

    const firstDigit = screen.getByLabelText("Dígito 1 de 6");
    await user.click(firstDigit);
    await user.paste("123-456");

    expect(screen.getByTestId("current-value").textContent).toBe("123-456");
    expect(
      (screen.getByLabelText("Dígito 3 de 6") as HTMLInputElement).value,
    ).toBe("3");
    expect(
      (screen.getByLabelText("Dígito 4 de 6") as HTMLInputElement).value,
    ).toBe("4");
  });

  it("mantém dígitos nas posições ao apagar dígito intermediário", async () => {
    const user = userEvent.setup();
    render(<ControlledWrapper initialValue="123-456" />);

    const thirdDigit = screen.getByLabelText("Dígito 3 de 6");
    await user.click(thirdDigit);
    await user.keyboard("{Backspace}");

    expect(
      (screen.getByLabelText("Dígito 1 de 6") as HTMLInputElement).value,
    ).toBe("1");
    expect(
      (screen.getByLabelText("Dígito 2 de 6") as HTMLInputElement).value,
    ).toBe("2");
    expect(
      (screen.getByLabelText("Dígito 3 de 6") as HTMLInputElement).value,
    ).toBe("");
    expect(
      (screen.getByLabelText("Dígito 4 de 6") as HTMLInputElement).value,
    ).toBe("4");
    expect(
      (screen.getByLabelText("Dígito 5 de 6") as HTMLInputElement).value,
    ).toBe("5");
    expect(
      (screen.getByLabelText("Dígito 6 de 6") as HTMLInputElement).value,
    ).toBe("6");
    expect(screen.getByTestId("current-value").textContent).toBe("12_456");
  });

  it("sincroniza inputs quando value muda externamente", () => {
    function ExternallyControlledWrapper({ value }: { value: string }) {
      return (
        <RegisterTokenDigitInputs
          value={value}
          onChange={() => undefined}
          inputClassName="test-digit-input"
        />
      );
    }

    const { rerender } = render(
      <ExternallyControlledWrapper value="123-456" />,
    );

    expect(
      (screen.getByLabelText("Dígito 1 de 6") as HTMLInputElement).value,
    ).toBe("1");
    expect(
      (screen.getByLabelText("Dígito 6 de 6") as HTMLInputElement).value,
    ).toBe("6");

    rerender(<ExternallyControlledWrapper value="" />);

    for (let digit = 1; digit <= 6; digit += 1) {
      expect(
        (screen.getByLabelText(`Dígito ${digit} de 6`) as HTMLInputElement)
          .value,
      ).toBe("");
    }
  });
});
