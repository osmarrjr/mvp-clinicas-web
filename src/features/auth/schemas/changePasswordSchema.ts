import { z } from "zod";

import { getPasswordValidationError } from "../validators/password/password";

export const changePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .max(20, "Senha deve ter no máximo 20 caracteres."),
    confirmPassword: z.string(),
  })
  .superRefine((values, ctx) => {
    const passwordError = getPasswordValidationError(values.newPassword, {});

    if (passwordError) {
      ctx.addIssue({
        code: "custom",
        message: passwordError,
        path: ["newPassword"],
      });
    }

    if (values.newPassword !== values.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "As senhas não coincidem.",
        path: ["confirmPassword"],
      });
    }
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export const changePasswordRequestSchema = z.object({
  newPassword: z.string().min(8).max(20),
});

export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>;
