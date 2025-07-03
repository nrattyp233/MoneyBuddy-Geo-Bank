"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, XCircle, AlertTriangle, Database, ExternalLink, Copy, RefreshCw, ArrowRight } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function SetupSupabasePage() {
  const [step, setStep] = useState(1)
  const [projectUrl, setProjectUrl] = useState("")
  const [anonKey, setAnonKey] = useState("")
  const [serviceKey, setServiceKey] = useState("")
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [envContent, setEnvContent] = useState("")

  const generateEnvContent = () => {
    const content = `# Supabase Database Configuration
SUPABASE_URL=${projectUrl}
SUPABASE_ANON_KEY=${anonKey}
SUPABASE_SERVICE_ROLE_KEY=${serviceKey}

# Public Supabase Keys (for client-side)
NEXT_PUBLIC_SUPABASE_URL=${projectUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}`

    setEnvContent(content)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  const testConnection = async () => {
    if (!projectUrl || !anonKey) {
      alert("Please fill in the Project URL and API Key first")
      return
    }

    setLoading(true)
    try {
      // Test the connection with the provided credentials
      const response = await fetch("/api/test-supabase-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: projectUrl,
          key: anonKey,
        }),
      })

      const result = await response.json()
      setTestResult(result)

      if (result.success) {
        generateEnvContent()
        setStep(4) // Success step
      }
    } catch (error) {
      setTestResult({
        success: false,
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <Database className="mx-auto h-12 w-12 text-blue-500 mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Setup New Supabase Project</h1>
          <p className="text-white/90">Let's create and connect a fresh Supabase database</p>
        </div>

        {/* Step Progress */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= stepNum ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {stepNum}
                </div>
                {stepNum < 4 && <div className="w-8 h-1 bg-gray-300 mx-2"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Create Supabase Project */}
        {step === 1 && (
          <Card className="border-2 border-white/20 bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Step 1: Create New Supabase Project</CardTitle>
              <CardDescription>First, let's create a brand new Supabase project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  We'll start fresh with a new Supabase project to avoid any configuration conflicts.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h4 className="font-semibold">Follow these steps:</h4>
                <ol className="list-decimal list-inside space-y-3 text-sm">
                  <li>
                    <strong>Go to Supabase:</strong> Visit{" "}
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      supabase.com/dashboard <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    <strong>Sign in or Sign up:</strong> Create an account if you don't have one
                  </li>
                  <li>
                    <strong>Create New Project:</strong> Click "New Project" button
                  </li>
                  <li>
                    <strong>Choose Organization:</strong> Select your organization (or create one)
                  </li>
                  <li>
                    <strong>Project Details:</strong>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      <li>Name: "Money Buddy" (or any name you prefer)</li>
                      <li>Database Password: Create a strong password (save it!)</li>
                      <li>Region: Choose closest to your location</li>
                      <li>Pricing Plan: Free tier is fine for development</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Create Project:</strong> Click "Create new project" and wait for it to initialize (2-3
                    minutes)
                  </li>
                </ol>
              </div>

              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Tip:</strong> Keep the Supabase dashboard tab open - you'll need it for the next step!
                </AlertDescription>
              </Alert>

              <Button onClick={() => setStep(2)} className="w-full" size="lg">
                I've Created My Project
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Get API Credentials */}
        {step === 2 && (
          <Card className="border-2 border-white/20 bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Step 2: Get Your API Credentials</CardTitle>
              <CardDescription>Now let's get the connection details from your new project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-semibold">In your Supabase dashboard:</h4>
                <ol className="list-decimal list-inside space-y-3 text-sm">
                  <li>
                    <strong>Go to Settings:</strong> Click the "Settings" icon (⚙️) in the left sidebar
                  </li>
                  <li>
                    <strong>Click "API":</strong> In the settings menu, click on "API"
                  </li>
                  <li>
                    <strong>Find these values:</strong>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      <li>
                        <strong>Project URL:</strong> Should look like{" "}
                        <code className="bg-gray-100 px-1 rounded">https://your-project-id.supabase.co</code>
                      </li>
                      <li>
                        <strong>anon public key:</strong> Long string starting with{" "}
                        <code className="bg-gray-100 px-1 rounded">eyJ...</code>
                      </li>
                      <li>
                        <strong>service_role key:</strong> Another long string (keep this secret!)
                      </li>
                    </ul>
                  </li>
                </ol>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Copy these values exactly as shown. Don't add or remove any characters.
                </AlertDescription>
              </Alert>

              <Button onClick={() => setStep(3)} className="w-full" size="lg">
                I Have My Credentials
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Enter Credentials */}
        {step === 3 && (
          <Card className="border-2 border-white/20 bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Step 3: Enter Your Credentials</CardTitle>
              <CardDescription>Paste the values from your Supabase dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="projectUrl">Project URL</Label>
                  <Input
                    id="projectUrl"
                    placeholder="https://your-project-id.supabase.co"
                    value={projectUrl}
                    onChange={(e) => setProjectUrl(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="anonKey">API Key (anon public)</Label>
                  <Textarea
                    id="anonKey"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    className="font-mono text-xs"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="serviceKey">Service Role Key (optional but recommended)</Label>
                  <Textarea
                    id="serviceKey"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={serviceKey}
                    onChange={(e) => setServiceKey(e.target.value)}
                    className="font-mono text-xs"
                    rows={3}
                  />
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Make sure there are no extra spaces or line breaks when pasting the keys.
                </AlertDescription>
              </Alert>

              <Button
                onClick={testConnection}
                disabled={loading || !projectUrl || !anonKey}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  "Test Connection"
                )}
              </Button>

              {testResult && !testResult.success && (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Connection Failed:</strong> {testResult.error}
                    <br />
                    <strong>Details:</strong> {testResult.details}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Success & Environment Setup */}
        {step === 4 && (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-6 w-6" />
                Connection Successful!
              </CardTitle>
              <CardDescription>
                Your Supabase project is connected. Now let's update your environment file.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-green-200 bg-green-100">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-green-800">
                  ✅ Successfully connected to your Supabase project!
                </AlertDescription>
              </Alert>

              <div>
                <h4 className="font-semibold mb-2">Update Your .env.local File</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Copy this content and replace the Supabase section in your .env.local file:
                </p>

                <div className="relative">
                  <Textarea value={envContent} readOnly className="font-mono text-xs bg-gray-50" rows={8} />
                  <Button
                    onClick={() => copyToClipboard(envContent)}
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Next Steps:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Copy the environment variables above</li>
                    <li>Paste them into your .env.local file (replace the old Supabase section)</li>
                    <li>Save the file</li>
                    <li>Restart your development server (stop and run npm run dev)</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button asChild>
                  <a href="/mobile-setup">Setup Database Tables</a>
                </Button>
                <Button asChild variant="outline">
                  <a href="/setup-results">Check Status</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
