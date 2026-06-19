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

export function requireRole(role: "admin" | "staff", pathname?: string) {
  const user = requireAuth(pathname);
  if (!user) return undefined;

  if (role === "admin") {
    if (user.role !== "admin") {
      if (user.role === "staff") throw redirect({ to: "/staff" });
      throw redirect({ to: "/dashboard" });
    }
    return user;
  }

  if (user.role !== "staff") {
    if (user.role === "admin") throw redirect({ to: "/admin" });
    throw redirect({ to: "/dashboard" });
  }
  return user;
}
