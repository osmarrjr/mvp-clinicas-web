"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Popover } from "radix-ui";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { disabledFieldClassName } from "@/lib/styles/disabled-field";

export type SearchableSelectOption = {
  value: string;
  label: string;
};

type SearchableSelectProps = {
  id?: string;
  value?: string;
  onValueChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder: string;
  searchPlaceholder?: string;
  showSearch?: boolean;
  disabled?: boolean;
  triggerClassName?: string;
  "aria-invalid"?: boolean;
  emptyMessage?: string;
};

export function SearchableSelect({
  id,
  value,
  onValueChange,
  options,
  placeholder,
  searchPlaceholder = "Buscar...",
  showSearch = true,
  disabled = false,
  triggerClassName,
  "aria-invalid": ariaInvalid,
  emptyMessage = "Nenhum resultado encontrado.",
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [triggerWidth, setTriggerWidth] = useState<number | undefined>();
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedLabel = options.find((option) => option.value === value)?.label;

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return options;

    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(query) ||
        option.value.toLowerCase().includes(query),
    );
  }, [options, search]);

  useEffect(() => {
    if (!open || !triggerRef.current) return;

    const updateWidth = () => {
      setTriggerWidth(triggerRef.current?.offsetWidth);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);

    return () => window.removeEventListener("resize", updateWidth);
  }, [open]);

  function handleSelect(optionValue: string) {
    onValueChange(optionValue);
    setOpen(false);
    setSearch("");
  }

  return (
    <Popover.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setSearch("");
      }}
    >
      <Popover.Trigger asChild>
        <button
          ref={triggerRef}
          id={id}
          type="button"
          disabled={disabled}
          aria-invalid={ariaInvalid}
          className={cn(
            "flex h-12 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-input bg-white px-4 text-base text-foreground transition outline-none focus-visible:border-ring/50 aria-invalid:border-destructive",
            disabledFieldClassName,
            !selectedLabel && "text-muted-foreground",
            triggerClassName,
          )}
        >
          <span
            className={cn(
              "truncate text-left",
              !selectedLabel && "text-sm text-muted-foreground",
            )}
          >
            {selectedLabel ?? placeholder}
          </span>
          <ChevronDownIcon className="size-4 shrink-0 text-slate-500" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={4}
          collisionPadding={8}
          avoidCollisions={false}
          className={cn(
            "z-50 flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white p-0 text-slate-900 shadow-md ring-1 ring-foreground/10",
            "max-h-[min(300px,var(--radix-popover-content-available-height))]",
          )}
          style={{ width: triggerWidth }}
          onOpenAutoFocus={(event) => {
            if (!showSearch) {
              event.preventDefault();
            }
          }}
        >
          {showSearch ? (
            <div className="shrink-0 border-b border-slate-100 p-2">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 w-full"
                aria-label={searchPlaceholder}
              />
            </div>
          ) : null}

          <ul
            className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-1"
            role="listbox"
          >
            {filteredOptions.length === 0 ? (
              <li className="cursor-default px-3 py-2 text-base text-slate-500">
                {emptyMessage}
              </li>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;

                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <button
                      type="button"
                      className={cn(
                        "flex w-full cursor-pointer items-start gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-slate-100",
                        isSelected && "bg-slate-100 font-medium",
                      )}
                      onClick={() => handleSelect(option.value)}
                    >
                      <span className="min-w-0 flex-1 wrap-break-word whitespace-normal">
                        {option.label}
                      </span>
                      {isSelected ? (
                        <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                      ) : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
