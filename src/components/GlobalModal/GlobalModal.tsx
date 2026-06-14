import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info, CheckCircle2, XCircle, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type GlobalModalType = "warning" | "error" | "success" | "none";

type GlobalModalProps = {
  type: GlobalModalType;
  open: boolean;
  modalTitle: string;
  modalSubTitle?: string;
  content?: React.ReactNode;
  showContent?: boolean;
  loading?: boolean;
  showCancel?: boolean;
  showConfirm?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmDisabled?: boolean;
  showCloseButton?: boolean;
  titleAlign?: "left" | "center" | "right";
  footerAlign?: "left" | "center" | "right";
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
};

const iconMap = {
  warning: Info,
  error: XCircle,
  success: CheckCircle2,
};

const modalStyleMap = {
  warning: {
    icon: "text-amber-600",
    iconBg: "bg-amber-50",
    iconBorder: "border-amber-100",
  },
  error: {
    icon: "text-red-600",
    iconBg: "bg-red-50",
    iconBorder: "border-red-100",
  },
  success: {
    icon: "text-emerald-600",
    iconBg: "bg-emerald-50",
    iconBorder: "border-emerald-100",
  },
};

export function GlobalModal({
  type,
  open,
  modalTitle,
  modalSubTitle,
  onConfirm,
  onCancel,
  content,
  showContent = false,
  loading = false,
  confirmDisabled = false,
  showCancel = true,
  showConfirm = true,
  showCloseButton = false,
  titleAlign = "left",
  footerAlign = "right",
  confirmLabel = "Continuar",
  cancelLabel = "Cancelar",
}: GlobalModalProps) {
  const canShowCloseButton = showCloseButton && type !== "warning";
  const Icon = type !== "none" ? iconMap[type] : null;
  const modalStyle = type !== "none" ? modalStyleMap[type] : null;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onCancel?.();
      }}
    >
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className={cn(
          "w-[calc(100%-2rem)] max-w-[95vw] sm:max-w-[420px] md:max-w-[560px]",
          "max-h-[90vh] overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl",
          "flex flex-col",
          "[&>button]:hidden",
        )}
      >
        <DialogHeader className="relative px-6 pt-6 mt-2">
          {canShowCloseButton && (
            <button
              onClick={onCancel}
              className={cn(
                "absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full",
                "text-primary transition hover:bg-slate-100 hover:text-slate-800",
                "focus:outline-none focus:ring-2 focus:ring-primary/30",
              )}
              aria-label="Fechar modal"
              disabled={loading}
            >
              <X size={18} />
            </button>
          )}

          <div
            className={cn(
              "flex flex-col gap-4",
              titleAlign === "center" && "items-center text-center",
              titleAlign === "right" && "items-end text-right",
              titleAlign === "left" && "items-start text-left",
            )}
          >
            {Icon && modalStyle && (
              <div
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-full border",
                  modalStyle.iconBg,
                  modalStyle.iconBorder,
                )}
              >
                <Icon size={30} className={modalStyle.icon} />
              </div>
            )}

            <div className="space-y-2">
              <DialogTitle
                className={cn(
                  "text-lg font-semibold tracking-tight text-primary",
                  titleAlign === "center" && "text-center",
                  titleAlign === "right" && "text-right",
                )}
              >
                {modalTitle}
              </DialogTitle>

              {modalSubTitle ? (
                <DialogDescription
                  className={cn(
                    "text-base leading-6 text-slate-500",
                    titleAlign === "center" && "text-center",
                    titleAlign === "right" && "text-right",
                  )}
                >
                  {modalSubTitle}
                </DialogDescription>
              ) : (
                <DialogDescription className="sr-only">
                  {modalTitle}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        {showContent && (
          <div className="flex-1 overflow-y-auto text-base leading-6 text-slate-600">
            {content}
          </div>
        )}

        <DialogFooter className="px-6 mb-2 bg-transparent border-none">
          <div
            className={cn(
              "flex w-full flex-col-reverse gap-2 sm:flex-row",
              footerAlign === "left" && "sm:justify-start",
              footerAlign === "center" && "sm:justify-center",
              footerAlign === "right" && "sm:justify-end",
            )}
          >
            {showCancel && (
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={loading}
                className="h-10 px-5 text-sm font-medium text-primary"
              >
                {cancelLabel}
              </Button>
            )}

            {showConfirm && (
              <Button
                type="button"
                onClick={onConfirm}
                disabled={loading || confirmDisabled}
                className={cn(
                  "h-10 min-w-[120px] px-5 text-sm font-medium text-white",
                  "bg-primary ",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Carregando
                  </>
                ) : (
                  confirmLabel
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
