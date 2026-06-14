export const GENERIC_ERROR_MESSAGE =
  "Ocorreu um erro inesperado. Tente novamente.";

export function getErrorMessage(message?: string | null): string {
  const trimmed = message?.trim();
  return trimmed || GENERIC_ERROR_MESSAGE;
}
