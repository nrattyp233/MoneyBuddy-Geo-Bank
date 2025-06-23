"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Building2, Banknote, Landmark, Globe } from "lucide-react"

interface ProcessorOption {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  features: string[]
  processingTime: string
  fees: string
  supported: boolean
}

const processors: ProcessorOption[] = [
  {
    id: "square",
    name: "Square",
    description: "Credit/debit card processing with instant deposits",
    icon: <CreditCard className="h-6 w-6" />,
    features: ["Instant deposits", "Card payments", "Low fees", "Easy setup"],
    processingTime: "Instant",
    fees: "2.9% + 30¢",
    supported: true,
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Global payment platform with buyer protection",
    icon: <Globe className="h-6 w-6" />,
    features: ["Global reach", "Buyer protection", "Multiple currencies", "Mobile optimized"],
    processingTime: "Instant",
    fees: "2.9% + fixed fee",
    supported: true,
  },
  {
    id: "dwolla",
    name: "Dwolla",
    description: "ACH bank transfers with low fees",
    icon: <Building2 className="h-6 w-6" />,
    features: ["ACH transfers", "Low fees", "Bank-to-bank", "Business focused"],
    processingTime: "1-3 business days",
    fees: "$0.25 per transaction",
    supported: true,
  },
  {
    id: "plaid",
    name: "Plaid",
    description: "Direct bank account connections and transfers",
    icon: <Landmark className="h-6 w-6" />,
    features: ["Bank connections", "Account verification", "Real-time balance", "Secure"],
    processingTime: "1-2 business days",
    fees: "Variable by bank",
    supported: true,
  },
  {
    id: "adyen",
    name: "Adyen",
    description: "Enterprise payment platform with global reach",
    icon: <Banknote className="h-6 w-6" />,
    features: ["Global payments", "Multiple methods", "Enterprise grade", "Advanced reporting"],
    processingTime: "Instant",
    fees: "Custom pricing",
    supported: true,
  },
]

interface ProcessorSelectorProps {
  selectedProcessor?: string
  onSelect: (processorId: string) => void
  transactionType: "deposit" | "withdrawal"
}

export default function ProcessorSelector({ selectedProcessor, onSelect, transactionType }: ProcessorSelectorProps) {
  const [hoveredProcessor, setHoveredProcessor] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Choose Payment Processor</h3>
        <p className="text-sm text-muted-foreground">Select how you'd like to process your {transactionType}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {processors.map((processor) => (
          <Card
            key={processor.id}
            className={`cursor-pointer transition-all duration-200 ${
              selectedProcessor === processor.id ? "ring-2 ring-primary border-primary" : "hover:shadow-md"
            } ${hoveredProcessor === processor.id ? "scale-105" : ""}`}
            onClick={() => processor.supported && onSelect(processor.id)}
            onMouseEnter={() => setHoveredProcessor(processor.id)}
            onMouseLeave={() => setHoveredProcessor(null)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {processor.icon}
                  <CardTitle className="text-base">{processor.name}</CardTitle>
                </div>
                {selectedProcessor === processor.id && <Badge variant="default">Selected</Badge>}
                {!processor.supported && <Badge variant="secondary">Coming Soon</Badge>}
              </div>
              <CardDescription className="text-xs">{processor.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Processing Time:</span>
                  <span className="font-medium">{processor.processingTime}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Fees:</span>
                  <span className="font-medium">{processor.fees}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {processor.features.slice(0, 2).map((feature) => (
                    <Badge key={feature} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedProcessor && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            {processors.find((p) => p.id === selectedProcessor)?.icon}
            <span className="font-medium">{processors.find((p) => p.id === selectedProcessor)?.name} Selected</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Your {transactionType} will be processed using {processors.find((p) => p.id === selectedProcessor)?.name}
          </p>
        </div>
      )}
    </div>
  )
}
