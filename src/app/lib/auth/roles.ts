export type UserRole = "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";

const ADMIN_ROLES: readonly UserRole[] = [
  "ADMIN",
  "SUPER_ADMIN",
];

export const isAdminRole = (
  role: UserRole | undefined | null
): boolean => {
  return role ? ADMIN_ROLES.includes(role) : false;
};

const ROLE_LABELS: Record<UserRole, string> = {
  CUSTOMER: "Customer",
  ADMIN: "Administrator",
  SUPER_ADMIN: "Super Admin",
};

export const getRoleLabel = (
  role: UserRole | undefined | null
): string => {
  return role ? ROLE_LABELS[role] : "";
};
