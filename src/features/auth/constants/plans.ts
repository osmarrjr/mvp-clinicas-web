import type { ClinicPlan } from "../types";

export interface ClinicPlanOption {
  id: ClinicPlan;
  name: string;
  priceLabel: string;
  features: string[];
}

export const CLINIC_PLAN_OPTIONS: ClinicPlanOption[] = [
  {
    id: "basic",
    name: "Basic",
    priceLabel: "R$ 35,00/mês",
    features: [
      "Até 2 profissionais cadastrados",
      "Agenda online com confirmação por e-mail",
      "Cadastro de pacientes e histórico básico",
      "Relatórios essenciais de atendimento",
      "Suporte por e-mail em horário comercial",
    ],
  },
  {
    id: "medium",
    name: "Medium",
    priceLabel: "R$ 75,00/mês",
    features: [
      "Até 10 profissionais cadastrados",
      "Lembretes automáticos por WhatsApp e SMS",
      "Prontuário eletrônico com anexos",
      "Controle financeiro com receitas e despesas",
      "Dashboard de ocupação da agenda",
      "Suporte prioritário em dias úteis",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceLabel: "R$ 135,00/mês",
    features: [
      "Profissionais ilimitados",
      "Multi-unidades e filiais",
      "Integrações com laboratórios e convênios",
      "Automação de faturamento e NFS-e",
      "Permissões avançadas por perfil",
      "Relatórios personalizados e exportação",
      "Suporte dedicado 24/7",
    ],
  },
];
