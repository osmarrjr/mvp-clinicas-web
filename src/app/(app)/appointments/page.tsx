import { FeaturePageLayout } from "@/components/layout/FeaturePageLayout";
import { PageContainer } from "@/components/layout/PageContainer";

export default function AppointmentsPage() {
  return (
    <PageContainer>
      <FeaturePageLayout
        title="Agenda"
        description="Gerencie os agendamentos da clínica."
      >
        <p className="text-sm text-muted-foreground">Em breve.</p>
      </FeaturePageLayout>
    </PageContainer>
  );
}
