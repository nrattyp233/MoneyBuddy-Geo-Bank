"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Shield, Bell, CreditCard, Smartphone, Mail } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function ProfilePage() {
  const [profileData, setProfileData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, New York, NY 10001",
    dateOfBirth: "1990-01-15",
  })

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    biometricAuth: false,
    emailNotifications: true,
    smsNotifications: true,
    transactionAlerts: true,
  })

  const [isEditing, setIsEditing] = useState(false)

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    setIsEditing(false)
    alert("Profile updated successfully!")
  }

  const handleSecurityToggle = (setting: string, value: boolean) => {
    setSecuritySettings((prev) => ({
      ...prev,
      [setting]: value,
    }))
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600">Manage your Money Buddy account information and security preferences</p>
        </div>

        {/* Profile Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription>Update your personal details associated with your Money Buddy account</CardDescription>
            </div>
            <Button variant={isEditing ? "default" : "outline"} onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6 mb-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/placeholder.svg?height=80&width=80" />
                <AvatarFallback className="text-lg">
                  {profileData.firstName[0]}
                  {profileData.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">
                  {profileData.firstName} {profileData.lastName}
                </h3>
                <p className="text-gray-600">{profileData.email}</p>
                <Badge variant="secondary" className="mt-1">
                  Verified Account
                </Badge>
              </div>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        firstName: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        lastName: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      email: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      phone: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={profileData.address}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      address: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      dateOfBirth: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                />
              </div>

              {isEditing && (
                <Button type="submit" className="w-full">
                  Save Changes
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Security & Authentication</span>
            </CardTitle>
            <CardDescription>Manage your Money Buddy account security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4 text-blue-600" />
                  <Label>Two-Factor Authentication</Label>
                </div>
                <p className="text-sm text-gray-500">Add an extra layer of security to your Money Buddy account</p>
              </div>
              <Switch
                checked={securitySettings.twoFactorAuth}
                onCheckedChange={(checked) => handleSecurityToggle("twoFactorAuth", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-green-600" />
                  <Label>Biometric Authentication</Label>
                </div>
                <p className="text-sm text-gray-500">
                  Use fingerprint or face recognition for quick access to your Money Buddy account
                </p>
              </div>
              <Switch
                checked={securitySettings.biometricAuth}
                onCheckedChange={(checked) => handleSecurityToggle("biometricAuth", checked)}
              />
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-4">Notification Preferences</h4>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-purple-600" />
                      <Label>Email Notifications</Label>
                    </div>
                    <p className="text-sm text-gray-500">Receive Money Buddy account updates via email</p>
                  </div>
                  <Switch
                    checked={securitySettings.emailNotifications}
                    onCheckedChange={(checked) => handleSecurityToggle("emailNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4 text-orange-600" />
                      <Label>SMS Notifications</Label>
                    </div>
                    <p className="text-sm text-gray-500">Receive Money Buddy alerts via text message</p>
                  </div>
                  <Switch
                    checked={securitySettings.smsNotifications}
                    onCheckedChange={(checked) => handleSecurityToggle("smsNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4 text-red-600" />
                      <Label>Transaction Alerts</Label>
                    </div>
                    <p className="text-sm text-gray-500">Get notified of all Money Buddy account activity</p>
                  </div>
                  <Switch
                    checked={securitySettings.transactionAlerts}
                    onCheckedChange={(checked) => handleSecurityToggle("transactionAlerts", checked)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>Manage your Money Buddy account settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <CreditCard className="mr-2 h-4 w-4" />
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Shield className="mr-2 h-4 w-4" />
              Download Account Data
            </Button>
            <Button variant="destructive" className="w-full justify-start">
              <User className="mr-2 h-4 w-4" />
              Close Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
