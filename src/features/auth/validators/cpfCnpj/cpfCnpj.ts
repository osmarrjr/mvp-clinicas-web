export type TaxIdType = "cpf" | "cnpj";

const CNPJ_FIRST_DIGIT_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const CNPJ_SECOND_DIGIT_WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

export function stripDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function stripAlphanumeric(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

export function detectTaxIdType(value: string): TaxIdType | null {
  const normalized = stripAlphanumeric(value);

  if (!normalized) return null;

  const hasLetters = /[A-Z]/.test(normalized);

  if (hasLetters) return "cnpj";
  if (normalized.length <= 11) return "cpf";

  return "cnpj";
}

export function formatCpf(value: string): string {
  const digits = stripDigits(value).slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(
    6,
    9,
  )}-${digits.slice(9)}`;
}

export function formatCnpj(value: string): string {
  const cnpj = stripAlphanumeric(value).slice(0, 14);

  if (cnpj.length <= 2) return cnpj;
  if (cnpj.length <= 5) return `${cnpj.slice(0, 2)}.${cnpj.slice(2)}`;
  if (cnpj.length <= 8) {
    return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5)}`;
  }
  if (cnpj.length <= 12) {
    return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(
      5,
      8,
    )}/${cnpj.slice(8)}`;
  }

  return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(
    5,
    8,
  )}/${cnpj.slice(8, 12)}-${cnpj.slice(12)}`;
}

export function formatTaxId(value: string): string {
  const normalized = stripAlphanumeric(value);

  if (!normalized) return "";

  const hasLetters = /[A-Z]/.test(normalized);

  if (hasLetters || normalized.length > 11) {
    return formatCnpj(normalized);
  }

  return formatCpf(normalized);
}

function isRepeatedDigits(digits: string): boolean {
  return /^(\d)\1+$/.test(digits);
}

function calcCpfCheckDigit(digits: string, factor: number): number {
  let sum = 0;

  for (let i = 0; i < digits.length; i += 1) {
    sum += Number(digits[i]) * (factor - i);
  }

  const remainder = sum % 11;

  return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCpf(value: string): boolean {
  const digits = stripDigits(value);

  if (digits.length !== 11) return false;
  if (isRepeatedDigits(digits)) return false;

  const base = digits.slice(0, 9);

  const first = calcCpfCheckDigit(base, 10);
  const second = calcCpfCheckDigit(`${base}${first}`, 11);

  return digits === `${base}${first}${second}`;
}

function getCnpjCharValue(char: string): number {
  return char.charCodeAt(0) - 48;
}

function calcCnpjCheckDigit(value: string, weights: number[]): number {
  let sum = 0;

  for (let i = 0; i < weights.length; i += 1) {
    sum += getCnpjCharValue(value[i]) * weights[i];
  }

  const remainder = sum % 11;

  return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCnpj(value: string): boolean {
  const cnpj = stripAlphanumeric(value);

  if (cnpj.length !== 14) return false;

  if (!/^[A-Z0-9]{12}\d{2}$/.test(cnpj)) return false;

  if (/^\d{14}$/.test(cnpj) && isRepeatedDigits(cnpj)) return false;

  const base = cnpj.slice(0, 12);

  const first = calcCnpjCheckDigit(base, CNPJ_FIRST_DIGIT_WEIGHTS);
  const second = calcCnpjCheckDigit(
    `${base}${first}`,
    CNPJ_SECOND_DIGIT_WEIGHTS,
  );

  return cnpj === `${base}${first}${second}`;
}

export function isValidTaxId(value: string): boolean {
  const normalized = stripAlphanumeric(value);

  if (/^\d{11}$/.test(normalized)) {
    return isValidCpf(normalized);
  }

  if (/^[A-Z0-9]{12}\d{2}$/.test(normalized)) {
    return isValidCnpj(normalized);
  }

  return false;
}
