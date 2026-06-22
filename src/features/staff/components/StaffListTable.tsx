"use client";

import type { ColumnDef } from "@tanstack/react-table";

import DataTable from "@/components/Table";

import { getStaffRoleLabel } from "../constants/roleLabels";
import type { StaffMember } from "../types";

const columns: ColumnDef<StaffMember>[] = [
  {
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "email",
    header: "E-mail",
  },
  {
    accessorKey: "phone",
    header: "Telefone",
    meta: {
      showDashWhenEmpty: true,
    },
  },
  {
    accessorKey: "role",
    header: "Perfil",
    cell: ({ row }) => getStaffRoleLabel(row.original.role),
  },
];

type StaffListTableProps = {
  data: StaffMember[];
  isLoading: boolean;
};

export function StaffListTable({ data, isLoading }: StaffListTableProps) {
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
