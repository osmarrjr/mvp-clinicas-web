export const PASSWORD_REQUIREMENTS_TOOLTIP =
  "Mínimo de 8 caracteres, com letras, números e um caractere especial (ex.: !, @, #).";

export function getPasswordValidationError(password: string): string | null {
  if (!password) {
    return "Senha é obrigatória.";
  }

  if (password.length < 8) {
    return "A senha deve ter no mínimo 8 caracteres.";
  }

  if (!/[a-zA-Z]/.test(password)) {
    return "A senha deve conter letras.";
  }

  if (!/\d/.test(password)) {
    return "A senha deve conter números.";
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    return "A senha deve conter pelo menos um caractere especial.";
  }

  return null;
}
