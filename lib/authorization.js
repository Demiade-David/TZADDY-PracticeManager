import { requireAuth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export async function requirePermission(
  permission
) {
  const user = await requireAuth();

  if (!hasPermission(user.role, permission)) {
    throw new Error("Forbidden");
  }

  return user;
}