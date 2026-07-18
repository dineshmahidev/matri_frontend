import { redirect } from "@tanstack/react-router";
import type { UserType } from "./auth";

export function getStoredUser(): UserType | null {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem("ungalkalyanam_user");
  if (!saved) return null;
  try {
    return JSON.parse(saved) as UserType;
  } catch {
    return null;
  }
}

export function requireAuth(redirectTo?: string) {
  if (typeof window === 'undefined') return undefined;
  const token = localStorage.getItem("ungalkalyanam_token");
  const user = getStoredUser();
  if (!token || !user) {
    throw redirect({
      to: "/login",
      search: redirectTo ? { redirect: redirectTo } : undefined,
    });
  }
  return user;
}

/** Roles that have access to the admin panel (/uk-control) */
export const ADMIN_ROLES: UserType['role'][] = ['admin', 'manager'];

/** Compute the correct home dashboard path for a given role */
export function getDashboardPath(role: UserType['role']): string {
  if (ADMIN_ROLES.includes(role)) return '/uk-control';
  if (role === 'staff') return '/staff';
  return '/dashboard';
}

export function requireRole(role: "admin" | "staff", pathname?: string) {
  const user = requireAuth(pathname);
  if (!user) return undefined;

  if (role === "admin") {
    // Both admin and manager may access /uk-control
    if (!ADMIN_ROLES.includes(user.role)) {
      if (user.role === "staff") throw redirect({ to: "/staff" });
      throw redirect({ to: "/dashboard" });
    }
    return user;
  }

  if (user.role !== "staff") {
    if (ADMIN_ROLES.includes(user.role)) throw redirect({ to: "/uk-control" });
    throw redirect({ to: "/dashboard" });
  }
  return user;
}
