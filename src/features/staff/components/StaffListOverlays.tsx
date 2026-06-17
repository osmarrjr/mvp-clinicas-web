"use client";

import { GlobalModal } from "@/components/GlobalModal";
import { Loading } from "@/components/Loader/loaderView";

type StaffListOverlaysProps = {
  isLoading: boolean;
  errorModalOpen: boolean;
  errorMessage: string | null;
  onDismissError: () => void;
};

export function StaffListOverlays({
  isLoading,
  errorModalOpen,
  errorMessage,
  onDismissError,
}: StaffListOverlaysProps) {
  return (
    <>
      <Loading isOpen={isLoading} message="Carregando usuários" />
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
