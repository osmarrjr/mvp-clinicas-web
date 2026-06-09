import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";

import type { CompanyRegisterFormValues } from "../../../schemas/companyRegisterSchema";
import { RegisterConfirmPasswordField } from "./RegisterConfirmPasswordField";

const inputClassName = "test-input";

function ConfirmPasswordFieldWrapper({
  defaultPassword = "",
  defaultConfirmPassword = "",
  isPasswordValid = false,
}: {
  defaultPassword?: string;
  defaultConfirmPassword?: string;
  isPasswordValid?: boolean;
}) {
  const form = useForm<CompanyRegisterFormValues>({
    defaultValues: {
      companyName: "",
      taxId: "",
      uf: "",
      city: "",
      email: "",
      phone: "",
      password: defaultPassword,
      confirmPassword: defaultConfirmPassword,
      plan: "basic",
    },
  });

  return (
    <RegisterConfirmPasswordField
      form={form}
      passwordValue={form.watch("password")}
      confirmPasswordValue={form.watch("confirmPassword")}
      isPasswordValid={isPasswordValid}
      inputClassName={inputClassName}
    />
  );
}

describe("RegisterConfirmPasswordField", () => {
  it("renderiza placeholder e tooltip", () => {
    render(<ConfirmPasswordFieldWrapper />);

    expect(
      screen.getByPlaceholderText("Confirme sua senha"),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", {
        name: /informação sobre confirmar senha/i,
      }),
    ).toBeTruthy();
  });

  it("mantém o campo desabilitado enquanto a senha não é válida", () => {
    render(<ConfirmPasswordFieldWrapper isPasswordValid={false} />);

    expect(screen.getByPlaceholderText("Confirme sua senha")).toHaveProperty(
      "disabled",
      true,
    );
  });

  it("habilita o campo quando a senha é válida", () => {
    render(
      <ConfirmPasswordFieldWrapper
        defaultPassword="Senha@123"
        isPasswordValid
      />,
    );

    expect(screen.getByPlaceholderText("Confirme sua senha")).toHaveProperty(
      "disabled",
      false,
    );
  });

  it("não exibe mensagem quando senhas conferem", async () => {
    const user = userEvent.setup();
    render(
      <ConfirmPasswordFieldWrapper
        defaultPassword="Senha@123"
        isPasswordValid
      />,
    );

    const input = screen.getByPlaceholderText("Confirme sua senha");
    await user.type(input, "Senha@123");

    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("exibe mensagem de erro quando senhas não conferem", async () => {
    const user = userEvent.setup();
    render(
      <ConfirmPasswordFieldWrapper
        defaultPassword="Senha@123"
        isPasswordValid
      />,
    );

    const input = screen.getByPlaceholderText("Confirme sua senha");
    await user.type(input, "Outra@123");

    const message = screen.getByText("As senhas não conferem");
    expect(message).toBeTruthy();
    expect(message.className).toContain("text-red-200");
  });
});
