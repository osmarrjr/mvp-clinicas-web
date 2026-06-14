import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { getServerSession } from "@/lib/auth/session";

type AppLayoutProps = {
  children: React.ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return <AppShell>{children}</AppShell>;
}
