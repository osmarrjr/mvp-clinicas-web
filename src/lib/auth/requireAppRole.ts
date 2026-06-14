import { cookies } from "next/headers";
import { forbidden } from "next/navigation";

import { decodeAccessToken } from "./jwt";
import { requireServerSession, type ServerSession } from "./session";
import { AppRole } from "./types";

export async function requireAppRole(
  allowedRoles: AppRole[],
): Promise<ServerSession> {
  const session = await requireServerSession();
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value ?? "";
  const user = decodeAccessToken(accessToken);

  if (!user?.role || !allowedRoles.includes(user.role)) {
    forbidden();
  }

  return session;
}
