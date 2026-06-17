"use client";

import { useState } from "react";
import { Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { SearchableSelect } from "@/components/SearchableSelect";
import { OptionalFieldLabel } from "@/components/shared/OptionalFieldLabel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      <div className="w-full max-w">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-primary">
            Cadastrar convênio
          </h1>
          <p className="text-sm text-muted-foreground">
            Informe os dados do convênio para cadastrá-lo no sistema. Os campos
            marcados são obrigatórios e devem estar válidos para concluir o
            cadastro.
          </p>
        </header>

        <Card className="mt-6 w-full shadow-none border">
          <CardContent className="pt-6">
            <form
              className="space-y-6"
              onSubmit={form.handleSubmit(onSubmit)}
              noValidate
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do convênio</Label>
                  <Input
                    id="name"
                    placeholder="Digite o nome do convênio"
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
                  <Label htmlFor="acronym">Sigla do nome do convênio</Label>
                  <Input
                    id="acronym"
                    placeholder="Digite a sigla do convênio"
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
                      <SearchableSelect
                        id="category"
                        value={field.value}
                        onValueChange={field.onChange}
                        options={CONVENIO_CATEGORY_OPTIONS}
                        placeholder="Categoria"
                        showSearch={false}
                        aria-invalid={Boolean(form.formState.errors.category)}
                      />
                    )}
                  />
                  {form.formState.errors.category?.message ? (
                    <p className="text-sm text-destructive" role="alert">
                      {form.formState.errors.category.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <OptionalFieldLabel htmlFor="ansRegistration">
                    Registro ANS
                  </OptionalFieldLabel>
                  <Input
                    id="ansRegistration"
                    placeholder="Registro ANS"
                    inputMode="numeric"
                    aria-invalid={Boolean(
                      form.formState.errors.ansRegistration,
                    )}
                    {...form.register("ansRegistration")}
                  />
                  {form.formState.errors.ansRegistration?.message ? (
                    <p className="text-sm text-destructive" role="alert">
                      {form.formState.errors.ansRegistration.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <OptionalFieldLabel htmlFor="cardNumberMask">
                    Máscara do número da carteira
                  </OptionalFieldLabel>
                  <Input
                    id="cardNumberMask"
                    placeholder="Máscara"
                    aria-invalid={Boolean(form.formState.errors.cardNumberMask)}
                    {...form.register("cardNumberMask")}
                  />
                  {form.formState.errors.cardNumberMask?.message ? (
                    <p className="text-sm text-destructive" role="alert">
                      {form.formState.errors.cardNumberMask.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitDisabled}>
                  {isPending ? "Cadastrando..." : "Cadastrar convênio"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

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
