const EMPTY_SLOT_PLACEHOLDER = "_";

export function stripRegisterTokenDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 6);
}

function hasInternalDigitGap(digits: string[]): boolean {
  let foundEmpty = false;

  for (const digit of digits) {
    if (digit === "") {
      foundEmpty = true;
      continue;
    }

    if (foundEmpty) {
      return true;
    }
  }

  return false;
}

function emptyRegisterTokenSlots(): string[] {
  return ["", "", "", "", "", ""];
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

export function splitRegisterTokenDigits(value: string): string[] {
  if (!value) {
    return emptyRegisterTokenSlots();
  }

  if (value.includes(EMPTY_SLOT_PLACEHOLDER)) {
    const slots = value.split("").slice(0, 6);

    while (slots.length < 6) {
      slots.push(EMPTY_SLOT_PLACEHOLDER);
    }

    return slots.map((character) =>
      character === EMPTY_SLOT_PLACEHOLDER
        ? ""
        : character.replace(/\D/g, "").slice(0, 1),
    );
  }

  const digits = stripRegisterTokenDigits(value);
  const slots = emptyRegisterTokenSlots();

  for (let index = 0; index < Math.min(digits.length, 6); index += 1) {
    slots[index] = digits[index] ?? "";
  }

  return slots;
}

export function joinRegisterTokenDigits(digits: string[]): string {
  const sanitized = digits.map((digit) => digit.replace(/\D/g, "").slice(0, 1));

  if (sanitized.every((digit) => digit === "")) {
    return "";
  }

  if (sanitized.every((digit) => digit !== "")) {
    return formatRegisterTokenInput(sanitized.join(""));
  }

  if (hasInternalDigitGap(sanitized)) {
    return sanitized
      .map((digit) => (digit === "" ? EMPTY_SLOT_PLACEHOLDER : digit))
      .join("");
  }

  return formatRegisterTokenInput(sanitized.join(""));
}

export function parseRegisterTokenPaste(raw: string): string {
  return formatRegisterTokenInput(raw);
}
