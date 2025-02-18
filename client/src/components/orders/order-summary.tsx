import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Service } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

const DELIVERY_TIMES = [
  { hours: 3, adjustment: 2.0, label: "3 hours" },
  { hours: 6, adjustment: 1.0, label: "6 hours" },
  { hours: 12, adjustment: 0.75, label: "12 hours" },
  { hours: 24, adjustment: 0.50, label: "24 hours" },
  { hours: 36, adjustment: 0.0, label: "36 hours" },
  { hours: 48, adjustment: 0.0, label: "48 hours (Recommended)" },
  { hours: 60, adjustment: 0.0, label: "60 hours" },
  { hours: 72, adjustment: -0.10, label: "72 hours" },
  { hours: 84, adjustment: -0.15, label: "84 hours" },
  { hours: 96, adjustment: -0.20, label: "96 hours" }
];

interface OrderSummaryProps {
  orderData: {
    orderName: string;
    serviceId: number;
    complexity: string;
    files: Array<{ path: string; imageCount?: number }>;
    addons: string[];
    deliveryFormat: string;
    deliveryTime: string;
    instructions: string;
  };
}

export function OrderSummary({ orderData }: OrderSummaryProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Query for the specific service
  const { data: services } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const service = services?.find(s => s.id === orderData.serviceId);

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/orders", {
        ...orderData,
        totalPrice: calculateTotalPrice(),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order placed successfully",
        description: "You will be notified when your order is processed",
      });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Failed to place order",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getTotalImages = () => {
    return orderData.files.reduce((sum, file) => sum + (file.imageCount || 1), 0);
  };

  const getDeliveryTimeAdjustment = () => {
    const selectedTime = parseInt(orderData.deliveryTime);
    const timeOption = DELIVERY_TIMES.find(t => t.hours === selectedTime);
    return timeOption?.adjustment || 0;
  };

  const getBasePrice = () => {
    if (!service) return 0;

    switch (orderData.complexity) {
      case "basic":
        return service.basicPrice;
      case "medium":
        return service.mediumPrice;
      case "complex":
        return service.complexPrice;
      case "superComplex":
        return service.superComplexPrice;
      default:
        return 0;
    }
  };

  const calculateTotalPrice = () => {
    const basePrice = getBasePrice();
    const deliveryAdjustment = getDeliveryTimeAdjustment();
    const totalImages = getTotalImages();
    return (basePrice + deliveryAdjustment) * totalImages;
  };

  if (!service) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const basePrice = getBasePrice();
  const deliveryAdjustment = getDeliveryTimeAdjustment();
  const totalPrice = calculateTotalPrice();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Order Summary</h2>
        <p className="text-muted-foreground">
          Review your order details before proceeding to payment
        </p>
      </div>

      <div className="space-y-4">
        <p><strong>Order Name:</strong> {orderData.orderName}</p>
        <p><strong>Service:</strong> {service.name}</p>
        <p><strong>Complexity Level:</strong> {orderData.complexity}</p>
        <p><strong>Total Images:</strong> {getTotalImages()}</p>
        <p><strong>Delivery Time:</strong> {orderData.deliveryTime} hours</p>
        {orderData.instructions && (
          <p><strong>Instructions:</strong> {orderData.instructions}</p>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead className="text-right">Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>
              Base Price ({orderData.complexity})
              <br />
              <span className="text-sm text-muted-foreground">
                ${basePrice.toFixed(2)} × {getTotalImages()} images
              </span>
            </TableCell>
            <TableCell className="text-right">
              ${(basePrice * getTotalImages()).toFixed(2)}
            </TableCell>
          </TableRow>

          {deliveryAdjustment !== 0 && (
            <TableRow>
              <TableCell>
                Delivery Time Adjustment
                <br />
                <span className="text-sm text-muted-foreground">
                  ${deliveryAdjustment.toFixed(2)} × {getTotalImages()} images
                </span>
              </TableCell>
              <TableCell className="text-right">
                ${(deliveryAdjustment * getTotalImages()).toFixed(2)}
              </TableCell>
            </TableRow>
          )}

          <TableRow>
            <TableCell className="font-bold">Total</TableCell>
            <TableCell className="text-right font-bold">
              ${totalPrice.toFixed(2)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <Input placeholder="Enter coupon code" />
        </div>
        <Button variant="outline">Apply Coupon</Button>
      </div>

      <div className="pt-4 border-t">
        <Button
          className="w-full"
          size="lg"
          onClick={() => createOrderMutation.mutate()}
          disabled={createOrderMutation.isPending}
        >
          {createOrderMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Proceed to Payment
        </Button>
      </div>
    </div>
  );
}
