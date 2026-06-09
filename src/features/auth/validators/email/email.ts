export function getEmailValidationError(value: string): string | null {
  if (!value.trim()) {
    return "Email é obrigatório.";
  }

  if (value.length > 70) {
    return "Email deve ter no máximo 70 caracteres.";
  }

  if (!value.includes("@")) {
    return "Email deve conter @.";
  }

  if (value.startsWith("@") || value.endsWith("@")) {
    return "Email não pode iniciar ou terminar com @.";
  }

  if (value.includes("@@")) {
    return "Email não pode conter @@.";
  }

  if (/\s/.test(value)) {
    return "Email não pode conter espaços.";
  }

  const [localPart, ...domainParts] = value.split("@");
  const domain = domainParts.join("@");

  if (!localPart || !domain) {
    return "Email inválido.";
  }

  if (!domain.includes(".")) {
    return "Email deve conter um ponto após o @.";
  }

  return null;
}
