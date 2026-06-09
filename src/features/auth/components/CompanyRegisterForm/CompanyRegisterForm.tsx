"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPasswordValidationError } from "../../validators/password/password";
import { PlanSelectionStep } from "../PlanSelectionStep";
import { CLINIC_PLAN_OPTIONS } from "../../constants/plans";
import { useCompanyRegister } from "../../hooks/useCompanyRegister";
import { useIbgeLocations } from "../../hooks/useIbgeLocations";
import {
  companyRegisterSchema,
  type CompanyRegisterFormValues,
} from "../../schemas/companyRegisterSchema";
import type { ClinicPlan } from "../../types";

import { REGISTER_INPUT_CLASS_NAME } from "./constants";
import { RegisterCompanyNameField } from "./RegisterCompanyNameField/RegisterCompanyNameField";
import { RegisterEmailField } from "./RegisterEmailField/RegisterEmailField";
import { RegisterFormHeader } from "./RegisterFormHeader";
import { RegisterFormOverlays } from "./RegisterFormOverlays/RegisterFormOverlays";
import { RegisterLocationFields } from "./RegisterLocationFields/RegisterLocationFields";
import { RegisterConfirmPasswordField } from "./RegisterPassword/RegisterConfirmPasswordField";
import { RegisterPasswordField } from "./RegisterPassword/RegisterPasswordField";
import { RegisterPhoneField } from "./RegisterPhone/RegisterPhoneField";
import { RegisterTaxIdField } from "./RegisterTaxIdField/RegisterTaxIdField";
import { SelectedPlanSummary } from "./SelectedPlanSummary";

type RegisterStep = "plan" | "form";

export function CompanyRegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<RegisterStep>("plan");
  const [dismissedError, setDismissedError] = useState<string | null>(null);

  const {
    register: submitRegister,
    isPending,
    isSuccess,
    errorMessage,
    clearError,
    resetSuccess,
  } = useCompanyRegister();

  const form = useForm<CompanyRegisterFormValues>({
    resolver: zodResolver(companyRegisterSchema),
    mode: "onChange",
    defaultValues: {
      companyName: "",
      taxId: "",
      uf: "",
      city: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      plan: undefined,
    },
  });

  const selectedPlan = form.watch("plan");
  const companyName = form.watch("companyName");
  const taxId = form.watch("taxId");
  const phoneValue = form.watch("phone");
  const emailValue = form.watch("email");
  const passwordValue = form.watch("password");
  const confirmPasswordValue = form.watch("confirmPassword");
  const uf = form.watch("uf");

  const passwordContext = useMemo(
    () => ({ companyName, taxId, email: emailValue }),
    [companyName, taxId, emailValue],
  );

  const isPasswordValid = useMemo(
    () => getPasswordValidationError(passwordValue, passwordContext) === null,
    [passwordValue, passwordContext],
  );

  const selectedPlanDetails = useMemo(
    () => CLINIC_PLAN_OPTIONS.find((plan) => plan.id === selectedPlan),
    [selectedPlan],
  );

  const {
    states,
    cities,
    isLoadingStates,
    isLoadingCities,
    statesError,
    citiesError,
  } = useIbgeLocations(uf);

  const activeError = errorMessage ?? statesError ?? citiesError;
  const errorModalOpen = Boolean(activeError) && activeError !== dismissedError;

  const loadingMessage = useMemo(() => {
    if (isPending) return "Cadastrando empresa";
    if (isLoadingCities) return "Carregando cidades";
    if (isLoadingStates) return "Carregando estados";
    return "";
  }, [isPending, isLoadingCities, isLoadingStates]);

  const isLoadingOverlay = step === "form" && Boolean(loadingMessage);
  const isSubmitDisabled = !form.formState.isValid || isPending;
  const cityDisabled =
    !uf || isLoadingCities || (cities.length === 0 && !isLoadingCities);

  const cityPlaceholder = !uf
    ? "Selecione a cidade"
    : isLoadingCities
      ? "Carregando cidades..."
      : "Selecione a cidade";

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

  function handleSelectPlan(plan: ClinicPlan) {
    form.setValue("plan", plan, { shouldValidate: true, shouldDirty: true });
    setStep("form");
  }

  function handleChangePlan() {
    setStep("plan");
  }

  function handleStateChange(value: string) {
    form.setValue("uf", value, { shouldValidate: true });
    form.setValue("city", "", { shouldValidate: true });
  }

  function handleCityChange(cityName: string) {
    form.setValue("city", cityName, { shouldValidate: true });
  }

  function handleDismissError() {
    setDismissedError(activeError);
    clearError();
  }

  function handleConfirmSuccess() {
    resetSuccess();
    router.push("/login");
  }

  async function onSubmit(values: CompanyRegisterFormValues) {
    setDismissedError(null);
    await submitRegister(values);
  }

  if (step === "plan") {
    return <PlanSelectionStep onSelectPlan={handleSelectPlan} />;
  }

  return (
    <>
      <Card className="relative z-10 w-full max-w-md rounded-[32px] border border-white/20 bg-white/10 shadow-2xl shadow-blue-950/40 backdrop-blur-2xl">
        <RegisterFormHeader />

        <CardContent className="px-7 pb-8">
          {selectedPlanDetails ? (
            <SelectedPlanSummary
              planName={selectedPlanDetails.name}
              priceLabel={selectedPlanDetails.priceLabel}
              onChangePlan={handleChangePlan}
            />
          ) : null}

          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            <input type="hidden" {...form.register("plan")} />

            <RegisterCompanyNameField
              register={form.register}
              setValue={form.setValue}
              errors={form.formState.errors}
              inputClassName={REGISTER_INPUT_CLASS_NAME}
            />

            <RegisterTaxIdField
              taxIdValue={taxId}
              setValue={form.setValue}
              trigger={form.trigger}
              errors={form.formState.errors}
              inputClassName={REGISTER_INPUT_CLASS_NAME}
            />

            <RegisterLocationFields
              control={form.control}
              errors={form.formState.errors}
              stateOptions={stateOptions}
              cityOptions={cityOptions}
              isLoadingStates={isLoadingStates}
              cityDisabled={cityDisabled}
              cityPlaceholder={cityPlaceholder}
              onStateChange={handleStateChange}
              onCityChange={handleCityChange}
            />

            <RegisterEmailField
              register={form.register}
              errors={form.formState.errors}
              inputClassName={REGISTER_INPUT_CLASS_NAME}
            />

            <RegisterPhoneField
              register={form.register}
              setValue={form.setValue}
              phoneValue={phoneValue}
              errors={form.formState.errors}
              inputClassName={REGISTER_INPUT_CLASS_NAME}
            />

            <RegisterPasswordField
              form={form}
              companyName={companyName}
              taxId={taxId}
              email={emailValue}
              inputClassName={REGISTER_INPUT_CLASS_NAME}
            />

            <RegisterConfirmPasswordField
              form={form}
              passwordValue={passwordValue}
              confirmPasswordValue={confirmPasswordValue}
              isPasswordValid={isPasswordValid}
              inputClassName={REGISTER_INPUT_CLASS_NAME}
            />

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

      <RegisterFormOverlays
        isLoadingOverlay={isLoadingOverlay}
        loadingMessage={loadingMessage}
        errorModalOpen={errorModalOpen}
        activeError={activeError}
        onDismissError={handleDismissError}
        isSuccess={isSuccess}
        onConfirmSuccess={handleConfirmSuccess}
        onCancelSuccess={resetSuccess}
      />
    </>
  );
}
