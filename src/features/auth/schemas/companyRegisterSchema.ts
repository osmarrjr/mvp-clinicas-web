import { z } from "zod";

import { getCompanyNameValidationError } from "../validators/companyName/companyName";
import {
  isValidCnpj,
  isValidCpf,
  stripDigits,
} from "../validators/cpfCnpj/cpfCnpj";
import { getEmailValidationError } from "../validators/email/email";
import { getPasswordValidationError } from "../validators/password/password";
import { getPhoneValidationError } from "../validators/phone/phone";

const companyRegisterBaseSchema = z.object({
  companyName: z
    .string()
    .max(70, "Nome da empresa deve ter no máximo 70 caracteres.")
    .superRefine((value, ctx) => {
      const message = getCompanyNameValidationError(value);

      if (message) {
        ctx.addIssue({
          code: "custom",
          message,
        });
      }
    }),

  taxId: z.string().superRefine((value, ctx) => {
    const digits = stripDigits(value);

    if (!digits) {
      ctx.addIssue({
        code: "custom",
        message: "CPF ou CNPJ é obrigatório.",
      });
      return;
    }

    if (digits.length < 11) {
      ctx.addIssue({
        code: "custom",
        message: "CPF ou CNPJ incompleto.",
      });
      return;
    }

    if (digits.length > 11 && digits.length < 14) {
      ctx.addIssue({
        code: "custom",
        message: "CNPJ incompleto.",
      });
      return;
    }

    if (digits.length > 14) {
      ctx.addIssue({
        code: "custom",
        message: "CNPJ deve conter 14 dígitos.",
      });
      return;
    }

    if (digits.length === 11) {
      if (!isValidCpf(digits)) {
        ctx.addIssue({
          code: "custom",
          message: "CPF inválido.",
        });
      }

      return;
    }

    if (!isValidCnpj(digits)) {
      ctx.addIssue({
        code: "custom",
        message: "CNPJ inválido.",
      });
    }
  }),

  uf: z.string().min(1, "Estado é obrigatório."),

  city: z.string().min(1, "Cidade é obrigatória."),

  email: z
    .string()
    .max(70, "Email deve ter no máximo 70 caracteres.")
    .superRefine((value, ctx) => {
      const message = getEmailValidationError(value);

      if (message) {
        ctx.addIssue({
          code: "custom",
          message,
        });
      }
    }),

  phone: z.string().superRefine((value, ctx) => {
    const message = getPhoneValidationError(value);

    if (message) {
      ctx.addIssue({
        code: "custom",
        message,
      });
    }
  }),

  password: z.string().max(20, "Senha deve ter no máximo 20 caracteres."),

  confirmPassword: z
    .string()
    .max(20, "Confirmação de senha deve ter no máximo 20 caracteres."),

  plan: z.enum(["basic", "medium", "pro"], {
    error: "Plano é obrigatório.",
  }),

  taxIdType: z.enum(["cpf", "cnpj"]).optional(),
});

export const companyRegisterSchema = companyRegisterBaseSchema.superRefine(
  (values, ctx) => {
    const passwordError = getPasswordValidationError(values.password, {
      companyName: values.companyName,
      taxId: values.taxId,
      email: values.email,
    });

    if (passwordError) {
      ctx.addIssue({
        code: "custom",
        message: passwordError,
        path: ["password"],
      });
    }

    if (!values.confirmPassword.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Confirmação de senha é obrigatória.",
        path: ["confirmPassword"],
      });
    } else if (values.password !== values.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "As senhas não conferem",
        path: ["confirmPassword"],
      });
    }
  },
);

export type CompanyRegisterFormValues = z.infer<typeof companyRegisterSchema>;
