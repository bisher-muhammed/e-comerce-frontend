// app/admin/orders/components/OrderStatusBadge.tsx
import type { OrderStatus } from "@/app/services/admin/order.service";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

// Matches the reference screenshots' pill style: a colored dot + label,
// not a solid filled chip.
const STATUS_STYLES: Record<OrderStatus, { dot: string; text: string; bg: string }> = {
  PENDING: { dot: "bg-amber-500", text: "text-amber-800", bg: "bg-amber-100" },
  CONFIRMED: { dot: "bg-blue-500", text: "text-blue-800", bg: "bg-blue-100" },
  DELIVERED: { dot: "bg-emerald-500", text: "text-emerald-800", bg: "bg-emerald-100" },
  CANCELLED: { dot: "bg-red-500", text: "text-red-800", bg: "bg-red-100" },
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const style = STATUS_STYLES[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${style.bg} ${style.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {STATUS_LABELS[status]}
    </span>
  );
}
