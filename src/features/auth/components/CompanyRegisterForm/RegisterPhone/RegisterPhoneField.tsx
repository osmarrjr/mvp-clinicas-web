"use client";

import { useRef } from "react";
import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  countDigitsBefore,
  formatPhone,
  getPhoneCursorPosition,
  resolvePhoneDigitsFromInput,
} from "../../../validators/phone/phone";

import type { CompanyRegisterFormValues } from "../../../schemas/companyRegisterSchema";

type RegisterPhoneFieldProps = {
  register: UseFormRegister<CompanyRegisterFormValues>;
  setValue: UseFormSetValue<CompanyRegisterFormValues>;
  phoneValue: string;
  errors: FieldErrors<CompanyRegisterFormValues>;
  inputClassName: string;
};

export function RegisterPhoneField({
  register,
  setValue,
  phoneValue,
  errors,
  inputClassName,
}: RegisterPhoneFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { ref: registerRef } = register("phone");
  const formattedValue = formatPhone(phoneValue);

  function mergeRef(node: HTMLInputElement | null) {
    inputRef.current = node;
    registerRef(node);
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const selectionStart = input.selectionStart ?? 0;
    const digitsBeforeCursor = countDigitsBefore(input.value, selectionStart);
    const nextDigits = resolvePhoneDigitsFromInput(
      phoneValue,
      input.value,
      selectionStart,
    );

    setValue("phone", nextDigits, {
      shouldValidate: true,
      shouldDirty: true,
    });

    requestAnimationFrame(() => {
      const target = inputRef.current;
      if (!target) return;

      const formatted = formatPhone(nextDigits);
      const nextCursor = getPhoneCursorPosition(formatted, digitsBeforeCursor);
      target.setSelectionRange(nextCursor, nextCursor);
    });
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="phone" className="text-base font-medium text-blue-50">
        Telefone
      </Label>
      <Input
        id="phone"
        type="tel"
        autoComplete="tel"
        placeholder="(00) 00000-0000"
        maxLength={15}
        aria-invalid={Boolean(errors.phone)}
        className={inputClassName}
        ref={mergeRef}
        value={formattedValue}
        onChange={handleChange}
      />
      {errors.phone?.message ? (
        <p className="text-base font-medium text-red-200" role="alert">
          {errors.phone.message}
        </p>
      ) : null}
    </div>
  );
}
