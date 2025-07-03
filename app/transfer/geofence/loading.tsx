import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, DollarSign } from "lucide-react"

export default function GeofenceLoading() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Geofenced Transfers</h1>
          <p className="text-gray-600">Send money that can only be collected in specific locations</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Map Section Loading */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Define Geofence Area</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>

          {/* Form Section Loading */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Transfer Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        </div>

        {/* Geofences List Loading */}
        <Card>
          <CardHeader>
            <CardTitle>Your Active Geofences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading geofences...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
