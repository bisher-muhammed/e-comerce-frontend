import type { CustomerStatus } from "@/app/services/admin/user.service";

const AVATAR_COLORS = [
  "bg-[#E4C9B0] text-[#5C4326]",
  "bg-[#D9C48A] text-[#4A3F1A]",
  "bg-[#B7C9B0] text-[#324A2A]",
  "bg-[#AEC4D6] text-[#1F3547]",
  "bg-[#CBB7D6] text-[#3D2A47]",
  "bg-[#D9A98A] text-[#4A2E1A]",
];

export function initials(first: string, last: string | null) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

export function avatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

export function customerCode(id: number) {
  return `USR-${String(id).padStart(3, "0")}`;
}

export function formatStatusLabel(status: CustomerStatus) {
  if (status === "PENDING_VERIFICATION") return "Pending";
  return status.charAt(0) + status.slice(1).toLowerCase();
}

// Your globals.css only defines a --destructive token — there is no
// "success" or "warning" color in your design system. These two hex
// values are not tokens, they're hardcoded to match the reference
// screenshot's green/amber dots. If you want them themeable, add
// --success / --warning custom properties to globals.css and swap
// these for var() references.
const STATUS_DOT_COLOR: Record<CustomerStatus, string> = {
  ACTIVE: "#3D8B5F",
  SUSPENDED: "#B8862E",
  PENDING_VERIFICATION: "#B8862E",
  DEACTIVATED: "var(--muted-foreground)",
};

export function statusDotStyle(status: CustomerStatus) {
  return { backgroundColor: STATUS_DOT_COLOR[status] };
}

export function statusTextClass(status: CustomerStatus) {
  return status === "DEACTIVATED"
    ? "text-muted-foreground"
    : "text-foreground";
}