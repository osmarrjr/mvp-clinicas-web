import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";

import type { CompanyRegisterFormValues } from "../../../schemas/companyRegisterSchema";
import { RegisterPasswordField } from "./RegisterPasswordField";

const inputClassName = "test-input";

function PasswordFieldWrapper({
  companyName = "Clínica Saúde",
  taxId = "52998224725",
  email = "contato@clinica.com",
}: {
  companyName?: string;
  taxId?: string;
  email?: string;
}) {
  const form = useForm<CompanyRegisterFormValues>({
    defaultValues: {
      companyName,
      taxId,
      uf: "",
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
      email={email}
      inputClassName={inputClassName}
    />
  );
}

describe("RegisterPasswordField", () => {
  it("renderiza placeholder e tooltip de requisitos", () => {
    render(<PasswordFieldWrapper />);

    expect(
      screen.getByPlaceholderText("Crie sua senha de acesso"),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /requisitos da senha/i }),
    ).toBeTruthy();
  });

  it("não exibe mensagem de erro antes da interação", () => {
    render(<PasswordFieldWrapper />);

    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("exibe uma mensagem de hint por vez após interação", async () => {
    const user = userEvent.setup();
    render(<PasswordFieldWrapper />);

    const input = screen.getByLabelText(/^senha$/i);
    await user.type(input, "abc");

    expect(
      screen.getByText("Senha deve ter no mínimo 8 dígitos"),
    ).toBeTruthy();
    expect(screen.getAllByRole("alert")).toHaveLength(1);
  });

  it("exibe barra de força apenas quando a senha é válida", async () => {
    const user = userEvent.setup();
    render(<PasswordFieldWrapper />);

    const input = screen.getByLabelText(/^senha$/i);
    await user.type(input, "Senha1234");

    expect(screen.queryByRole("progressbar")).toBeNull();

    await user.clear(input);
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
