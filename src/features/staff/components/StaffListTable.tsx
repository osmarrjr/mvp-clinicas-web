"use client";

import { useMemo } from "react";

import DataTable from "@/components/Table";

import type { StaffMember } from "../types";
import { getStaffListColumns } from "./StaffListColumns";

type StaffListTableProps = {
  data: StaffMember[];
  isLoading: boolean;
  onEdit?: (member: StaffMember) => void;
  onDelete?: (member: StaffMember) => void;
};

export function StaffListTable({
  data,
  isLoading,
  onEdit,
  onDelete,
}: StaffListTableProps) {
  const columns = useMemo(
    () => getStaffListColumns({ onEdit, onDelete }),
    [onEdit, onDelete],
  );

  return (
    <DataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      noResults="Nenhum usuário cadastrado."
      tableClassName="mt-0"
    />
  );
}
