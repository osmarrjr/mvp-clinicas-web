import { PageContainer } from "@/components/layout/PageContainer";
import { CONVENIOS_ALLOWED_ROLES } from "@/config/permissions";
import { ConvenioRegisterForm } from "@/features/convenios/components/ConvenioRegisterForm";
import { requireAppRole } from "@/lib/auth/requireAppRole";

export default async function CadastrarConvenioPage() {
  await requireAppRole(CONVENIOS_ALLOWED_ROLES);

  return (
    <PageContainer>
      <ConvenioRegisterForm />
    </PageContainer>
  );
}
