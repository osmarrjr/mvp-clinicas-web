"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { GlobalModal } from "@/components/GlobalModal";
import { Loading } from "@/components/Loader/loaderView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { formatTaxId } from "@/lib/validators/cpfCnpj";

import { SearchableSelect } from "./SearchableSelect";

import { CLINIC_PLANS } from "../constants/plans";
import { useCompanyRegister } from "../hooks/useCompanyRegister";
import { useIbgeLocations } from "../hooks/useIbgeLocations";
import {
  companyRegisterSchema,
  type CompanyRegisterFormValues,
} from "../schemas/companyRegisterSchema";

const inputClassName =
  "h-12 w-full rounded-2xl border border-white/20 bg-white/15 px-4 text-sm text-white shadow-sm outline-none placeholder:text-blue-100/50 backdrop-blur-md transition focus-visible:border-sky-300 focus-visible:ring-2 focus-visible:ring-sky-300/40 md:text-sm";

export function CompanyRegisterForm() {
  const router = useRouter();
  const {
    register: submitRegister,
    isPending,
    isSuccess,
    errorMessage,
    clearError,
  } = useCompanyRegister();

  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState("");
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const form = useForm<CompanyRegisterFormValues>({
    resolver: zodResolver(companyRegisterSchema),
    mode: "onChange",
    defaultValues: {
      companyName: "",
      taxId: "",
      stateUf: "",
      city: "",
      cityIbgeId: undefined,
      email: "",
      plan: undefined,
    },
  });

  const stateUf = form.watch("stateUf");
  const {
    states,
    cities,
    isLoadingStates,
    isLoadingCities,
    statesError,
    citiesError,
    clearStatesError,
    clearCitiesError,
  } = useIbgeLocations(stateUf);

  const loadingMessage = useMemo(() => {
    if (isPending) return "Cadastrando empresa";
    if (isLoadingCities) return "Carregando cidades";
    if (isLoadingStates) return "Carregando estados";
    return "";
  }, [isPending, isLoadingCities, isLoadingStates]);

  const isLoadingOverlay = Boolean(loadingMessage);

  useEffect(() => {
    if (statesError) {
      setErrorModalMessage(statesError);
      setErrorModalOpen(true);
    }
  }, [statesError]);

  useEffect(() => {
    if (citiesError) {
      setErrorModalMessage(citiesError);
      setErrorModalOpen(true);
    }
  }, [citiesError]);

  useEffect(() => {
    if (errorMessage) {
      setErrorModalMessage(errorMessage);
      setErrorModalOpen(true);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (isSuccess) {
      setSuccessModalOpen(true);
    }
  }, [isSuccess]);

  function handleStateChange(value: string) {
    form.setValue("stateUf", value, { shouldValidate: true });
    form.setValue("city", "", { shouldValidate: true });
    form.setValue("cityIbgeId", undefined, { shouldValidate: true });
    clearCitiesError();
  }

  const cityPlaceholder = !stateUf
    ? "Selecione a cidade"
    : isLoadingCities
      ? "Carregando cidades..."
      : "Selecione a cidade";

  function handleCityChange(cityName: string) {
    const municipality = cities.find((item) => item.nome === cityName);
    form.setValue("city", cityName, { shouldValidate: true });
    form.setValue("cityIbgeId", municipality?.id, { shouldValidate: true });
  }

  async function onSubmit(values: CompanyRegisterFormValues) {
    await submitRegister(values);
  }

  const isSubmitDisabled = !form.formState.isValid || isPending;
  const cityDisabled =
    !stateUf || isLoadingCities || (cities.length === 0 && !isLoadingCities);

  const stateOptions = useMemo(
    () =>
      states.map((state) => ({
        value: state.sigla,
        label: state.nome,
      })),
    [states],
  );

  const cityOptions = useMemo(
    () =>
      cities.map((city) => ({
        value: city.nome,
        label: city.nome,
      })),
    [cities],
  );

  const planOptions = useMemo(
    () =>
      CLINIC_PLANS.map((plan) => ({
        value: plan.value,
        label: plan.label,
      })),
    [],
  );

  return (
    <>
      <Card className="relative z-10 w-full max-w-md rounded-[32px] border border-white/20 bg-white/10 shadow-2xl shadow-blue-950/40 backdrop-blur-2xl">
        <CardHeader className="space-y-4 text-center pt-9 pb-5">
          <div className="mx-auto">
            <img
              src="/loading-logo.svg"
              alt="Logo"
              className="w-[265px] h-auto"
            />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold tracking-tight text-white">
              Cadastro de empresa
            </CardTitle>
            <p className="mt-2 text-sm text-blue-100/80">
              Preencha os dados para criar sua clínica
            </p>
          </div>
        </CardHeader>

        <CardContent className="px-7 pb-8">
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            <div className="space-y-2">
              <Label
                htmlFor="companyName"
                className="text-sm font-medium text-blue-50"
              >
                Nome da empresa
              </Label>
              <Input
                id="companyName"
                placeholder="Nome da clínica"
                aria-invalid={Boolean(form.formState.errors.companyName)}
                className={inputClassName}
                {...form.register("companyName")}
              />
              {form.formState.errors.companyName?.message ? (
                <p className="text-sm font-medium text-red-200" role="alert">
                  {form.formState.errors.companyName.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="taxId"
                className="text-sm font-medium text-blue-50"
              >
                CPF ou CNPJ
              </Label>
              <Input
                id="taxId"
                placeholder="000.000.000-00"
                aria-invalid={Boolean(form.formState.errors.taxId)}
                className={inputClassName}
                value={form.watch("taxId")}
                onChange={(event) => {
                  form.setValue("taxId", formatTaxId(event.target.value), {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
                onBlur={() => {
                  void form.trigger("taxId");
                }}
              />
              {form.formState.errors.taxId?.message ? (
                <p className="text-sm font-medium text-red-200" role="alert">
                  {form.formState.errors.taxId.message}
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-blue-50">
                  Estado
                </Label>
                <Controller
                  name="stateUf"
                  control={form.control}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value || undefined}
                      onValueChange={handleStateChange}
                      options={stateOptions}
                      placeholder="Selecione o estado"
                      searchPlaceholder="Buscar estado..."
                      disabled={isLoadingStates}
                      aria-invalid={Boolean(form.formState.errors.stateUf)}
                    />
                  )}
                />
                {form.formState.errors.stateUf?.message ? (
                  <p className="text-sm font-medium text-red-200" role="alert">
                    {form.formState.errors.stateUf.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label className="text-sm font-medium text-blue-50">
                    Cidade
                  </Label>

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
                        Este campo estará bloqueado e só será liberado após
                        selecionar um estado.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <Controller
                  name="city"
                  control={form.control}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value || undefined}
                      onValueChange={handleCityChange}
                      options={cityOptions}
                      placeholder={cityPlaceholder}
                      searchPlaceholder="Buscar cidade..."
                      disabled={cityDisabled}
                      aria-invalid={Boolean(form.formState.errors.city)}
                    />
                  )}
                />

                {form.formState.errors.city?.message ? (
                  <p className="text-sm font-medium text-red-200" role="alert">
                    {form.formState.errors.city.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-blue-50"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="contato@empresa.com"
                aria-invalid={Boolean(form.formState.errors.email)}
                className={inputClassName}
                {...form.register("email")}
              />
              {form.formState.errors.email?.message ? (
                <p className="text-sm font-medium text-red-200" role="alert">
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-blue-50">Plano</Label>
              <Controller
                name="plan"
                control={form.control}
                render={({ field }) => (
                  <SearchableSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    options={planOptions}
                    placeholder="Selecione o plano"
                    searchPlaceholder="Buscar plano..."
                    aria-invalid={Boolean(form.formState.errors.plan)}
                  />
                )}
              />
              {form.formState.errors.plan?.message ? (
                <p className="text-sm font-medium text-red-200" role="alert">
                  {form.formState.errors.plan.message}
                </p>
              ) : null}
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-2xl bg-[linear-gradient(90deg,#1e3a8a_0%,#2563eb_45%,#38bdf8_100%)] font-semibold tracking-wide text-white shadow-lg shadow-blue-950/40 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-blue-950/50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitDisabled}
            >
              {isPending ? "Cadastrando..." : "Cadastrar empresa"}
            </Button>

            <p className="text-center text-sm text-blue-100/75">
              Já possui conta?{" "}
              <Link
                href="/login"
                className="font-semibold text-white underline-offset-4 transition hover:text-sky-200 hover:underline"
              >
                Faça login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>

      <Loading
        isOpen={isLoadingOverlay}
        message={loadingMessage || "Carregando"}
      />

      <GlobalModal
        type="error"
        open={errorModalOpen}
        modalTitle="Ops! Ocorreu um erro!"
        modalSubTitle={errorModalMessage}
        showCancel={false}
        confirmLabel="Fechar"
        onConfirm={() => {
          setErrorModalOpen(false);
          clearError();
          clearStatesError();
          clearCitiesError();
        }}
        onCancel={() => {
          setErrorModalOpen(false);
          clearError();
          clearStatesError();
          clearCitiesError();
        }}
      />

      <GlobalModal
        type="success"
        open={successModalOpen}
        modalTitle="Cadastro realizado com sucesso"
        modalSubTitle="Sua empresa foi cadastrada. Faça login para continuar."
        showCancel={false}
        confirmLabel="Confirmar"
        onConfirm={() => {
          setSuccessModalOpen(false);
          router.push("/login");
        }}
        onCancel={() => setSuccessModalOpen(false)}
      />
    </>
  );
}
