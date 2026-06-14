"use client";

import { GlobalModal } from "@/components/GlobalModal";
import { Loading } from "@/components/Loader/loaderView";

type ValidateTokenOverlaysProps = {
  isPending: boolean;
  isResendPending: boolean;
  isSuccess: boolean;
  errorModalOpen: boolean;
  resendErrorModalOpen: boolean;
  errorMessage: string | null;
  resendErrorMessage: string | null;
  onDismissError: () => void;
  onDismissResendError: () => void;
  onConfirmSuccess: () => void;
  onCancelSuccess: () => void;
};

export function ValidateTokenOverlays({
  isPending,
  isResendPending,
  isSuccess,
  errorModalOpen,
  resendErrorModalOpen,
  errorMessage,
  resendErrorMessage,
  onDismissError,
  onDismissResendError,
  onConfirmSuccess,
  onCancelSuccess,
}: ValidateTokenOverlaysProps) {
  return (
    <>
      <Loading isOpen={isPending} message="Validando token" />
      <Loading isOpen={isResendPending} message="Reenviando token" />
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
      <GlobalModal
        type="error"
        open={resendErrorModalOpen}
        modalTitle="Ops! Ocorreu um erro!"
        modalSubTitle={resendErrorMessage ?? ""}
        showCancel={false}
        confirmLabel="Fechar"
        onConfirm={onDismissResendError}
        onCancel={onDismissResendError}
      />
    </>
  );
}
