"use client";

import { GlobalModal } from "@/components/GlobalModal";

type StaffListOverlaysProps = {
  errorModalOpen: boolean;
  errorMessage: string | null;
  onDismissError: () => void;
};

export function StaffListOverlays({
  errorModalOpen,
  errorMessage,
  onDismissError,
}: StaffListOverlaysProps) {
  return (
    <>
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
