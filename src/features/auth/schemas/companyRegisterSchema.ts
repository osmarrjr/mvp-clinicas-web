import { z } from "zod";

import {
  isValidCnpj,
  isValidCpf,
  stripAlphanumeric,
} from "@/lib/validators/cpfCnpj";
import { getPasswordValidationError } from "@/lib/validators/password";

export const companyRegisterSchema = z.object({
  companyName: z
    .string()
    .min(1, "Nome da empresa é obrigatório.")
    .min(3, "Nome da empresa deve ter pelo menos 3 caracteres."),

  taxId: z
    .string()
    .min(1, "CPF ou CNPJ é obrigatório.")
    .superRefine((value, ctx) => {
      const normalized = stripAlphanumeric(value);

      if (!normalized) {
        ctx.addIssue({
          code: "custom",
          message: "CPF ou CNPJ é obrigatório.",
        });
        return;
      }

      const hasLetters = /[A-Z]/.test(normalized);

      if (hasLetters) {
        if (normalized.length < 14) {
          ctx.addIssue({
            code: "custom",
            message: "CNPJ incompleto.",
          });
          return;
        }

        if (normalized.length > 14) {
          ctx.addIssue({
            code: "custom",
            message: "CNPJ deve conter 14 caracteres.",
          });
          return;
        }

        if (!/^[A-Z0-9]{12}\d{2}$/.test(normalized)) {
          ctx.addIssue({
            code: "custom",
            message:
              "CNPJ inválido. Os 12 primeiros caracteres podem conter letras e números, mas os 2 últimos devem ser números.",
          });
          return;
        }

        if (!isValidCnpj(normalized)) {
          ctx.addIssue({
            code: "custom",
            message: "CNPJ inválido.",
          });
        }

        return;
      }

      if (normalized.length > 0 && normalized.length < 11) {
        ctx.addIssue({
          code: "custom",
          message: "CPF ou CNPJ incompleto.",
        });
        return;
      }

      if (normalized.length === 11) {
        if (!isValidCpf(normalized)) {
          ctx.addIssue({
            code: "custom",
            message: "CPF inválido.",
          });
        }

        return;
      }

      if (normalized.length > 11 && normalized.length < 14) {
        ctx.addIssue({
          code: "custom",
          message: "CNPJ incompleto.",
        });
        return;
      }

      if (normalized.length === 14) {
        if (!isValidCnpj(normalized)) {
          ctx.addIssue({
            code: "custom",
            message: "CNPJ inválido.",
          });
        }

        return;
      }

      if (normalized.length > 14) {
        ctx.addIssue({
          code: "custom",
          message: "CNPJ deve conter 14 caracteres.",
        });
      }
    }),

  stateUf: z.string().min(1, "Estado é obrigatório."),

  city: z.string().min(1, "Cidade é obrigatória."),

  cityIbgeId: z.number().optional(),

  email: z.string().min(1, "Email é obrigatório.").email("Email inválido."),

  password: z.string().superRefine((value, ctx) => {
    const message = getPasswordValidationError(value);

    if (message) {
      ctx.addIssue({
        code: "custom",
        message,
      });
    }
  }),

  plan: z.enum(["basic", "medium", "pro"], {
    error: "Plano é obrigatório.",
  }),
});

export type CompanyRegisterFormValues = z.infer<typeof companyRegisterSchema>;
