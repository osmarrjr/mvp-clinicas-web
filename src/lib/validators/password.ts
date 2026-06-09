export const PASSWORD_REQUIREMENTS_TOOLTIP =
  "Mínimo de 8 caracteres, máximo de 20, com letras, números, pelo menos uma letra maiúscula e um caractere especial (ex.: !, @, #).";

const COMMON_PASSWORDS = [
  "12345678",
  "123456789",
  "password",
  "password1!",
  "senha123",
  "qwerty123",
  "abc12345",
  "admin123",
  "clinica123",
  "1234567890",
  "87654321",
];

export type PasswordValidationContext = {
  companyName?: string;
  taxId?: string;
};

export type PasswordStrength = {
  score: number;
  label: "fraca" | "media" | "forte";
};

function hasLettersAndNumbers(password: string): boolean {
  return /[a-zA-Z]/.test(password) && /\d/.test(password);
}

function hasUppercase(password: string): boolean {
  return /[A-Z]/.test(password);
}

function hasSpecialCharacter(password: string): boolean {
  return /[^a-zA-Z0-9]/.test(password);
}

export function isCommonPassword(password: string): boolean {
  return COMMON_PASSWORDS.includes(password.toLowerCase());
}

function normalizeComparableText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

export function passwordContainsPersonalData(
  password: string,
  context: PasswordValidationContext,
): boolean {
  const normalizedPassword = normalizeComparableText(password);
  const companyName = context.companyName?.trim() ?? "";
  const taxIdDigits = (context.taxId ?? "").replace(/\D/g, "");

  if (companyName) {
    const words = companyName
      .split(/\s+/)
      .map((word) =>
        normalizeComparableText(word.replace(/[^\p{L}\p{N}]/gu, "")),
      )
      .filter((word) => word.length >= 3);

    if (words.some((word) => normalizedPassword.includes(word))) {
      return true;
    }
  }

  if (taxIdDigits.length >= 3) {
    for (let length = Math.min(taxIdDigits.length, 11); length >= 3; length -= 1) {
      for (let index = 0; index <= taxIdDigits.length - length; index += 1) {
        const substring = taxIdDigits.slice(index, index + length);
        if (normalizedPassword.includes(substring)) {
          return true;
        }
      }
    }
  }

  return false;
}

function getPasswordRuleError(
  password: string,
  context?: PasswordValidationContext,
): string | null {
  if (!password) {
    return "Senha é obrigatória.";
  }

  if (password.length < 8) {
    return "Senha deve ter no mínimo 8 dígitos";
  }

  if (!hasLettersAndNumbers(password)) {
    return "Senha deve possuir letras e números";
  }

  if (!hasUppercase(password)) {
    return "Senha deve possuir pelo menos uma letra maiúscula";
  }

  if (!hasSpecialCharacter(password)) {
    return "Senha deve possuir pelo menos um caractere especial";
  }

  if (isCommonPassword(password)) {
    return "Senha comum, escolha uma senha mais segura";
  }

  if (
    passwordContainsPersonalData(password, {
      companyName: context?.companyName,
      taxId: context?.taxId,
    })
  ) {
    return "Senha não pode conter nome, CPF e CNPJ";
  }

  return null;
}

export function getPasswordHintMessage(
  password: string,
  context?: PasswordValidationContext,
): string | null {
  return getPasswordRuleError(password, context);
}

export function getPasswordValidationError(
  password: string,
  context?: PasswordValidationContext,
): string | null {
  return getPasswordRuleError(password, context);
}

export function getPasswordStrength(password: string): PasswordStrength {
  if (password.length < 8) {
    return { score: 0, label: "fraca" };
  }

  let score = Math.min(password.length * 3, 30);

  if (/[a-z]/.test(password)) score += 6;
  if (/[A-Z]/.test(password)) score += 6;
  if (/\d/.test(password)) score += 6;
  if (/[^a-zA-Z0-9]/.test(password)) score += 6;

  if (password.length >= 12) score += 8;
  if (password.length >= 16) score += 12;

  score += Math.min(new Set(password).size * 2, 10);

  if (isCommonPassword(password)) score -= 30;
  if (/(.)\1{2,}/.test(password)) score -= 10;

  const normalizedScore = Math.max(0, Math.min(100, score));

  if (normalizedScore <= 30) {
    return { score: normalizedScore, label: "fraca" };
  }

  if (normalizedScore <= 80) {
    return { score: normalizedScore, label: "media" };
  }

  return { score: normalizedScore, label: "forte" };
}
