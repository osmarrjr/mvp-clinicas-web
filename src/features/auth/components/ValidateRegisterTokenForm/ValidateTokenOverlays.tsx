"use client";

import { GlobalModal } from "@/components/GlobalModal";
import { Loading } from "@/components/Loader/loaderView";

type ValidateTokenOverlaysProps = {
  isPending: boolean;
  isSuccess: boolean;
  errorModalOpen: boolean;
  errorMessage: string | null;
  onDismissError: () => void;
  onConfirmSuccess: () => void;
  onCancelSuccess: () => void;
};

export function ValidateTokenOverlays({
  isPending,
  isSuccess,
  errorModalOpen,
  errorMessage,
  onDismissError,
  onConfirmSuccess,
  onCancelSuccess,
}: ValidateTokenOverlaysProps) {
  return (
    <>
      <Loading isOpen={isPending} message="Validando token" />
      <GlobalModal
        type="success"
        open={isSuccess}
        modalTitle="Cadastro confirmado"
        modalSubTitle="Seu cadastro foi validado com sucesso. Agora você pode fazer login."
        showCancel={false}
        confirmLabel="Ir para login"
        onConfirm={onConfirmSuccess}
        onCancel={onCancelSuccess}
      />
      <GlobalModal
        type="error"
        open={errorModalOpen}
        modalTitle="Ops! Ocorreu um erro!"
        modalSubTitle={errorMessage ?? ""}
        showCancel={false}
        confirmLabel="Fechar"
        onConfirm={onDismissError}
        onCancel={onDismissError}
      />
    </>
  );
}
