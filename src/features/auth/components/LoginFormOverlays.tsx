"use client";

import { GlobalModal } from "@/components/GlobalModal";
import { Loading } from "@/components/Loader/loaderView";

type LoginFormOverlaysProps = {
  isPending: boolean;
  errorModalOpen: boolean;
  errorMessage: string | null;
  onDismissError: () => void;
  passwordChangeRequired: boolean;
  onConfirmPasswordChange: () => void;
};

export function LoginFormOverlays({
  isPending,
  errorModalOpen,
  errorMessage,
  onDismissError,
  passwordChangeRequired,
  onConfirmPasswordChange,
}: LoginFormOverlaysProps) {
  return (
    <>
      <Loading isOpen={isPending} message="Carregando" />
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
        type="warning"
        open={passwordChangeRequired}
        modalTitle="Alteração de senha necessária"
        modalSubTitle="Este é seu primeiro acesso. Por segurança, você precisa definir uma nova senha antes de continuar."
        showCancel={false}
        confirmLabel="Alterar senha"
        onConfirm={onConfirmPasswordChange}
        onCancel={onConfirmPasswordChange}
      />
    </>
  );
}
