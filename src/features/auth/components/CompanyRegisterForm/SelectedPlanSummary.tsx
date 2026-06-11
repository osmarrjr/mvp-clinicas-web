import { Button } from "@/components/ui/button";

type SelectedPlanSummaryProps = {
  planName: string;
  priceLabel: string;
  onChangePlan: () => void;
};

export function SelectedPlanSummary({
  planName,
  priceLabel,
  onChangePlan,
}: SelectedPlanSummaryProps) {
  return (
    <div className="mb-5 rounded-2xl border border-white/40 bg-white/95 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-semibold uppercase tracking-wide text-slate-500">
            Plano selecionado
          </p>

          <p className="truncate text-base font-semibold text-slate-900">
            {planName} — {priceLabel}
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          className="h-auto shrink-0 rounded-xl px-3 py-1.5 text-base font-semibold text-blue-700 transition hover:bg-blue-50 hover:text-blue-800"
          onClick={onChangePlan}
        >
          Alterar
        </Button>
      </div>
    </div>
  );
}
