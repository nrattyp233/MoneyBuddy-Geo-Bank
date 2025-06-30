"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, Mail, Lock, User, ArrowRight } from "lucide-react"
import { MoneyBuddyLogo } from "@/components/money-buddy-logo"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Simulate registration process
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Store user data in multiple places for persistence
      const userData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        registeredAt: new Date().toISOString(),
        isAuthenticated: true,
      }

      // Store in localStorage
      localStorage.setItem("moneyBuddyUser", JSON.stringify(userData))

      // Store in sessionStorage as backup
      sessionStorage.setItem("moneyBuddyUser", JSON.stringify(userData))

      // Store individual fields as backup
      localStorage.setItem("userFirstName", userData.firstName)
      localStorage.setItem("userLastName", userData.lastName)
      localStorage.setItem("userFullName", userData.fullName)
      localStorage.setItem("userEmail", userData.email)
      localStorage.setItem("isAuthenticated", "true")

      console.log("User registered and data stored:", userData)

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Registration error:", error)
      setErrors({ submit: "Registration failed. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-lime-500 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-lime-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <Card className="w-full max-w-md border-2 border-white/30 bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <MoneyBuddyLogo className="w-16 h-16" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-purple-900 flex items-center justify-center">
              <UserPlus className="h-8 w-8 mr-2 text-lime-500" />
              Join Money Buddy
            </CardTitle>
            <CardDescription className="text-gray-700 font-medium text-lg mt-2">
              Create your account to start managing money with AI 🐵
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-purple-900 font-bold">
                  First Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`pl-10 border-2 focus:border-purple-400 bg-white font-medium ${
                      errors.firstName ? "border-red-400" : "border-purple-200"
                    }`}
                  />
                </div>
                {errors.firstName && <p className="text-red-600 text-sm font-medium">{errors.firstName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-purple-900 font-bold">
                  Last Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`pl-10 border-2 focus:border-purple-400 bg-white font-medium ${
                      errors.lastName ? "border-red-400" : "border-purple-200"
                    }`}
                  />
                </div>
                {errors.lastName && <p className="text-red-600 text-sm font-medium">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-purple-900 font-bold">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`pl-10 border-2 focus:border-purple-400 bg-white font-medium ${
                    errors.email ? "border-red-400" : "border-purple-200"
                  }`}
                />
              </div>
              {errors.email && <p className="text-red-600 text-sm font-medium">{errors.email}</p>}
            </div>

            {/* Password Fields */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-purple-900 font-bold">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`pl-10 border-2 focus:border-purple-400 bg-white font-medium ${
                    errors.password ? "border-red-400" : "border-purple-200"
                  }`}
                />
              </div>
              {errors.password && <p className="text-red-600 text-sm font-medium">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-purple-900 font-bold">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`pl-10 border-2 focus:border-purple-400 bg-white font-medium ${
                    errors.confirmPassword ? "border-red-400" : "border-purple-200"
                  }`}
                />
              </div>
              {errors.confirmPassword && <p className="text-red-600 text-sm font-medium">{errors.confirmPassword}</p>}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-medium">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white font-bold py-4 text-lg shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Create Account
                  <ArrowRight className="h-4 w-4 ml-2" />
                </div>
              )}
            </Button>

            {/* Login Link */}
            <div className="text-center pt-4">
              <p className="text-gray-600 font-medium">
                Already have an account?{" "}
                <Button
                  variant="link"
                  onClick={() => router.push("/auth/login")}
                  className="text-purple-600 hover:text-purple-800 font-bold p-0 h-auto"
                >
                  Sign in here
                </Button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
