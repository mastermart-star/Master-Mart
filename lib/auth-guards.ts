import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { AppError } from "@/core/errors";

export const ROLES = ["user", "admin"] as const;
export type Role = (typeof ROLES)[number];

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Throws 401. Use in Server Actions and Route Handlers. */
export async function requireSession() {
  const session = await getSession();
  if (!session) throw new AppError(401, "You must be signed in");
  return session;
}

/** Throws 403. */
export async function requireRole(...roles: Role[]) {
  const session = await requireSession();
  if (!roles.includes(session.user.role as Role)) {
    throw new AppError(403, "You do not have access to this resource");
  }
  return session;
}
