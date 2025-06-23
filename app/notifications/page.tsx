"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Bell, Smartphone, Mail, MessageSquare, Shield, Info } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import NotificationService from "@/lib/notification-service"

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState({
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    lockedAccountMaturity: true,
    feeCollections: true,
    transactionUpdates: true,
    securityAlerts: true,
    marketing: false,
  })

  const [pushSupported, setPushSupported] = useState(false)
  const [pushPermission, setPushPermission] = useState<NotificationPermission>("default")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const router = useRouter()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/auth/login")
    }

    // Check push notification support
    setPushSupported("Notification" in window && "serviceWorker" in navigator && "PushManager" in window)
    setPushPermission(Notification.permission)

    // Load saved settings
    loadSettings()
  }, [router])

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem("notificationSettings")
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
    } catch (error) {
      console.error("Failed to load notification settings:", error)
    }
  }

  const saveSettings = async () => {
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // Save to localStorage (in real app, this would be an API call)
      localStorage.setItem("notificationSettings", JSON.stringify(settings))

      // If push notifications are enabled, request permission and subscribe
      if (settings.pushEnabled && pushSupported) {
        const hasPermission = await NotificationService.requestPermission()
        if (hasPermission) {
          const userId = localStorage.getItem("userEmail") || "demo-user"
          await NotificationService.subscribeToPush(userId)
          setPushPermission("granted")
        } else {
          setSettings((prev) => ({ ...prev, pushEnabled: false }))
          setError("Push notification permission denied. Please enable in browser settings.")
        }
      }

      setSuccess("Notification settings saved successfully!")
    } catch (err) {
      setError("Failed to save notification settings. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const testNotification = async () => {
    if (!pushSupported || pushPermission !== "granted") {
      setError("Push notifications are not available or not permitted.")
      return
    }

    try {
      const userId = localStorage.getItem("userEmail") || "demo-user"
      await NotificationService.sendPushNotification({
        type: "general",
        title: "Test Notification",
        message: "This is a test notification from SecureBank!",
        data: { test: true },
        priority: "normal",
        userId,
      })
      setSuccess("Test notification sent!")
    } catch (err) {
      setError("Failed to send test notification.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <Bell className="h-6 w-6 text-blue-600 mr-3" />
            <h1 className="text-xl font-bold text-gray-900">Notification Settings</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Push Notification Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Smartphone className="h-5 w-5 mr-2" />
              Push Notification Status
            </CardTitle>
            <CardDescription>Current status of browser push notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Browser Support:</span>
                  <Badge variant={pushSupported ? "default" : "destructive"}>
                    {pushSupported ? "Supported" : "Not Supported"}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Permission:</span>
                  <Badge
                    variant={
                      pushPermission === "granted"
                        ? "default"
                        : pushPermission === "denied"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {pushPermission === "granted"
                      ? "Granted"
                      : pushPermission === "denied"
                        ? "Denied"
                        : "Not Requested"}
                  </Badge>
                </div>
              </div>
              <Button onClick={testNotification} variant="outline" size="sm">
                Test Notification
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Channels */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Notification Channels</CardTitle>
            <CardDescription>Choose how you want to receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Push Notifications
                </Label>
                <p className="text-sm text-gray-500">Receive notifications directly in your browser</p>
              </div>
              <Switch
                checked={settings.pushEnabled}
                onCheckedChange={(checked) => handleSettingChange("pushEnabled", checked)}
                disabled={!pushSupported}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Notifications
                </Label>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <Switch
                checked={settings.emailEnabled}
                onCheckedChange={(checked) => handleSettingChange("emailEnabled", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  SMS Notifications
                </Label>
                <p className="text-sm text-gray-500">Receive notifications via text message</p>
              </div>
              <Switch
                checked={settings.smsEnabled}
                onCheckedChange={(checked) => handleSettingChange("smsEnabled", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Types */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Notification Types</CardTitle>
            <CardDescription>Choose which types of notifications you want to receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Locked Account Maturity</Label>
                <p className="text-sm text-gray-500">
                  Get notified when your locked savings accounts are about to mature or have matured
                </p>
              </div>
              <Switch
                checked={settings.lockedAccountMaturity}
                onCheckedChange={(checked) => handleSettingChange("lockedAccountMaturity", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Fee Collections</Label>
                <p className="text-sm text-gray-500">
                  Get notified when transaction fees or early withdrawal penalties are collected
                </p>
              </div>
              <Switch
                checked={settings.feeCollections}
                onCheckedChange={(checked) => handleSettingChange("feeCollections", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Transaction Updates</Label>
                <p className="text-sm text-gray-500">Get notified about transaction status changes and completions</p>
              </div>
              <Switch
                checked={settings.transactionUpdates}
                onCheckedChange={(checked) => handleSettingChange("transactionUpdates", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Alerts
                </Label>
                <p className="text-sm text-gray-500">Get notified about important security events and login attempts</p>
              </div>
              <Switch
                checked={settings.securityAlerts}
                onCheckedChange={(checked) => handleSettingChange("securityAlerts", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Marketing & Promotions</Label>
                <p className="text-sm text-gray-500">Receive updates about new features and promotional offers</p>
              </div>
              <Switch
                checked={settings.marketing}
                onCheckedChange={(checked) => handleSettingChange("marketing", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Information */}
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Push notifications require browser permission and may not work in
            private/incognito mode. You can always manage these settings later from your profile page.
          </AlertDescription>
        </Alert>

        {/* Save Button */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end">
          <Button onClick={saveSettings} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  )
}
