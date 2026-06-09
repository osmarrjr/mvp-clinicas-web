export const VALID_BRAZILIAN_DDDS = [
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "21",
  "22",
  "24",
  "27",
  "28",
  "31",
  "32",
  "33",
  "34",
  "35",
  "37",
  "38",
  "41",
  "42",
  "43",
  "44",
  "45",
  "46",
  "47",
  "48",
  "49",
  "51",
  "53",
  "54",
  "55",
  "61",
  "62",
  "63",
  "64",
  "65",
  "66",
  "67",
  "68",
  "69",
  "71",
  "73",
  "74",
  "75",
  "77",
  "79",
  "81",
  "82",
  "83",
  "84",
  "85",
  "86",
  "87",
  "88",
  "89",
  "91",
  "92",
  "93",
  "94",
  "95",
  "96",
  "97",
  "98",
  "99",
] as const;

export function stripPhoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatPhone(value: string): string {
  const digits = stripPhoneDigits(value).slice(0, 11);

  if (digits.length <= 2) {
    return digits.length ? `(${digits}` : "";
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function countDigitsBefore(
  value: string,
  cursorPosition: number,
): number {
  let count = 0;

  for (let index = 0; index < cursorPosition && index < value.length; index += 1) {
    if (/\d/.test(value[index] ?? "")) {
      count += 1;
    }
  }

  return count;
}

export function resolvePhoneDigitsFromInput(
  previousDigits: string,
  inputValue: string,
  cursorPosition: number,
): string {
  const inputDigits = stripPhoneDigits(inputValue);
  const maxLength = 11;

  if (inputDigits.length < previousDigits.length) {
    const digitIndex = countDigitsBefore(inputValue, cursorPosition);
    const removedCount = previousDigits.length - inputDigits.length;

    return (
      previousDigits.slice(0, digitIndex) +
      previousDigits.slice(digitIndex + removedCount)
    ).slice(0, maxLength);
  }

  return inputDigits.slice(0, maxLength);
}

export function getPhoneCursorPosition(
  formattedValue: string,
  digitsBeforeCursor: number,
): number {
  if (digitsBeforeCursor <= 0) {
    return 0;
  }

  let count = 0;

  for (let index = 0; index < formattedValue.length; index += 1) {
    if (/\d/.test(formattedValue[index] ?? "")) {
      count += 1;

      if (count === digitsBeforeCursor) {
        return index + 1;
      }
    }
  }

  return formattedValue.length;
}

export function isValidBrazilianDdd(ddd: string): boolean {
  return VALID_BRAZILIAN_DDDS.includes(
    ddd as (typeof VALID_BRAZILIAN_DDDS)[number],
  );
}

export function getPhoneValidationError(value: string): string | null {
  const digits = stripPhoneDigits(value);

  if (!digits) {
    return "Telefone é obrigatório.";
  }

  if (digits.length !== 10 && digits.length !== 11) {
    return "Telefone deve conter 10 ou 11 dígitos.";
  }

  const ddd = digits.slice(0, 2);

  if (!isValidBrazilianDdd(ddd)) {
    return "DDD inválido.";
  }

  if (digits.length === 11 && digits.charAt(2) !== "9") {
    return "Celular deve iniciar com 9 após o DDD.";
  }

  return null;
}
