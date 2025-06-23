"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Copy, Check, MapPin, Key, Info } from "lucide-react"

export default function SetupGuide() {
  const [copiedStep, setCopiedStep] = useState<number | null>(null)

  const copyToClipboard = (text: string, stepNumber: number) => {
    navigator.clipboard.writeText(text)
    setCopiedStep(stepNumber)
    setTimeout(() => setCopiedStep(null), 2000)
  }

  const steps = [
    {
      title: "Get Google Maps API Key",
      description: "Visit the Google Cloud Console to create and configure your API key",
      action: "https://developers.google.com/maps/documentation/javascript/get-api-key",
      code: null,
    },
    {
      title: "Enable Required APIs",
      description: "Enable Maps JavaScript API and Geocoding API in your Google Cloud project",
      action: "https://console.cloud.google.com/apis/library",
      code: null,
    },
    {
      title: "Create Environment File",
      description: "Create a .env.local file in your project root with server-side variables",
      action: null,
      code: "GOOGLE_MAPS_API_KEY=your_api_key_here",
    },
    {
      title: "Restart Development Server",
      description: "Restart your Next.js development server to load the new environment variables",
      action: null,
      code: "npm run dev",
    },
  ]

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Google Maps Setup Guide
        </CardTitle>
        <CardDescription>Follow these steps to enable real Google Maps functionality for geofencing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> The app currently works with a mock map interface. Follow these steps to enable real
            Google Maps with server-side API key configuration.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
              <div className="flex-shrink-0">
                <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                  {index + 1}
                </Badge>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-medium">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>

                {step.action && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={step.action} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Link
                    </a>
                  </Button>
                )}

                {step.code && (
                  <div className="bg-gray-100 p-3 rounded-md">
                    <div className="flex items-center justify-between">
                      <code className="text-sm font-mono">{step.code}</code>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(step.code!, index)}>
                        {copiedStep === index ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <Alert>
          <Key className="h-4 w-4" />
          <AlertDescription>
            <strong>Security:</strong> Make sure to restrict your API key to your domain and only enable the APIs you
            need.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
