export function capitalizeFirstLetter(value: string): string {
  if (!value) return value;

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function getCompanyNameValidationError(value: string): string | null {
  if (!value.trim()) {
    return "Nome da empresa é obrigatório.";
  }

  if (value.length < 5) {
    return "Nome da empresa deve ter pelo menos 5 caracteres.";
  }

  if (value.length > 70) {
    return "Nome da empresa deve ter no máximo 70 caracteres.";
  }

  if (!/^[A-ZÀ-ÿ]/.test(value)) {
    return "Nome da empresa deve iniciar com letra maiúscula.";
  }

  return null;
}
