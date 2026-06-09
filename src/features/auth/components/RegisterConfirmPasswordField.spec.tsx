import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";

import type { CompanyRegisterFormValues } from "../schemas/companyRegisterSchema";
import { RegisterConfirmPasswordField } from "./RegisterConfirmPasswordField";

const inputClassName = "test-input";

function ConfirmPasswordFieldWrapper({
  defaultPassword = "",
  defaultConfirmPassword = "",
}: {
  defaultPassword?: string;
  defaultConfirmPassword?: string;
}) {
  const form = useForm<CompanyRegisterFormValues>({
    defaultValues: {
      companyName: "",
      taxId: "",
      stateUf: "",
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
      inputClassName={inputClassName}
    />
  );
}

describe("RegisterConfirmPasswordField", () => {
  it("renderiza placeholder", () => {
    render(<ConfirmPasswordFieldWrapper />);

    expect(
      screen.getByPlaceholderText("Confirme sua senha"),
    ).toBeTruthy();
  });

  it("exibe mensagem vermelha quando senhas conferem", async () => {
    const user = userEvent.setup();
    render(
      <ConfirmPasswordFieldWrapper
        defaultPassword="Senha@123"
        defaultConfirmPassword=""
      />,
    );

    const input = screen.getByLabelText(/confirmar senha/i);
    await user.type(input, "Senha@123");

    const message = screen.getByText("Senhas conferem");
    expect(message).toBeTruthy();
    expect(message.className).toContain("text-red-200");
  });

  it("exibe mensagem vermelha quando senhas não conferem", async () => {
    const user = userEvent.setup();
    render(
      <ConfirmPasswordFieldWrapper
        defaultPassword="Senha@123"
        defaultConfirmPassword=""
      />,
    );

    const input = screen.getByLabelText(/confirmar senha/i);
    await user.type(input, "Outra@123");

    const message = screen.getByText("As senhas não conferem");
    expect(message).toBeTruthy();
    expect(message.className).toContain("text-red-200");
  });
});
