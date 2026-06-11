"use client";

import { Controller, type Control, type FieldErrors } from "react-hook-form";
import { Info } from "lucide-react";

import { SearchableSelect } from "@/components/SearchableSelect";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { CompanyRegisterFormValues } from "../../../schemas/companyRegisterSchema";

type SelectOption = {
  value: string;
  label: string;
};

type RegisterLocationFieldsProps = {
  control: Control<CompanyRegisterFormValues>;
  errors: FieldErrors<CompanyRegisterFormValues>;
  stateOptions: SelectOption[];
  cityOptions: SelectOption[];
  isLoadingStates: boolean;
  cityDisabled: boolean;
  cityPlaceholder: string;
  onStateChange: (value: string) => void;
  onCityChange: (cityName: string) => void;
};

export function RegisterLocationFields({
  control,
  errors,
  stateOptions,
  cityOptions,
  isLoadingStates,
  cityDisabled,
  cityPlaceholder,
  onStateChange,
  onCityChange,
}: RegisterLocationFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label className="text-base font-medium text-blue-50">Estado</Label>
        <Controller
          name="uf"
          control={control}
          render={({ field }) => (
            <SearchableSelect
              value={field.value || undefined}
              onValueChange={onStateChange}
              options={stateOptions}
              placeholder="Selecione o estado"
              searchPlaceholder="Buscar estado"
              disabled={isLoadingStates}
              aria-invalid={Boolean(errors.uf)}
            />
          )}
        />
        {errors.uf?.message ? (
          <p className="text-base font-medium text-red-200" role="alert">
            {errors.uf.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Label className="text-base font-medium text-blue-50">Cidade</Label>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="Informação sobre o campo cidade"
                  className="inline-flex items-center justify-center rounded-full text-blue-100/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60"
                >
                  <Info className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="center"
                className="max-w-[220px] text-center"
              >
                Este campo estará bloqueado e só será liberado após selecionar
                um estado.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Controller
          name="city"
          control={control}
          render={({ field }) => (
            <SearchableSelect
              value={field.value || undefined}
              onValueChange={onCityChange}
              options={cityOptions}
              placeholder={cityPlaceholder}
              searchPlaceholder="Buscar cidade"
              disabled={cityDisabled}
              aria-invalid={Boolean(errors.city)}
            />
          )}
        />
        {errors.city?.message ? (
          <p className="text-base font-medium text-red-200" role="alert">
            {errors.city.message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
