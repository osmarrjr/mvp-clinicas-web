import { z } from "zod";

const FORBIDDEN_CHARS_REGEX = /^[^@#!]*$/;

export const createConvenioSchema = z.object({
  name: z
    .string()
    .trim()
    .min(5, "Nome deve ter no mínimo 5 caracteres.")
    .max(60, "Nome deve ter no máximo 60 caracteres.")
    .regex(FORBIDDEN_CHARS_REGEX, "Nome não pode conter @, # ou !."),

  acronym: z
    .string()
    .trim()
    .min(5, "Sigla deve ter no mínimo 5 caracteres.")
    .max(30, "Sigla deve ter no máximo 30 caracteres.")
    .regex(FORBIDDEN_CHARS_REGEX, "Sigla não pode conter @, # ou !."),

  category: z.enum(["particular", "convenio"], {
    message: "Selecione a categoria.",
  }),

  ansRegistration: z
    .string()
    .optional()
    .superRefine((value, ctx) => {
      const trimmed = (value ?? "").trim();

      if (!trimmed) {
        return;
      }

      if (!/^\d{6}$/.test(trimmed)) {
        ctx.addIssue({
          code: "custom",
          message: "Registro ANS deve ter exatamente 6 dígitos numéricos.",
        });
      }
    }),

  cardNumberMask: z
    .string()
    .optional()
    .superRefine((value, ctx) => {
      const trimmed = (value ?? "").trim();

      if (!trimmed) {
        return;
      }

      if (trimmed.length > 30) {
        ctx.addIssue({
          code: "custom",
          message: "Máscara do cartão deve ter no máximo 30 caracteres.",
        });
      }

      if (!/^[0\-./]*$/.test(trimmed)) {
        ctx.addIssue({
          code: "custom",
          message:
            "Máscara do cartão aceita apenas números, hífen, ponto e barra.",
        });
      }
    }),
});

export type CreateConvenioFormValues = z.infer<typeof createConvenioSchema>;
