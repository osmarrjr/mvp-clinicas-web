import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";

import type { CompanyRegisterFormValues } from "../../../schemas/companyRegisterSchema";
import { RegisterPhoneField } from "./RegisterPhoneField";

const inputClassName = "test-input";

function PhoneFieldWrapper({ defaultPhone = "" }: { defaultPhone?: string }) {
  const form = useForm<CompanyRegisterFormValues>({
    defaultValues: {
      companyName: "",
      taxId: "",
      stateUf: "",
      city: "",
      email: "",
      phone: defaultPhone,
      password: "",
      confirmPassword: "",
      plan: "basic",
    },
  });

  return (
    <RegisterPhoneField
      register={form.register}
      setValue={form.setValue}
      phoneValue={form.watch("phone")}
      errors={form.formState.errors}
      inputClassName={inputClassName}
    />
  );
}

describe("RegisterPhoneField", () => {
  it("renderiza label e placeholder", () => {
    render(<PhoneFieldWrapper />);

    expect(screen.getByLabelText(/^telefone$/i)).toBeTruthy();
    expect(screen.getByPlaceholderText("(00) 00000-0000")).toBeTruthy();
  });

  it("aplica máscara ao digitar", async () => {
    const user = userEvent.setup();
    render(<PhoneFieldWrapper />);

    const input = screen.getByLabelText(/^telefone$/i);
    await user.type(input, "11987654321");

    expect(input).toHaveProperty("value", "(11) 98765-4321");
  });
});
