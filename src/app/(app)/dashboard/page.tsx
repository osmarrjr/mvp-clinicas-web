import { FeaturePageLayout } from "@/components/layout/FeaturePageLayout";
import { PageContainer } from "@/components/layout/PageContainer";

export default function DashboardPage() {
  return (
    <PageContainer>
      <FeaturePageLayout
        title="Dashboard"
        description="Área autenticada do sistema. Em breve: visão geral do dia."
      >
        <p className="text-sm text-muted-foreground">Em breve.</p>
      </FeaturePageLayout>
    </PageContainer>
  );
}
