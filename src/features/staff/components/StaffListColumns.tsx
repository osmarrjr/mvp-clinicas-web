"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
      cell: ({ row }) => {
        const member = row.original;

        return (
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Editar usuário"
                  onClick={() => onEdit?.(member)}
                >
                  <Pencil />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="center">
                Editar usuário
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Excluir usuário"
                  onClick={() => onDelete?.(member)}
                >
                  <X />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="center">
                Excluir usuário
              </TooltipContent>
            </Tooltip>
          </div>
        );
      },
    },
  ];
}
