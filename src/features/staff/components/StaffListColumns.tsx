"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, X } from "lucide-react";

import { TableIconAction } from "@/components/Table/TableIconAction";
import { tableActionsColumnMeta } from "@/components/Table/tableColumnMeta";

import { getStaffRoleLabel } from "../constants/roleLabels";
import type { StaffMember } from "../types";

type StaffListColumnsOptions = {
  onEdit?: (member: StaffMember) => void;
  onDelete?: (member: StaffMember) => void;
};

export function getStaffListColumns({
  onEdit,
  onDelete,
}: StaffListColumnsOptions = {}): ColumnDef<StaffMember>[] {
  return [
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
    {
      id: "actions",
      header: "Ações",
      enableSorting: false,
      meta: tableActionsColumnMeta,
      cell: ({ row }) => {
        const member = row.original;

        return (
          <div className="flex items-center gap-1">
            <TableIconAction
              label="Editar usuário"
              tooltip="Editar usuário"
              onClick={() => onEdit?.(member)}
            >
              <Pencil />
            </TableIconAction>

            <TableIconAction
              label="Excluir usuário"
              tooltip="Excluir usuário"
              onClick={() => onDelete?.(member)}
            >
              <X />
            </TableIconAction>
          </div>
        );
      },
    },
  ];
}
