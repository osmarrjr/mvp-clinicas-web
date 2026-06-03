import { Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

function getPagination(
  currentPage: number,
  totalPages: number,
  maxPagesToShow = 5
): number[] {
  const half = Math.floor(maxPagesToShow / 2);

  let start = currentPage - half;
  let end = currentPage + half;

  if (maxPagesToShow % 2 === 0) start += 1;

  if (start < 1) {
    start = 1;
    end = maxPagesToShow;
  }

  if (end > totalPages) {
    end = totalPages;
    start = totalPages - maxPagesToShow + 1;
  }

  if (start < 1) start = 1;

  return Array.from(
    { length: Math.min(maxPagesToShow, totalPages - start + 1) },
    (_, i) => start + i
  );
}

export function DataTablePagination<TData>({
  table,
}: Readonly<DataTablePaginationProps<TData>>) {
  const totalPages = table.getPageCount();
  const paginationState = table.getState().pagination;
  const paginationItems = getPagination(
    paginationState.pageIndex + 1,
    totalPages
  );

  const pageCount = table.getPageCount() || 1;

  return (
    <div className="flex flex-wrap justify-end items-center py-5 w-full font-normal gap-4">
      <div className="text-sm text-muted-foreground">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm text-black">Pacientes por página:</p>
          <Select
            value={`${paginationState.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger
              className="h-8 w-[70px] cursor-pointer text-black shadow-none"
              id="page-size"
            >
              <SelectValue placeholder={paginationState.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 lg:gap-8">
        <div className="hidden p-0 md:flex items-end justify-end text-sm">
          <span>
            Página {paginationState.pageIndex + 1} de {pageCount}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <Button
            id="pagination-first"
            variant="outline"
            size={"sm"}
            className="hidden p-0 lg:flex cursor-pointer font-normal"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Ir para a primeira página</span>
            <ChevronsLeft />
          </Button>

          <Button
            id="pagination-previus"
            variant="outline"
            size={"sm"}
            className="p-0 cursor-pointer font-normal"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Ir para a página anterior</span>
            <ChevronLeft /> Voltar
          </Button>

          {paginationItems.map((page) => (
            <Button
              id={`pagination-select-${page}`}
              variant="outline"
              size={"sm"}
              key={page}
              disabled={paginationState.pageIndex + 1 === page}
              onClick={() => table.setPageIndex(page - 1)}
              className={cn(
                "cursor-pointer font-normal shadow-none",
                paginationState.pageIndex + 1 === page
                  ? "bg-muted-foreground text-muted"
                  : "bg-transparent"
              )}
            >
              {page}
            </Button>
          ))}

          <Button
            id="pagination-next"
            variant="outline"
            size={"sm"}
            className="p-0 cursor-pointer font-normal shadow-none"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Ir para a próxima página</span>
            Próximo <ChevronRight />
          </Button>

          <Button
            id="pagination-last"
            variant="outline"
            size={"sm"}
            className="hidden p-0 lg:flex cursor-pointer font-normal shadow-none"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Ir para a última página</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
