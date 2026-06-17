"use client";

import { useStaffList } from "../hooks/useStaffList";
import { StaffListOverlays } from "./StaffListOverlays";
import { StaffListTable } from "./StaffListTable";

export function StaffListPageContent() {
  const { staff, isLoading, errorMessage, clearError } = useStaffList();

  function handleDismissError() {
    clearError();
  }

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold text-primary">Usuários</h1>
        <p className="mt-2 text-muted-foreground">
          Membros da equipe cadastrados na clínica.
        </p>
      </div>
      <StaffListTable data={staff} isLoading={isLoading} />
      <StaffListOverlays
        isLoading={isLoading}
        errorModalOpen={Boolean(errorMessage)}
        errorMessage={errorMessage}
        onDismissError={handleDismissError}
      />
    </>
  );
}
