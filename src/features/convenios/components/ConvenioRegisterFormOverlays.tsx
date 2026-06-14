"use client";

import { GlobalModal } from "@/components/GlobalModal";
import { Loading } from "@/components/Loader/loaderView";

type ConvenioRegisterFormOverlaysProps = {
  isPending: boolean;
  errorModalOpen: boolean;
  errorMessage: string | null;
  onDismissError: () => void;
  isSuccess: boolean;
  onConfirmSuccess: () => void;
  onCancelSuccess: () => void;
};

export function ConvenioRegisterFormOverlays({
  isPending,
  errorModalOpen,
  errorMessage,
  onDismissError,
  isSuccess,
  onConfirmSuccess,
  onCancelSuccess,
}: ConvenioRegisterFormOverlaysProps) {
  return (
    <>
      <Loading isOpen={isPending} message="Cadastrando convênio" />
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
        type="success"
        open={isSuccess}
        modalTitle="Convênio cadastrado com sucesso"
        modalSubTitle="O convênio foi cadastrado e já está disponível para uso."
        showCancel={false}
        confirmLabel="Fechar"
        onConfirm={onConfirmSuccess}
        onCancel={onCancelSuccess}
      />
    </>
  );
}
