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
    <div className="mb-5 rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-blue-100/70">
            Plano selecionado
          </p>
          <p className="text-sm font-semibold text-white">
            {planName} — {priceLabel}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          className="h-auto shrink-0 px-2 py-1 text-xs text-sky-200 hover:bg-white/10 hover:text-white"
          onClick={onChangePlan}
        >
          Alterar
        </Button>
      </div>
    </div>
  );
}
