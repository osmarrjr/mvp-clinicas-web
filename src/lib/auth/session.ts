import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type ServerSession = {
  isAuthenticated: true;
};

export async function getServerSession(): Promise<ServerSession | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return null;
  }

  return { isAuthenticated: true };
}

export async function requireServerSession(): Promise<ServerSession> {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
