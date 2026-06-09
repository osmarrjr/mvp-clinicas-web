export const PASSWORD_REQUIREMENTS_TOOLTIP =
  "Mínimo de 8 caracteres, máximo de 20, com letras, números, pelo menos uma letra maiúscula e um caractere especial (ex.: !, @, #).";

export type PasswordValidationContext = {
  companyName?: string;
  taxId?: string;
  email?: string;
};

export type PasswordStrength = {
  score: number;
  label: "fraca" | "media" | "forte";
};

const PERSONAL_DATA_ERROR =
  "Senha não pode conter Nome, CPF, CNPJ ou Email";

function hasLettersAndNumbers(password: string): boolean {
  return /[a-zA-Z]/.test(password) && /\d/.test(password);
}

function hasUppercase(password: string): boolean {
  return /[A-Z]/.test(password);
}

function hasSpecialCharacter(password: string): boolean {
  return /[^a-zA-Z0-9]/.test(password);
}

function normalizeComparableText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

function extractEmailComparableParts(email: string): string[] {
  const trimmedEmail = email.trim();

  if (!trimmedEmail.includes("@")) {
    return [];
  }

  const [localPart, ...domainParts] = trimmedEmail.split("@");
  const domain = domainParts.join("@");

  return [localPart, ...localPart.split(/[._-]/), ...domain.split(/[._-]/)]
    .map((part) =>
      normalizeComparableText(part.replace(/[^\p{L}\p{N}]/gu, "")),
    )
    .filter((part) => part.length >= 3);
}

export function passwordContainsEmailParts(
  password: string,
  email: string,
): boolean {
  const normalizedPassword = normalizeComparableText(password);
  const parts = extractEmailComparableParts(email);

  return parts.some((part) => normalizedPassword.includes(part));
}

export function passwordContainsPersonalData(
  password: string,
  context: PasswordValidationContext,
): boolean {
  const normalizedPassword = normalizeComparableText(password);
  const companyName = context.companyName?.trim() ?? "";
  const taxIdDigits = (context.taxId ?? "").replace(/\D/g, "");
  const email = context.email?.trim() ?? "";

  if (email && passwordContainsEmailParts(password, email)) {
    return true;
  }

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

function getPasswordHintRuleError(
  password: string,
  context?: PasswordValidationContext,
): string | null {
  if (!password) {
    return null;
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

  if (
    passwordContainsPersonalData(password, {
      companyName: context?.companyName,
      taxId: context?.taxId,
      email: context?.email,
    })
  ) {
    return PERSONAL_DATA_ERROR;
  }

  return null;
}

function getPasswordValidationRuleError(
  password: string,
  context?: PasswordValidationContext,
): string | null {
  if (!password) {
    return "Senha é obrigatória.";
  }

  return getPasswordHintRuleError(password, context);
}

export function getPasswordHintMessage(
  password: string,
  context?: PasswordValidationContext,
): string | null {
  return getPasswordHintRuleError(password, context);
}

export function getPasswordValidationError(
  password: string,
  context?: PasswordValidationContext,
): string | null {
  return getPasswordValidationRuleError(password, context);
}

function getStrengthLabel(score: number): PasswordStrength["label"] {
  if (score <= 30) return "fraca";
  if (score < 75) return "media";
  return "forte";
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

  if (/(.)\1{2,}/.test(password)) score -= 10;

  const normalizedScore = Math.max(0, Math.min(100, score));

  return {
    score: normalizedScore,
    label: getStrengthLabel(normalizedScore),
  };
}
