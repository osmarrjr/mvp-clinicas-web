"use client";
import { useState } from "react";
import Link from "next/link";
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

const LOGIN_INPUT_CLASS_NAME =
  "h-12 w-full rounded-2xl border border-white/40 bg-white/95 px-4 text-base text-slate-900 shadow-sm outline-none placeholder:text-sm placeholder:text-slate-400 transition focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-300/50 aria-[invalid=true]:border-red-300 aria-[invalid=true]:ring-red-200";

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

            <p className="mt-2 text-base text-blue-100/80">
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
                className="text-base font-medium text-blue-50"
              >
                Email
              </Label>

              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seuemail@exemplo.com"
                aria-invalid={Boolean(emailError)}
                className={LOGIN_INPUT_CLASS_NAME}
                {...form.register("email")}
              />

              {emailError ? (
                <p className="text-base font-medium text-red-200" role="alert">
                  {emailError}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-base font-medium text-blue-50"
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
                  className={LOGIN_INPUT_CLASS_NAME}
                  {...form.register("password")}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500 transition hover:text-blue-700"
                  aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                >
                  {!showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {passwordError ? (
                <p className="text-base font-medium text-red-200" role="alert">
                  {passwordError}
                </p>
              ) : null}
            </div>

            {errorMessage ? (
              <Alert className="rounded-2xl border border-red-200 bg-red-200">
                <AlertDescription className="text-base text-red-500font-medium">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            ) : null}

            <Button
              type="submit"
              className="h-12 mt-2 w-full rounded-2xl bg-[linear-gradient(90deg,#1d4ed8_0%,#2563eb_45%,#0ea5e9_100%)] font-semibold tracking-wide text-white shadow-lg shadow-blue-950/30 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-blue-950/40 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-none disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:hover:scale-100"
              disabled={isSubmitDisabled}
            >
              {isPending ? "Entrando..." : "Login"}
            </Button>

            <p className="text-center text-base text-blue-100/75">
              Ainda não possui cadastro?{" "}
              <Link
                href="/register"
                className="font-semibold text-white underline-offset-4 transition hover:text-sky-200 hover:underline"
              >
                Clique aqui
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
      <Loading isOpen={isPending} message="Carregando" />
    </>
  );
}
