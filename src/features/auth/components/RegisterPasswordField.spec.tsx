import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";

import type { CompanyRegisterFormValues } from "../schemas/companyRegisterSchema";
import { RegisterPasswordField } from "./RegisterPasswordField";

const inputClassName = "test-input";

function PasswordFieldWrapper({
  companyName = "Clínica Saúde",
  taxId = "52998224725",
}: {
  companyName?: string;
  taxId?: string;
}) {
  const form = useForm<CompanyRegisterFormValues>({
    defaultValues: {
      companyName,
      taxId,
      stateUf: "",
      city: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      plan: "basic",
    },
  });

  return (
    <RegisterPasswordField
      form={form}
      companyName={companyName}
      taxId={taxId}
      inputClassName={inputClassName}
    />
  );
}

describe("RegisterPasswordField", () => {
  it("renderiza placeholder e tooltip de requisitos", () => {
    render(<PasswordFieldWrapper />);

    expect(
      screen.getByPlaceholderText("Crie sua senha de acessos"),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /requisitos da senha/i }),
    ).toBeTruthy();
  });

  it("exibe uma mensagem de hint por vez", async () => {
    const user = userEvent.setup();
    render(<PasswordFieldWrapper />);

    const input = screen.getByLabelText(/^senha$/i);
    await user.type(input, "abc");

    expect(
      screen.getByText("Senha deve ter no mínimo 8 dígitos"),
    ).toBeTruthy();
  });

  it("exibe barra de força com 8 ou mais caracteres", async () => {
    const user = userEvent.setup();
    render(<PasswordFieldWrapper />);

    const input = screen.getByLabelText(/^senha$/i);
    await user.type(input, "Senha@123");

    expect(screen.getByRole("progressbar")).toBeTruthy();
  });

  it("alterna visibilidade da senha", async () => {
    const user = userEvent.setup();
    render(<PasswordFieldWrapper />);

    const input = screen.getByLabelText(/^senha$/i);
    expect(input).toHaveProperty("type", "password");

    await user.click(screen.getByRole("button", { name: /exibir senha/i }));
    expect(input).toHaveProperty("type", "text");
  });
});
