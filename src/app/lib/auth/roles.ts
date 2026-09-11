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
