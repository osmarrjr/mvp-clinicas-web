import { CardHeader, CardTitle } from "@/components/ui/card";

export function RegisterFormHeader() {
  return (
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
  );
}
