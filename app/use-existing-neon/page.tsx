"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Database, ExternalLink, Copy, ArrowRight, Settings, Clock, Zap } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function UseExistingNeonPage() {
  const [step, setStep] = useState(1)
  const [envContent, setEnvContent] = useState("")

  const generateEnvContent = () => {
    const content = `# Neon Database Configuration
# Get these values from your Neon project: jolly-river-402
# Visit: https://console.neon.tech/app/projects/jolly-river-402

# Primary connection string (required)
DATABASE_URL=postgresql://username:password@ep-jolly-river-402.us-east-2.aws.neon.tech/neondb?sslmode=require

# Additional Neon environment variables (if available)
POSTGRES_URL=postgresql://username:password@ep-jolly-river-402.us-east-2.aws.neon.tech/neondb?sslmode=require
POSTGRES_PRISMA_URL=postgresql://username:password@ep-jolly-river-402.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=15
DATABASE_URL_UNPOOLED=postgresql://username:password@ep-jolly-river-402.us-east-2.aws.neon.tech/neondb?sslmode=require
POSTGRES_URL_NON_POOLING=postgresql://username:password@ep-jolly-river-402.us-east-2.aws.neon.tech/neondb?sslmode=require

# Individual components (optional)
POSTGRES_HOST=ep-jolly-river-402.us-east-2.aws.neon.tech
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_DATABASE=neondb`

    setEnvContent(content)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <Database className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Connect to Your Neon Database</h1>
          <p className="text-white/90">Project: "jolly-river-402" (Currently Suspended)</p>
        </div>

        {/* Step Progress */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= stepNum ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {stepNum}
                </div>
                {stepNum < 3 && <div className="w-8 h-1 bg-gray-300 mx-2"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Database Status */}
        {step === 1 && (
          <Card className="border-2 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <Clock className="h-6 w-6" />
                Database is Suspended
              </CardTitle>
              <CardDescription>
                Your Neon database "jolly-river-402" is currently suspended to save resources.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-yellow-200 bg-yellow-100">
                <Clock className="h-4 w-4" />
                <AlertDescription className="text-yellow-800">
                  <strong>Why is it suspended?</strong>
                  <br />
                  Neon automatically suspends databases after inactivity to save compute resources. This is normal and
                  helps reduce costs.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="font-semibold">What you need to do:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Get your database connection string from Neon console</li>
                  <li>Add it to your .env.local file</li>
                  <li>The database will automatically wake up when you connect</li>
                  <li>First connection may take 10-30 seconds</li>
                </ol>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(2)} className="flex-1">
                  Get Connection String
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button asChild variant="outline">
                  <a href="/vercel-neon-status">Check Status</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Get Connection String */}
        {step === 2 && (
          <Card className="border-2 border-white/20 bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Step 2: Get Your Connection String</CardTitle>
              <CardDescription>Get your database credentials from the Neon console</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-semibold">Follow these steps:</h4>
                <ol className="list-decimal list-inside space-y-3 text-sm">
                  <li>
                    <strong>Open Neon Console:</strong> Visit{" "}
                    <a
                      href="https://console.neon.tech/app/projects/jolly-river-402"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      your Neon project <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    <strong>Click "Connect":</strong> Look for the "Connect" button in the top right
                  </li>
                  <li>
                    <strong>Copy Connection String:</strong> You'll see something like:
                    <code className="block bg-gray-100 p-2 mt-1 text-xs rounded">
                      postgresql://username:password@ep-jolly-river-402.us-east-2.aws.neon.tech/neondb?sslmode=require
                    </code>
                  </li>
                  <li>
                    <strong>Note:</strong> The database will wake up automatically when you first connect
                  </li>
                </ol>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  <strong>Wake Up Time:</strong> The first connection to a suspended database takes 10-30 seconds. After
                  that, it stays active for a while and responds quickly.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    generateEnvContent()
                    setStep(3)
                  }}
                  className="flex-1"
                >
                  I Have the Connection String
                </Button>
                <Button asChild variant="outline">
                  <a
                    href="https://console.neon.tech/app/projects/jolly-river-402"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open Neon Console <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Update Environment */}
        {step === 3 && (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-6 w-6" />
                Update Your Environment Variables
              </CardTitle>
              <CardDescription>Add your Neon database connection to .env.local</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-green-200 bg-green-100">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-green-800">
                  Replace the placeholder values with your actual connection string from Neon console.
                </AlertDescription>
              </Alert>

              <div>
                <h4 className="font-semibold mb-2">Add to Your .env.local File</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Replace the username, password, and other details with your actual values:
                </p>

                <div className="relative">
                  <textarea
                    value={envContent}
                    readOnly
                    className="w-full h-64 p-3 font-mono text-xs bg-gray-50 border rounded-md resize-none"
                  />
                  <Button
                    onClick={() => copyToClipboard(envContent)}
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy Template
                  </Button>
                </div>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Only the DATABASE_URL is required. The other variables are optional but
                  can be useful for different connection scenarios.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="font-semibold">Next Steps:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Replace the placeholder values with your actual Neon credentials</li>
                  <li>Save your .env.local file</li>
                  <li>Restart your development server (npm run dev)</li>
                  <li>Test the connection (it will wake up the database)</li>
                  <li>Create the required tables</li>
                </ol>
              </div>

              <div className="flex gap-3">
                <Button asChild>
                  <a href="/vercel-neon-status">Test Connection & Wake Up Database</a>
                </Button>
                <Button asChild variant="outline">
                  <a href="/setup-neon-database">Create Tables</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
