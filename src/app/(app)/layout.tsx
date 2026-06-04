import { redirect } from "next/navigation";

import { AppLayout } from "@/components/layout/AppLayout";
import { getServerSession } from "@/lib/auth/session";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return <AppLayout>{children}</AppLayout>;
}
