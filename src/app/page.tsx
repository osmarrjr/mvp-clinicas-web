import type { Metadata } from "next";

import { LandingPage } from "@/features/landing/components/LandingPage";

export const metadata: Metadata = {
  title: "SisMed — Gestão inteligente para clínicas médicas",
  description:
    "Software de clínicas médicas com agenda, prontuário, financeiro e relatórios para mais produtividade no seu dia a dia.",
};

export default function HomePage() {
  return <LandingPage />;
}
