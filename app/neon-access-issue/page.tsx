"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, ExternalLink, UserX, Plus, Settings, ArrowRight, CheckCircle, Copy } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function NeonAccessIssuePage() {
  const [step, setStep] = useState(1)
  const [envContent, setEnvContent] = useState("")

  const generateNewProjectEnv = () => {
    const content = `# Neon Database Configuration
# Replace with your NEW Neon project credentials

# Primary connection string (required)
DATABASE_URL=postgresql://username:password@ep-your-new-project.us-east-2.aws.neon.tech/neondb?sslmode=require

# Additional environment variables
POSTGRES_URL=postgresql://username:password@ep-your-new-project.us-east-2.aws.neon.tech/neondb?sslmode=require
POSTGRES_PRISMA_URL=postgresql://username:password@ep-your-new-project.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=15
DATABASE_URL_UNPOOLED=postgresql://username:password@ep-your-new-project.us-east-2.aws.neon.tech/neondb?sslmode=require
POSTGRES_URL_NON_POOLING=postgresql://username:password@ep-your-new-project.us-east-2.aws.neon.tech/neondb?sslmode=require

# Individual components
POSTGRES_HOST=ep-your-new-project.us-east-2.aws.neon.tech
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
          <UserX className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Neon Database Access Issue</h1>
          <p className="text-white/90">You don't have access to the "neon-emerald-queen" project</p>
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

        {/* Step 1: Problem Explanation */}
        {step === 1 && (
          <Card className="border-2 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-6 w-6" />
                Access Denied to Neon Project
              </CardTitle>
              <CardDescription>
                You don't have permissions to access the "neon-emerald-queen" database project.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-red-200 bg-red-100">
                <UserX className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  <strong>Error:</strong> "user has no access to projects"
                  <br />
                  <strong>Project:</strong> neon-emerald-queen
                  <br />
                  <strong>Issue:</strong> This project belongs to someone else or you're not logged in with the right
                  account
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="font-semibold">Possible Solutions:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h5 className="font-semibold text-sm mb-2">Option 1: Get Access</h5>
                    <ul className="text-xs space-y-1 list-disc list-inside">
                      <li>Ask the project owner to invite you</li>
                      <li>Check if you're logged in with the right account</li>
                      <li>Verify your email address in Neon</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg bg-green-50">
                    <h5 className="font-semibold text-sm mb-2">Option 2: Create New (Recommended)</h5>
                    <ul className="text-xs space-y-1 list-disc list-inside">
                      <li>Create your own Neon project</li>
                      <li>Full control and access</li>
                      <li>Free tier available</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(2)} className="flex-1">
                  Create New Project (Recommended)
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button asChild variant="outline">
                  <a href="https://console.neon.tech" target="_blank" rel="noopener noreferrer">
                    Check Neon Console <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Create New Project */}
        {step === 2 && (
          <Card className="border-2 border-white/20 bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-6 w-6" />
                Create Your Own Neon Project
              </CardTitle>
              <CardDescription>Set up a new Neon database project that you'll have full access to</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-semibold">Step-by-Step Instructions:</h4>
                <ol className="list-decimal list-inside space-y-3 text-sm">
                  <li>
                    <strong>Go to Neon Console:</strong>{" "}
                    <a
                      href="https://console.neon.tech"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      console.neon.tech <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    <strong>Sign in or Sign up:</strong> Make sure you're logged in with your account
                  </li>
                  <li>
                    <strong>Click "Create Project":</strong> Look for the green "Create Project" button
                  </li>
                  <li>
                    <strong>Choose settings:</strong>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      <li>
                        <strong>Name:</strong> "money-buddy-db" (or any name you like)
                      </li>
                      <li>
                        <strong>Region:</strong> Choose closest to you (US East, EU, etc.)
                      </li>
                      <li>
                        <strong>PostgreSQL Version:</strong> Latest (default)
                      </li>
                      <li>
                        <strong>Plan:</strong> Free tier is perfect for development
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>Click "Create Project":</strong> Wait for it to be created (takes ~30 seconds)
                  </li>
                  <li>
                    <strong>Copy Connection String:</strong> You'll see a connection string like:
                    <code className="block bg-gray-100 p-2 mt-1 text-xs rounded">
                      postgresql://username:password@ep-your-project.region.aws.neon.tech/neondb?sslmode=require
                    </code>
                  </li>
                </ol>
              </div>

              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-green-800">
                  <strong>Benefits of Your Own Project:</strong>
                  <br />• Full control and access • Free tier with 0.5GB storage • No permission issues • Perfect for
                  Money Buddy development
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    generateNewProjectEnv()
                    setStep(3)
                  }}
                  className="flex-1"
                >
                  I Created My Project
                </Button>
                <Button asChild variant="outline">
                  <a href="https://console.neon.tech" target="_blank" rel="noopener noreferrer">
                    Open Neon Console <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Configure Environment */}
        {step === 3 && (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-6 w-6" />
                Configure Your New Database
              </CardTitle>
              <CardDescription>Add your new Neon project credentials to Money Buddy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-green-200 bg-green-100">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-green-800">
                  Great! Now you have your own Neon project with full access.
                </AlertDescription>
              </Alert>

              <div>
                <h4 className="font-semibold mb-2">Add to Your .env.local File</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Replace the placeholder values with your actual connection string from your new project:
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
                  <strong>Important:</strong> Only the DATABASE_URL is required. Replace the entire connection string
                  with the one from your new Neon project.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="font-semibold">Next Steps:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Replace the placeholder connection string with your actual Neon credentials</li>
                  <li>Save your .env.local file</li>
                  <li>Restart your development server (npm run dev)</li>
                  <li>Test the connection to your new database</li>
                  <li>Create the required tables for Money Buddy</li>
                </ol>
              </div>

              <div className="flex gap-3">
                <Button asChild>
                  <a href="/api/test-neon-connection">Test New Connection</a>
                </Button>
                <Button asChild variant="outline">
                  <a href="/setup-neon-database">Create Tables</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alternative Solutions */}
        <Card className="border-2 border-white/20 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Alternative Solutions
            </CardTitle>
            <CardDescription>Other ways to resolve the access issue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <UserX className="h-4 w-4" />
                  Get Access to Existing Project
                </h5>
                <ul className="text-xs space-y-1 list-disc list-inside">
                  <li>Contact the project owner</li>
                  <li>Ask them to invite you as a collaborator</li>
                  <li>Check if you're using the right Neon account</li>
                  <li>Verify your email is confirmed in Neon</li>
                </ul>
                <Button asChild size="sm" variant="outline" className="mt-2 w-full bg-transparent">
                  <a href="https://console.neon.tech" target="_blank" rel="noopener noreferrer">
                    Check Account <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </div>

              <div className="p-4 border rounded-lg bg-green-50">
                <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Project (Recommended)
                </h5>
                <ul className="text-xs space-y-1 list-disc list-inside">
                  <li>Full control over your database</li>
                  <li>Free tier with 0.5GB storage</li>
                  <li>No permission dependencies</li>
                  <li>Perfect for development</li>
                </ul>
                <Button asChild size="sm" className="mt-2 w-full">
                  <a href="https://console.neon.tech" target="_blank" rel="noopener noreferrer">
                    Create Project <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
