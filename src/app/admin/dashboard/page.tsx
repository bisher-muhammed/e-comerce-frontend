import {
  Package,
  ShoppingBag,
  Users,
  IndianRupee,
  ArrowUpRight,
} from "lucide-react";

const stats = [
  {
    label: "Total Revenue",
    value: "₹1,24,580",
    change: "+12.5%",
    icon: IndianRupee,
  },
  {
    label: "Orders",
    value: "1,284",
    change: "+8.2%",
    icon: ShoppingBag,
  },
  {
    label: "Products",
    value: "348",
    change: "+4.6%",
    icon: Package,
  },
  {
    label: "Customers",
    value: "2,847",
    change: "+10.1%",
    icon: Users,
  },
];

const recentOrders = [
  {
    id: "#ORD-1024",
    customer: "Arjun Kumar",
    date: "Aug 15, 2026",
    amount: "₹2,499",
    status: "Completed",
  },
  {
    id: "#ORD-1023",
    customer: "Rahul Menon",
    date: "Aug 15, 2026",
    amount: "₹4,890",
    status: "Processing",
  },
  {
    id: "#ORD-1022",
    customer: "Anjali Nair",
    date: "Aug 14, 2026",
    amount: "₹1,799",
    status: "Completed",
  },
  {
    id: "#ORD-1021",
    customer: "Vishnu Das",
    date: "Aug 14, 2026",
    amount: "₹3,299",
    status: "Pending",
  },
  {
    id: "#ORD-1020",
    customer: "Meera Thomas",
    date: "Aug 13, 2026",
    amount: "₹6,490",
    status: "Completed",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Here's what's happening with your store today.
        </p>
      </div>

      {/* Stats */}
      <section
        className="
          grid
          grid-cols-1
          gap-3
          sm:grid-cols-2
          sm:gap-4
          2xl:grid-cols-4
        "
      >
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="
                min-w-0
                border
                border-border
                bg-card
                p-4
                sm:p-5
              "
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">
                    {stat.label}
                  </p>

                  <p className="mt-2 truncate text-xl font-medium tracking-tight sm:text-2xl">
                    {stat.value}
                  </p>
                </div>

                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    bg-secondary
                  "
                >
                  <Icon className="h-[17px] w-[17px]" />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-1 text-xs">
                <span className="font-medium text-foreground">
                  {stat.change}
                </span>

                <span className="text-muted-foreground">
                  from last month
                </span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Main content */}
      <section
        className="
          mt-6
          grid
          grid-cols-1
          gap-6
          2xl:grid-cols-[minmax(0,1fr)_320px]
        "
      >
        {/* Recent Orders */}
        <div
          className="
            min-w-0
            overflow-hidden
            border
            border-border
            bg-card
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              gap-4
              border-b
              border-border
              px-4
              py-4
              sm:px-5
            "
          >
            <div className="min-w-0">
              <h2 className="text-base font-medium">
                Recent orders
              </h2>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Latest customer orders
              </p>
            </div>

            <button
              type="button"
              className="
                flex
                shrink-0
                items-center
                gap-1
                text-xs
                font-medium
                underline
                underline-offset-4
              "
            >
              View all
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Desktop / tablet table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[650px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                    Order
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                    Customer
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                    Date
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                    Amount
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-5 py-4 text-sm font-medium">
                      {order.id}
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {order.customer}
                    </td>

                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {order.date}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium">
                      {order.amount}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex bg-secondary px-2.5 py-1 text-xs font-medium">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-border md:hidden">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="space-y-3 p-4 sm:p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">
                    {order.id}
                  </p>

                  <span className="shrink-0 bg-secondary px-2.5 py-1 text-xs font-medium">
                    {order.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      Customer
                    </p>

                    <p className="mt-1 truncate">
                      {order.customer}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Amount
                    </p>

                    <p className="mt-1 font-medium">
                      {order.amount}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  {order.date}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="min-w-0 border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-medium">
              Quick actions
            </h2>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Frequently used actions
            </p>
          </div>

          <div className="space-y-2 p-4">
            <a
              href="/admin/products"
              className="
                flex
                items-center
                justify-between
                border
                border-border
                px-4
                py-3
                text-sm
                transition-colors
                hover:bg-secondary
              "
            >
              <span>Add product</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>

            <a
              href="/admin/orders"
              className="
                flex
                items-center
                justify-between
                border
                border-border
                px-4
                py-3
                text-sm
                transition-colors
                hover:bg-secondary
              "
            >
              <span>View orders</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>

            <a
              href="/admin/categories"
              className="
                flex
                items-center
                justify-between
                border
                border-border
                px-4
                py-3
                text-sm
                transition-colors
                hover:bg-secondary
              "
            >
              <span>Manage categories</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>

            <a
              href="/admin/admins"
              className="
                flex
                items-center
                justify-between
                border
                border-border
                px-4
                py-3
                text-sm
                transition-colors
                hover:bg-secondary
              "
            >
              <span>Manage admins</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
