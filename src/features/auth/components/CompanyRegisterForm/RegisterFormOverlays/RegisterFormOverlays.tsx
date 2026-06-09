"use client";

import { GlobalModal } from "@/components/GlobalModal";
import { Loading } from "@/components/Loader/loaderView";

type RegisterFormOverlaysProps = {
  isLoadingOverlay: boolean;
  loadingMessage: string;
  errorModalOpen: boolean;
  activeError: string | null;
  onDismissError: () => void;
  isSuccess: boolean;
  onConfirmSuccess: () => void;
  onCancelSuccess: () => void;
};

export function RegisterFormOverlays({
  isLoadingOverlay,
  loadingMessage,
  errorModalOpen,
  activeError,
  onDismissError,
  isSuccess,
  onConfirmSuccess,
  onCancelSuccess,
}: RegisterFormOverlaysProps) {
  return (
    <>
      <Loading
        isOpen={isLoadingOverlay}
        message={loadingMessage || "Carregando"}
      />
      <GlobalModal
        type="error"
        open={errorModalOpen}
        modalTitle="Ops! Ocorreu um erro!"
        modalSubTitle={activeError ?? ""}
        showCancel={false}
        confirmLabel="Fechar"
        onConfirm={onDismissError}
        onCancel={onDismissError}
      />
      <GlobalModal
        type="success"
        open={isSuccess}
        modalTitle="Cadastro realizado com sucesso"
        modalSubTitle="Sua empresa foi cadastrada. Faça login para continuar."
        showCancel={false}
        confirmLabel="Confirmar"
        onConfirm={onConfirmSuccess}
        onCancel={onCancelSuccess}
      />
    </>
  );
}
