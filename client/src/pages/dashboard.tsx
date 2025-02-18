import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { Order } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 ml-0 md:ml-64">
        <div className="space-y-6 max-w-6xl mx-auto">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Welcome, {user?.username}</h1>
            <p className="text-muted-foreground">
              Manage your photo editing orders and track their progress
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : orders?.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p>No orders yet. Start by creating a new order!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {orders?.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">Order #{order.id}</h3>
                      <span className="capitalize px-2 py-1 rounded text-sm bg-primary/10">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Created at: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm">Total: ${order.totalPrice.toFixed(2)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}