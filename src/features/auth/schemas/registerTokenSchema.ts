import { z } from "zod";

export const registerTokenSchema = z.object({
  token: z
    .string()
    .regex(/^\d{3}-\d{3}$/, "Informe o token no formato 000-000."),
});

export type RegisterTokenFormValues = z.infer<typeof registerTokenSchema>;

export const validateRegisterTokenRequestSchema = registerTokenSchema.extend({
  email: z.string().min(1, "Email é obrigatório.").email("Email inválido."),
});

export type ValidateRegisterTokenRequest = z.infer<
  typeof validateRegisterTokenRequestSchema
>;
