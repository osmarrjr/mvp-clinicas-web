import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { decodeAccessToken } from "./jwt";
import type { SessionUser } from "./types";

export type ServerSession = {
  isAuthenticated: true;
  user: SessionUser;
};

export async function getServerSession(): Promise<ServerSession | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return null;
  }

  const user = decodeAccessToken(accessToken);

  if (!user) {
    return null;
  }

  return { isAuthenticated: true, user };
}

export async function requireServerSession(): Promise<ServerSession> {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
