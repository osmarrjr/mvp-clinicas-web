export function stripRegisterTokenDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 6);
}

export function formatRegisterTokenInput(value: string): string {
  const digits = stripRegisterTokenDigits(value);

  if (digits.length <= 3) {
    return digits;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3)}`;
}

export function normalizeRegisterToken(value: string): string {
  return stripRegisterTokenDigits(value);
}
