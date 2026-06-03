"use client";

import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { CLINIC_PLAN_OPTIONS } from "../constants/plans";
import type { ClinicPlan } from "../types";

type PlanSelectionStepProps = {
  onSelectPlan: (plan: ClinicPlan) => void;
};

const planCardClassName =
  "flex h-full flex-col rounded-[24px] border border-white/20 bg-white/10 shadow-xl shadow-blue-950/30 backdrop-blur-2xl transition hover:border-sky-300/50 hover:bg-white/15";

export function PlanSelectionStep({ onSelectPlan }: PlanSelectionStepProps) {
  return (
    <div className="w-full max-w-5xl">
      <div className="mb-8 text-center">
        <img
          src="/loading-logo.svg"
          alt="Logo"
          className="mx-auto w-[265px] h-auto"
        />
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-white">
          Escolha seu plano
        </h1>
        <p className="mt-2 text-sm text-blue-100/80">
          Selecione o plano ideal para sua clínica antes de preencher o cadastro
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {CLINIC_PLAN_OPTIONS.map((plan) => (
          <Card key={plan.id} className={planCardClassName}>
            <CardHeader className="space-y-2 pb-2 text-center">
              <CardTitle className="text-2xl font-bold capitalize text-white">
                {plan.name}
              </CardTitle>
              <p className="text-lg font-semibold text-sky-200">
                {plan.priceLabel}
              </p>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col px-6 pb-6">
              <ul className="mb-6 flex-1 space-y-2.5 text-left text-sm text-blue-50/90">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-sky-300"
                      aria-hidden
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                type="button"
                className="h-11 w-full rounded-2xl bg-[linear-gradient(90deg,#1e3a8a_0%,#2563eb_45%,#38bdf8_100%)] font-semibold text-white shadow-lg shadow-blue-950/40 transition hover:scale-[1.01]"
                onClick={() => onSelectPlan(plan.id)}
              >
                Selecionar {plan.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-blue-100/75">
        Já possui conta?{" "}
        <a
          href="/login"
          className="font-semibold text-white underline-offset-4 transition hover:text-sky-200 hover:underline"
        >
          Faça login
        </a>
      </p>
    </div>
  );
}
