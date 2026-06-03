"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useLogin } from "../hooks/useLogin";
import { loginSchema, type LoginFormValues } from "../schemas/loginSchema";
import { Loading } from "@/components/Loader/loaderView";

export function LoginForm() {
  const { login, isPending, errorMessage } = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    await login(values);
  }

  const emailError = form.formState.errors.email?.message;
  const passwordError = form.formState.errors.password?.message;
  const isSubmitDisabled = !form.formState.isValid || isPending;

  return (
    <>
      <div className="min-h-screen w-full flex items-center justify-center px-4 bg-[radial-gradient(circle_at_top,#1d4ed8_0%,#0f172a_35%,#1e3a8a_65%,#60a5fa_100%)]">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-500/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-sky-300/30 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

        <Card className="relative z-10 w-full max-w-md rounded-[32px] border border-white/20 bg-white/10 shadow-2xl shadow-blue-950/40 backdrop-blur-2xl">
          <CardHeader className="space-y-4 text-center pt-9 pb-5">
            <div className="mx-auto">
              <img
                src="/loading-logo.svg"
                alt="Loading"
                className="w-[265px] h-auto"
              />
            </div>

            <div>
              <CardTitle className="text-3xl font-bold tracking-tight text-white">
                Bem-vindo
              </CardTitle>

              <p className="mt-2 text-sm text-blue-100/80">
                Acesse sua conta para continuar
              </p>
            </div>
          </CardHeader>

          <CardContent className="px-7 pb-8">
            <form
              className="space-y-5"
              onSubmit={form.handleSubmit(onSubmit)}
              noValidate
            >
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
                  placeholder="seuemail@exemplo.com"
                  aria-invalid={Boolean(emailError)}
                  className="h-12 rounded-2xl border border-white/20 bg-white/15 px-4 text-white shadow-sm outline-none placeholder:text-blue-100/50 backdrop-blur-md transition focus-visible:border-sky-300 focus-visible:ring-2 focus-visible:ring-sky-300/40"
                  {...form.register("email")}
                />

                {emailError ? (
                  <p className="text-sm font-medium text-red-200" role="alert">
                    {emailError}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-blue-50"
                >
                  Senha
                </Label>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Digite sua senha"
                    aria-invalid={Boolean(passwordError)}
                    className="h-12 rounded-2xl border border-white/20 bg-white/15 px-4 pr-12 text-white shadow-sm outline-none placeholder:text-blue-100/50 backdrop-blur-md transition focus-visible:border-sky-300 focus-visible:ring-2 focus-visible:ring-sky-300/40"
                    {...form.register("password")}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-100/70 transition hover:text-white cursor-pointer"
                    aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {passwordError ? (
                  <p className="text-sm font-medium text-red-200" role="alert">
                    {passwordError}
                  </p>
                ) : null}
              </div>

              {errorMessage ? (
                <Alert className="rounded-2xl border border-red-200 bg-red-200">
                  <AlertDescription className="text-sm text-red-500font-medium">
                    {errorMessage}
                  </AlertDescription>
                </Alert>
              ) : null}

              <Button
                type="submit"
                className="h-12 w-full rounded-2xl bg-[linear-gradient(90deg,#1e3a8a_0%,#2563eb_45%,#38bdf8_100%)] font-semibold tracking-wide text-white shadow-lg shadow-blue-950/40 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-blue-950/50 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitDisabled}
              >
                {isPending ? "Entrando..." : "Login"}
              </Button>

              <p className="text-center text-sm text-blue-100/75">
                Ainda não possui cadastro?{" "}
                <button
                  type="button"
                  className="font-semibold text-white underline-offset-4 transition hover:text-sky-200 hover:underline cursor-pointer"
                >
                  Clique aqui
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
      <Loading isOpen={isPending} message="Carregando" />
    </>
  );
}
