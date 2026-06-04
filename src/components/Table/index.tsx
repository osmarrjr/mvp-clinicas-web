"use client";

import { Dispatch, SetStateAction, useEffect, ReactNode } from "react";
import {
  ColumnDef,
  PaginationState,
  Row,
  RowData,
  SortingState,
  RowSelectionState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "./pagination";
import SortIcon from "./header-sort-icon";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    showDashWhenEmpty?: boolean;
    allowDashInExpanded?: boolean;
  }
}

interface DataTableProps<T extends RowData> {
  data: T[];
  columns: ColumnDef<T>[];
  rowCount?: number;

  pagination?: PaginationState;
  setPagination?: Dispatch<SetStateAction<PaginationState>>;

  sorting?: SortingState;
  setSorting?: Dispatch<SetStateAction<SortingState>>;

  rowSelection?: RowSelectionState;
  setRowSelection?: Dispatch<SetStateAction<RowSelectionState>>;

  getRowId?: (row: T) => string;

  noResults?: string | ReactNode;
  isLoading?: boolean;

  centralizeInformation?: boolean;
  rowSize?: RowSize;

  onRowSelectionChange?: (rows: T[]) => void;

  tableClassName?: string;
  headerClassName?: string;
  rowClassName?: string | ((row: Row<T>) => string);
}

type RowWithId = RowData & { id?: string | number };
type RowWithSubRecords<T extends RowData> = T & { subRecords?: T[] };

type RowSize = "sm" | "md" | "lg";

const rowSizeClasses: Record<RowSize, string> = {
  sm: "py-1",
  md: "py-2",
  lg: "py-4",
};

export default function DataTable<T extends RowData>({
  data,
  rowCount,
  columns,
  sorting,
  setSorting,
  pagination,
  setPagination,
  rowSelection,
  setRowSelection,
  isLoading,
  rowSize = "md",
  centralizeInformation = false,
  noResults = "Nenhum registro localizado.",
  onRowSelectionChange,
  tableClassName,
  headerClassName,
  rowClassName,
  getRowId,
}: Readonly<DataTableProps<T>>) {
  const hasPagination = pagination !== undefined && setPagination !== undefined;
  const effectiveRowCount = rowCount ?? data.length;

  const cellPaddingClass = rowSizeClasses[rowSize];
  const shouldShowPagination = hasPagination && effectiveRowCount > 10;

  const table = useReactTable({
    data,
    columns,

    getRowId: (row, index, parent) => {
      if (getRowId) return getRowId(row);

      return parent
        ? `${parent.id}.${index}`
        : String((row as RowWithId).id ?? index);
    },

    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),

    enableRowSelection: true,

    onRowSelectionChange: setRowSelection,

    ...(hasPagination
      ? {
          getPaginationRowModel: getPaginationRowModel(),
          manualPagination: true,
          rowCount: effectiveRowCount,
          onPaginationChange: setPagination,
        }
      : {}),

    onSortingChange: setSorting,

    state: {
      sorting,
      rowSelection,
      ...(hasPagination ? { pagination } : {}),
    },

    getSubRows: (row) => (row as RowWithSubRecords<T>).subRecords ?? [],
  });

  useEffect(() => {
    if (!onRowSelectionChange) return;

    const selectedIds = Object.keys(rowSelection ?? {});

    if (selectedIds.length === 0) {
      onRowSelectionChange([]);
      return;
    }

    const selectedRows = selectedIds
      .map((id) => table.getRow(id))
      .filter(Boolean)
      .map((row) => row!.original);

    onRowSelectionChange(selectedRows);
  }, [rowSelection]);

  const rows = hasPagination
    ? table.getRowModel().rows
    : table.getCoreRowModel().rows;

  return (
    <div className={cn("w-full mt-6 overflow-auto", tableClassName)}>
      <Table>
        <TableHeader className="bg-white">
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => (
                <TableHead
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className={cn(
                    "text-black",
                    headerClassName,
                    header.column.getCanSort()
                      ? "cursor-pointer"
                      : "cursor-not-allowed"
                  )}
                >
                  <div
                    className={cn(
                      "flex gap-2 items-center",
                      centralizeInformation && "justify-center"
                    )}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}

                    {header.column.getCanSort() && (
                      <SortIcon order={header.column.getIsSorted()} />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <div className="flex justify-center! items-center gap-2 w-full">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  Carregando...
                </div>
              </TableCell>
            </TableRow>
          ) : rows.length ? (
            rows.map((row) => (
              <TableRow
                key={row.id}
                className={cn(
                  "odd:bg-muted/25",
                  typeof rowClassName === "function"
                    ? rowClassName(row)
                    : rowClassName
                )}
              >
                {row.getVisibleCells().map((cell) => {
                  const { columnDef } = cell.column;
                  const value = cell.getValue();

                  const isEmpty =
                    value === null || value === undefined || value === "";

                  const isRoot = row.depth === 0;
                  const isExpanded = row.depth > 0;

                  const showDash =
                    columnDef.meta?.showDashWhenEmpty &&
                    isEmpty &&
                    (isRoot ||
                      (isExpanded && columnDef.meta?.allowDashInExpanded));

                  return (
                    <TableCell key={cell.id} className={cn(cellPaddingClass)}>
                      <div
                        className={cn(
                          "w-full",
                          centralizeInformation && "flex justify-center"
                        )}
                      >
                        {showDash ? (
                          <span className="text-muted-foreground">-</span>
                        ) : (
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )
                        )}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center!">
                {noResults}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {shouldShowPagination && <DataTablePagination table={table} />}
    </div>
  );
}
