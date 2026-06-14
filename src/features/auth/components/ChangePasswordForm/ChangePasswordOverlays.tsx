"use client";

import { GlobalModal } from "@/components/GlobalModal";
import { Loading } from "@/components/Loader/loaderView";

type ChangePasswordOverlaysProps = {
  isPending: boolean;
  errorModalOpen: boolean;
  errorMessage: string | null;
  onDismissError: () => void;
  isSuccess: boolean;
  onConfirmSuccess: () => void;
};

export function ChangePasswordOverlays({
  isPending,
  errorModalOpen,
  errorMessage,
  onDismissError,
  isSuccess,
  onConfirmSuccess,
}: ChangePasswordOverlaysProps) {
  return (
    <>
      <Loading isOpen={isPending} message="Salvando nova senha" />
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
        modalTitle="Senha alterada com sucesso"
        modalSubTitle="Sua senha foi atualizada. Agora você pode acessar o sistema normalmente."
        showCancel={false}
        confirmLabel="Continuar"
        onConfirm={onConfirmSuccess}
        onCancel={onConfirmSuccess}
      />
    </>
  );
}
