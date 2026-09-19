import OrderList from "./components/OrderList";

export default function OrdersPage() {
    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold tracking-tight">
                        My Orders
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        View and manage your orders.
                    </p>
                </div>

                <OrderList />
            </div>
        </div>
    );
}
