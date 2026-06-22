"use client";

import { FeaturePageLayout } from "@/components/layout/FeaturePageLayout";

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
      <FeaturePageLayout
        title="Usuários"
        description="Membros da equipe cadastrados na clínica."
      >
        <StaffListTable data={staff} isLoading={isLoading} />
      </FeaturePageLayout>
      <StaffListOverlays
        errorModalOpen={Boolean(errorMessage)}
        errorMessage={errorMessage}
        onDismissError={handleDismissError}
      />
    </>
  );
}
