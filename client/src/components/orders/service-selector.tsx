import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { Service } from "@shared/schema";
import React from "react";

interface ServiceSelectorProps {
  value: {
    serviceId: number;
    complexity: string;
  };
  onChange: (updates: Partial<ServiceSelectorProps["value"]>) => void;
  onValidityChange: (isValid: boolean) => void;
}

export function ServiceSelector({ value, onChange, onValidityChange }: ServiceSelectorProps) {
  const { data: services } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const selectedService = services?.find(s => s.id === value.serviceId);

  // Check if both service and complexity are selected
  const isValid = value.serviceId !== 0 && value.complexity !== "";

  // Update parent about validity whenever it changes
  React.useEffect(() => {
    onValidityChange(isValid);
  }, [isValid, onValidityChange]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Choose type of service</h2>
        <p className="text-muted-foreground">
          Please select the appropriate service type that matches your requirement.
          If you are unsure about the type of service please contact us.
        </p>
      </div>

      <Select
        value={value.serviceId.toString()}
        onValueChange={(val) => onChange({ serviceId: parseInt(val) })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a service" />
        </SelectTrigger>
        <SelectContent>
          {services?.map((service) => (
            <SelectItem key={service.id} value={service.id.toString()}>
              {service.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedService && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How complex are your images?</CardTitle>
            <CardDescription>
              Please select the appropriate level of image complexity.
              If you are unsure, please go through request for quotation process.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={value.complexity}
              onValueChange={(val) => onChange({ complexity: val })}
              className="grid grid-cols-2 gap-4"
            >
              <Label 
                className={`flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer hover:bg-accent ${value.complexity === "basic" ? "bg-accent" : ""}`}
              >
                <RadioGroupItem value="basic" className="sr-only" />
                <span className="font-semibold">Basic</span>
                <span className="text-sm text-muted-foreground">
                  ${selectedService.basicPrice.toFixed(2)}
                </span>
              </Label>
              <Label 
                className={`flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer hover:bg-accent ${value.complexity === "medium" ? "bg-accent" : ""}`}
              >
                <RadioGroupItem value="medium" className="sr-only" />
                <span className="font-semibold">Medium</span>
                <span className="text-sm text-muted-foreground">
                  ${selectedService.mediumPrice.toFixed(2)}
                </span>
              </Label>
              <Label 
                className={`flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer hover:bg-accent ${value.complexity === "complex" ? "bg-accent" : ""}`}
              >
                <RadioGroupItem value="complex" className="sr-only" />
                <span className="font-semibold">Complex</span>
                <span className="text-sm text-muted-foreground">
                  ${selectedService.complexPrice.toFixed(2)}
                </span>
              </Label>
              <Label 
                className={`flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer hover:bg-accent ${value.complexity === "superComplex" ? "bg-accent" : ""}`}
              >
                <RadioGroupItem value="superComplex" className="sr-only" />
                <span className="font-semibold">Super Complex</span>
                <span className="text-sm text-muted-foreground">
                  ${selectedService.superComplexPrice.toFixed(2)}
                </span>
              </Label>
            </RadioGroup>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
