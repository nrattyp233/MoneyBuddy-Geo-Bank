"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Copy, Check, MapPin, Key, Info } from "lucide-react"

export default function MapboxSetupGuide() {
  const [copiedStep, setCopiedStep] = useState<number | null>(null)

  const copyToClipboard = (text: string, stepNumber: number) => {
    navigator.clipboard.writeText(text)
    setCopiedStep(stepNumber)
    setTimeout(() => setCopiedStep(null), 2000)
  }

  const steps = [
    {
      title: "Create Mapbox Account",
      description: "Sign up for a free Mapbox account",
      action: "https://account.mapbox.com/auth/signup/",
      code: null,
    },
    {
      title: "Get Your Access Token",
      description: "Copy your default public token from the account page",
      action: "https://account.mapbox.com/access-tokens/",
      code: null,
    },
    {
      title: "Create Environment File",
      description: "Create a .env.local file in your project root",
      action: null,
      code: "MAPBOX_ACCESS_TOKEN=pk.your_mapbox_token_here",
    },
    {
      title: "Restart Development Server",
      description: "Restart your Next.js development server to load the new environment variables",
      action: null,
      code: "npm run dev",
    },
  ]

  return (
    <Card className="w-full max-w-2xl mx-auto card-gradient border-purple-500/30">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <MapPin className="h-5 w-5 mr-2 text-lime-400" />
          Mapbox Setup Guide
        </CardTitle>
        <CardDescription className="text-white/70">
          Follow these steps to enable real Mapbox maps for geofencing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-lime-500/20 border-lime-400/30">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-lime-200">
            <strong>Note:</strong> The app currently works with a mock map interface. Follow these steps to enable real
            Mapbox maps. Your API token will be kept secure on the server-side.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex-shrink-0">
                <Badge
                  variant="outline"
                  className="w-8 h-8 flex items-center justify-center bg-lime-500/20 text-lime-300 border-lime-400/30"
                >
                  {index + 1}
                </Badge>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-medium text-white">{step.title}</h3>
                <p className="text-sm text-white/70">{step.description}</p>

                {step.action && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="glass-effect text-white border-white/30 hover:bg-white/10"
                  >
                    <a href={step.action} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Link
                    </a>
                  </Button>
                )}

                {step.code && (
                  <div className="bg-black/30 p-3 rounded-md border border-white/20">
                    <div className="flex items-center justify-between">
                      <code className="text-sm font-mono text-lime-300">{step.code}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(step.code!, index)}
                        className="text-white/70 hover:bg-white/10 hover:text-white"
                      >
                        {copiedStep === index ? (
                          <Check className="h-4 w-4 text-lime-400" />
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

        <Alert className="bg-blue-500/20 border-blue-400/30">
          <Key className="h-4 w-4" />
          <AlertDescription className="text-blue-200">
            <strong>Free Tier:</strong> Mapbox offers 50,000 free map loads per month, which is perfect for development
            and small applications.
          </AlertDescription>
        </Alert>

        <div className="bg-purple-500/20 border border-purple-400/30 p-4 rounded-lg">
          <h4 className="font-medium mb-2 text-white">Why Mapbox?</h4>
          <ul className="text-sm space-y-1 text-white/70">
            <li>• Easy to set up and use</li>
            <li>• Generous free tier (50k requests/month)</li>
            <li>• Beautiful, customizable map styles</li>
            <li>• Excellent performance and reliability</li>
            <li>• Great documentation and support</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
