"use client";

import { useCallback, useRef } from "react";

import { Input } from "@/components/ui/input";
import {
  joinRegisterTokenDigits,
  parseRegisterTokenPaste,
  splitRegisterTokenDigits,
} from "../../../validators/registerToken/registerToken";

const DIGIT_COUNT = 6;

type RegisterTokenDigitInputsProps = {
  value: string;
  onChange: (value: string) => void;
  inputClassName: string;
  disabled?: boolean;
  idPrefix?: string;
  ariaDescribedBy?: string;
};

function focusAfterPaste(pastedValue: string, focusInput: (index: number) => void) {
  const pastedDigits = splitRegisterTokenDigits(pastedValue);
  const filledIndices = pastedDigits
    .map((digit, index) => (digit ? index : -1))
    .filter((index) => index >= 0);

  if (filledIndices.length === DIGIT_COUNT) {
    focusInput(DIGIT_COUNT - 1);
    return;
  }

  if (filledIndices.length > 0) {
    focusInput(filledIndices[filledIndices.length - 1] ?? 0);
  }
}

export function RegisterTokenDigitInputs({
  value,
  onChange,
  inputClassName,
  disabled = false,
  idPrefix = "register-token-digit",
  ariaDescribedBy,
}: RegisterTokenDigitInputsProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = splitRegisterTokenDigits(value);

  const focusInput = useCallback((index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, DIGIT_COUNT - 1));
    inputRefs.current[clampedIndex]?.focus();
  }, []);

  function handleDigitChange(index: number, digitValue: string) {
    const sanitized = digitValue.replace(/\D/g, "");

    if (sanitized.length > 1) {
      const formatted = parseRegisterTokenPaste(sanitized);
      onChange(formatted);
      focusAfterPaste(formatted, focusInput);
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = sanitized.slice(-1);
    const formatted = joinRegisterTokenDigits(newDigits);
    onChange(formatted);

    if (sanitized && index < DIGIT_COUNT - 1) {
      focusInput(index + 1);
    }
  }

  function handleKeyDown(
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
      return;
    }

    if (event.key === "ArrowRight" && index < DIGIT_COUNT - 1) {
      event.preventDefault();
      focusInput(index + 1);
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const formatted = parseRegisterTokenPaste(
      event.clipboardData.getData("text"),
    );
    onChange(formatted);
    focusAfterPaste(formatted, focusInput);
  }

  function renderDigitInput(index: number) {
    const digitNumber = index + 1;
    const inputId = `${idPrefix}-${digitNumber}`;

    return (
      <Input
        key={inputId}
        ref={(element) => {
          inputRefs.current[index] = element;
        }}
        id={digitNumber === 1 ? inputId : undefined}
        type="text"
        inputMode="numeric"
        maxLength={1}
        autoComplete={digitNumber === 1 ? "one-time-code" : "off"}
        value={digits[index]}
        disabled={disabled}
        aria-label={`Dígito ${digitNumber} de 6`}
        aria-describedby={digitNumber === 1 ? ariaDescribedBy : undefined}
        className={inputClassName}
        onChange={(event) => handleDigitChange(index, event.target.value)}
        onKeyDown={(event) => handleKeyDown(index, event)}
        onPaste={handlePaste}
      />
    );
  }

  return (
    <div
      role="group"
      aria-labelledby="register-token-label"
      className="flex items-center justify-center gap-2"
    >
      <div className="flex items-center gap-2">
        {digits.slice(0, 3).map((_, index) => renderDigitInput(index))}
      </div>
      <span aria-hidden="true" className="text-base font-medium text-blue-50">
        -
      </span>
      <div className="flex items-center gap-2">
        {digits.slice(3, 6).map((_, index) => renderDigitInput(index + 3))}
      </div>
    </div>
  );
}
