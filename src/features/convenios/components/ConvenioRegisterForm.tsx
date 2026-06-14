"use client";

import { useState } from "react";
import { Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CONVENIO_CATEGORY_OPTIONS } from "../constants/categories";
import { useCreateConvenio } from "../hooks/useCreateConvenio";
import {
  createConvenioSchema,
  type CreateConvenioFormValues,
} from "../schemas/createConvenioSchema";
import { ConvenioRegisterFormOverlays } from "./ConvenioRegisterFormOverlays";

export function ConvenioRegisterForm() {
  const [dismissedError, setDismissedError] = useState<string | null>(null);

  const {
    create,
    isPending,
    isSuccess,
    errorMessage,
    clearError,
    resetSuccess,
  } = useCreateConvenio();

  const form = useForm<CreateConvenioFormValues>({
    resolver: zodResolver(createConvenioSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      acronym: "",
      category: undefined,
      ansRegistration: "",
      cardNumberMask: "",
    },
  });

  const errorModalOpen =
    Boolean(errorMessage) && errorMessage !== dismissedError;
  const isSubmitDisabled = !form.formState.isValid || isPending;

  function handleDismissError() {
    setDismissedError(errorMessage);
    clearError();
  }

  function handleConfirmSuccess() {
    form.reset();
    resetSuccess();
  }

  async function onSubmit(values: CreateConvenioFormValues) {
    setDismissedError(null);
    await create(values);
  }

  return (
    <>
      <Card className="w-full max-w-2xl bg-sidebar/50 shadow-none border-t-0">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-foreground">
            Cadastrar convênio
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form
            className="space-y-5"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Ex.: Unimed Nacional"
                aria-invalid={Boolean(form.formState.errors.name)}
                {...form.register("name")}
              />
              {form.formState.errors.name?.message ? (
                <p className="text-sm text-destructive" role="alert">
                  {form.formState.errors.name.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="acronym">Sigla</Label>
              <Input
                id="acronym"
                placeholder="Ex.: UNIMED"
                aria-invalid={Boolean(form.formState.errors.acronym)}
                {...form.register("acronym")}
              />
              {form.formState.errors.acronym?.message ? (
                <p className="text-sm text-destructive" role="alert">
                  {form.formState.errors.acronym.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Controller
                name="category"
                control={form.control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="category"
                      className="w-full"
                      aria-invalid={Boolean(form.formState.errors.category)}
                    >
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONVENIO_CATEGORY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.category?.message ? (
                <p className="text-sm text-destructive" role="alert">
                  {form.formState.errors.category.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ansRegistration">Registro ANS</Label>
              <Input
                id="ansRegistration"
                placeholder="000000"
                inputMode="numeric"
                aria-invalid={Boolean(form.formState.errors.ansRegistration)}
                {...form.register("ansRegistration")}
              />
              {form.formState.errors.ansRegistration?.message ? (
                <p className="text-sm text-destructive" role="alert">
                  {form.formState.errors.ansRegistration.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNumberMask">Máscara do cartão</Label>
              <Input
                id="cardNumberMask"
                placeholder="0000.0000.000000-0"
                aria-invalid={Boolean(form.formState.errors.cardNumberMask)}
                {...form.register("cardNumberMask")}
              />
              {form.formState.errors.cardNumberMask?.message ? (
                <p className="text-sm text-destructive" role="alert">
                  {form.formState.errors.cardNumberMask.message}
                </p>
              ) : null}
            </div>

            <Button type="submit" disabled={isSubmitDisabled}>
              {isPending ? "Cadastrando..." : "Cadastrar convênio"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <ConvenioRegisterFormOverlays
        isPending={isPending}
        errorModalOpen={errorModalOpen}
        errorMessage={errorMessage}
        onDismissError={handleDismissError}
        isSuccess={isSuccess}
        onConfirmSuccess={handleConfirmSuccess}
        onCancelSuccess={resetSuccess}
      />
    </>
  );
}
