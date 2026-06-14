import { PageContainer } from "@/components/layout/PageContainer";

export default function DashboardPage() {
  return (
    <PageContainer>
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Área autenticada do sistema. Em breve: visão geral do dia.
        </p>
      </div>
    </PageContainer>
  );
}
