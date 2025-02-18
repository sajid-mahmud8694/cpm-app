import { useState } from "react";
import { ServiceSelector } from "@/components/orders/service-selector";
import { FileUploader } from "@/components/orders/file-uploader";
import { OrderSummary } from "@/components/orders/order-summary";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Card } from "@/components/ui/card";
import { Steps } from "@/components/ui/steps";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type OrderStep = "service" | "upload" | "delivery" | "summary";

const DELIVERY_TIMES = [
  { hours: 3, adjustment: 2.0, label: "3 hours (+$2.0/image)" },
  { hours: 6, adjustment: 1.0, label: "6 hours (+$1.0/image)" },
  { hours: 12, adjustment: 0.75, label: "12 hours (+$0.75/image)" },
  { hours: 24, adjustment: 0.50, label: "24 hours (+$0.50/image)" },
  { hours: 36, adjustment: 0.0, label: "36 hours (+$0.00/image)" },
  { hours: 48, adjustment: 0.0, label: "48 hours (Recommended)" },
  { hours: 60, adjustment: 0.0, label: "60 hours (+$0.00/image)" },
  { hours: 72, adjustment: -0.10, label: "72 hours (-$0.10/image)" },
  { hours: 84, adjustment: -0.15, label: "84 hours (-$0.15/image)" },
  { hours: 96, adjustment: -0.20, label: "96 hours (-$0.20/image)" }
];

export default function NewOrder() {
  const [currentStep, setCurrentStep] = useState<OrderStep>("service");
  const [orderData, setOrderData] = useState({
    serviceId: 0,
    complexity: "",
    orderName: "",
    files: [] as Array<{ path: string; imageCount?: number }>,
    addons: [] as string[],
    deliveryFormat: "",
    deliveryTime: "48",
    instructions: "",
  });

  const [stepValidity, setStepValidity] = useState({
    service: false,
    upload: false,
  });

  const steps = [
    { id: "service", title: "Choose Service" },
    { id: "upload", title: "Upload Files" },
    { id: "delivery", title: "Delivery Options" },
    { id: "summary", title: "Order Summary" },
  ];

  const canProceed = () => {
    switch (currentStep) {
      case "service":
        return stepValidity.service;
      case "upload":
        return stepValidity.upload;
      case "delivery":
        return true; // Delivery time always has a default value
      case "summary":
        return false; // Can't proceed from summary
      default:
        return false;
    }
  };

  const handleNext = () => {
    const stepOrder: OrderStep[] = ["service", "upload", "delivery", "summary"];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const stepOrder: OrderStep[] = ["service", "upload", "delivery", "summary"];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const DeliveryOptions = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Pick a delivery time</h2>
        <p className="text-muted-foreground">
          How fast would you like us to deliver your processed images?
        </p>
      </div>

      <RadioGroup
        value={orderData.deliveryTime}
        onValueChange={(val) => setOrderData({ ...orderData, deliveryTime: val })}
        className="grid gap-4"
      >
        {DELIVERY_TIMES.map((time) => (
          <Label
            key={time.hours}
            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-accent ${
              orderData.deliveryTime === time.hours.toString() ? "bg-accent" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value={time.hours.toString()} />
              <span>{time.label}</span>
            </div>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 ml-0 md:ml-64 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-2xl md:text-3xl font-bold">New Order</h1>

          <Card className="p-4 md:p-6">
            <Steps
              steps={steps}
              currentStep={steps.findIndex(s => s.id === currentStep)}
              className="mb-8"
            />

            {currentStep === "service" && (
              <ServiceSelector
                value={orderData}
                onChange={(updates) => setOrderData({ ...orderData, ...updates })}
                onValidityChange={(isValid) => setStepValidity({ ...stepValidity, service: isValid })}
              />
            )}

            {currentStep === "upload" && (
              <FileUploader
                value={orderData}
                onChange={(updates) => setOrderData({ ...orderData, ...updates })}
                onValidityChange={(isValid) => setStepValidity({ ...stepValidity, upload: isValid })}
              />
            )}

            {currentStep === "delivery" && (
              <DeliveryOptions />
            )}

            {currentStep === "summary" && (
              <OrderSummary
                orderData={orderData}
              />
            )}

            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === "service"}
              >
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={currentStep === "summary" || !canProceed()}
              >
                {currentStep === "summary" ? "Place Order" : "Next"}
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}