"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MapPin, Send, Clock, AlertCircle, Target, CheckCircle } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { createGeofence, getUserGeofences, createTransaction, type Geofence } from "@/lib/supabase"

declare global {
  interface Window {
    mapboxgl: any
  }
}

export default function GeofenceTransferPage() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [isDrawingMode, setIsDrawingMode] = useState(false)
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [drawingCenter, setDrawingCenter] = useState<[number, number] | null>(null)
  const [currentRadius, setCurrentRadius] = useState(0)
  const [selectedGeofence, setSelectedGeofence] = useState<{
    center: [number, number]
    radius: number
    name: string
  } | null>(null)
  const [existingGeofences, setExistingGeofences] = useState<Geofence[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [mapboxToken, setMapboxToken] = useState<string | null>(null)

  const [transferData, setTransferData] = useState({
    recipient: "",
    amount: "",
    memo: "",
    timeLimit: "24",
  })

  // Fetch Mapbox token from server
  useEffect(() => {
    fetch("/api/mapbox/token")
      .then((res) => res.json())
      .then((data) => setMapboxToken(data.token))
      .catch((err) => console.error("Failed to fetch Mapbox token:", err))
  }, [])

  // Check if token is valid (not a placeholder)
  const isValidToken =
    mapboxToken &&
    mapboxToken.startsWith("pk.") &&
    !mapboxToken.includes("your_mapbox_token_here") &&
    mapboxToken.length > 20

  useEffect(() => {
    if (!isValidToken || !mapContainer.current) return

    // Load Mapbox GL JS
    const script = document.createElement("script")
    script.src = "https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js"
    script.onload = initializeMap
    document.head.appendChild(script)

    const link = document.createElement("link")
    link.href = "https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css"
    link.rel = "stylesheet"
    document.head.appendChild(link)

    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [isValidToken, mapboxToken])

  useEffect(() => {
    loadExistingGeofences()
  }, [])

  const loadExistingGeofences = async () => {
    try {
      const userData = localStorage.getItem("moneyBuddyUser")
      if (!userData) return

      const user = JSON.parse(userData)
      const geofences = await getUserGeofences(user.id || "demo-user")
      setExistingGeofences(geofences)
    } catch (error) {
      console.error("Error loading geofences:", error)
    }
  }

  const initializeMap = () => {
    if (!window.mapboxgl || map.current || !mapboxToken) return

    window.mapboxgl.accessToken = mapboxToken

    map.current = new window.mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-74.006, 40.7128], // NYC default
      zoom: 12,
    })

    map.current.on("load", () => {
      setIsMapLoaded(true)
      getUserLocation()
      setupMapEventHandlers()
      displayExistingGeofences()
    })
  }

  const setupMapEventHandlers = () => {
    if (!map.current) return

    map.current.on("mousedown", handleMouseDown)
    map.current.on("mousemove", handleMouseMove)
    map.current.on("mouseup", handleMouseUp)
  }

  const handleMouseDown = (e: any) => {
    if (!isDrawingMode) return

    e.preventDefault()
    setIsMouseDown(true)
    const center: [number, number] = [e.lngLat.lng, e.lngLat.lat]
    setDrawingCenter(center)
    setCurrentRadius(0)

    // Disable map interactions during drawing
    map.current.dragPan.disable()
    map.current.scrollZoom.disable()
  }

  const handleMouseMove = (e: any) => {
    if (!isDrawingMode || !isMouseDown || !drawingCenter) return

    const currentPoint: [number, number] = [e.lngLat.lng, e.lngLat.lat]
    const radius = calculateDistance(drawingCenter, currentPoint)
    setCurrentRadius(Math.max(radius, 50)) // Minimum 50 meters

    updateDrawingCircle(drawingCenter, Math.max(radius, 50))
  }

  const handleMouseUp = () => {
    if (!isDrawingMode || !isMouseDown || !drawingCenter) return

    setIsMouseDown(false)
    const finalRadius = Math.max(currentRadius, 50)

    // Re-enable map interactions
    map.current.dragPan.enable()
    map.current.scrollZoom.enable()

    // Set the selected geofence
    setSelectedGeofence({
      center: drawingCenter,
      radius: finalRadius,
      name: `Geofence at ${drawingCenter[1].toFixed(4)}, ${drawingCenter[0].toFixed(4)}`,
    })

    // Exit drawing mode
    setIsDrawingMode(false)
    clearDrawingCircle()
  }

  const updateDrawingCircle = (center: [number, number], radius: number) => {
    if (!map.current) return

    const circleCoords = createCircleCoordinates(center, radius)

    if (map.current.getSource("drawing-circle")) {
      map.current.getSource("drawing-circle").setData({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [circleCoords],
        },
      })
    } else {
      map.current.addSource("drawing-circle", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [circleCoords],
          },
        },
      })

      map.current.addLayer({
        id: "drawing-circle-fill",
        type: "fill",
        source: "drawing-circle",
        paint: {
          "fill-color": "#10b981",
          "fill-opacity": 0.3,
        },
      })

      map.current.addLayer({
        id: "drawing-circle-stroke",
        type: "line",
        source: "drawing-circle",
        paint: {
          "line-color": "#10b981",
          "line-width": 3,
        },
      })
    }
  }

  const clearDrawingCircle = () => {
    if (!map.current) return

    if (map.current.getLayer("drawing-circle-fill")) {
      map.current.removeLayer("drawing-circle-fill")
    }
    if (map.current.getLayer("drawing-circle-stroke")) {
      map.current.removeLayer("drawing-circle-stroke")
    }
    if (map.current.getSource("drawing-circle")) {
      map.current.removeSource("drawing-circle")
    }
  }

  const displayExistingGeofences = () => {
    if (!map.current || !existingGeofences.length) return

    existingGeofences.forEach((geofence, index) => {
      const circleCoords = createCircleCoordinates([geofence.center_lng, geofence.center_lat], geofence.radius)
      const sourceId = `geofence-${index}`

      map.current.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [circleCoords],
          },
        },
      })

      map.current.addLayer({
        id: `${sourceId}-fill`,
        type: "fill",
        source: sourceId,
        paint: {
          "fill-color": "#8b5cf6",
          "fill-opacity": 0.2,
        },
      })

      map.current.addLayer({
        id: `${sourceId}-stroke`,
        type: "line",
        source: sourceId,
        paint: {
          "line-color": "#8b5cf6",
          "line-width": 2,
        },
      })
    })
  }

  const createCircleCoordinates = (center: [number, number], radiusInMeters: number) => {
    const points = 64
    const coords = []
    const distanceX = radiusInMeters / (111320 * Math.cos((center[1] * Math.PI) / 180))
    const distanceY = radiusInMeters / 110540

    for (let i = 0; i < points; i++) {
      const theta = (i / points) * (2 * Math.PI)
      const x = distanceX * Math.cos(theta)
      const y = distanceY * Math.sin(theta)
      coords.push([center[0] + x, center[1] + y])
    }
    coords.push(coords[0]) // Close the polygon
    return coords
  }

  const calculateDistance = (point1: [number, number], point2: [number, number]) => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (point1[1] * Math.PI) / 180
    const φ2 = (point2[1] * Math.PI) / 180
    const Δφ = ((point2[1] - point1[1]) * Math.PI) / 180
    const Δλ = ((point2[0] - point1[0]) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: [number, number] = [position.coords.longitude, position.coords.latitude]
          setUserLocation(location)
          if (map.current) {
            map.current.setCenter(location)
            map.current.setZoom(14)

            // Add user location marker
            new window.mapboxgl.Marker({ color: "#ef4444" }).setLngLat(location).addTo(map.current)
          }
        },
        (error) => {
          console.error("Error getting user location:", error)
        },
      )
    }
  }

  const startDrawing = () => {
    setIsDrawingMode(true)
    setSelectedGeofence(null)
    clearDrawingCircle()
    if (map.current) {
      map.current.getCanvas().style.cursor = "crosshair"
    }
  }

  const cancelDrawing = () => {
    setIsDrawingMode(false)
    setIsMouseDown(false)
    setDrawingCenter(null)
    setCurrentRadius(0)
    clearDrawingCircle()
    if (map.current) {
      map.current.getCanvas().style.cursor = ""
      map.current.dragPan.enable()
      map.current.scrollZoom.enable()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTransferData({
      ...transferData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGeofence) return

    setIsLoading(true)

    try {
      const userData = localStorage.getItem("moneyBuddyUser")
      if (!userData) {
        throw new Error("User not authenticated")
      }

      const user = JSON.parse(userData)
      const userId = user.id || "demo-user"

      // Create geofence in database
      const geofenceData = {
        user_id: userId,
        name: selectedGeofence.name,
        center_lat: selectedGeofence.center[1],
        center_lng: selectedGeofence.center[0],
        radius: selectedGeofence.radius,
        amount: Number.parseFloat(transferData.amount),
        recipient_email: transferData.recipient,
        memo: transferData.memo,
        is_active: true,
        is_claimed: false,
        expires_at: transferData.timeLimit
          ? new Date(Date.now() + Number.parseInt(transferData.timeLimit) * 60 * 60 * 1000).toISOString()
          : null,
      }

      const geofence = await createGeofence(geofenceData)

      if (geofence) {
        // Create transaction record
        const transactionData = {
          user_id: userId,
          type: "geofence_transfer" as const,
          amount: Number.parseFloat(transferData.amount),
          fee: Number.parseFloat(transferData.amount) * 0.02, // 2% fee
          description: `Geofenced transfer to ${transferData.recipient}`,
          recipient_email: transferData.recipient,
          status: "pending" as const,
          metadata: {
            geofence_id: geofence.id,
            memo: transferData.memo,
            expires_at: geofenceData.expires_at,
          },
        }

        await createTransaction(transactionData)

        alert("Geofenced transfer created successfully!")

        // Reset form
        setTransferData({
          recipient: "",
          amount: "",
          memo: "",
          timeLimit: "24",
        })
        setSelectedGeofence(null)

        // Reload geofences
        await loadExistingGeofences()
      }
    } catch (error) {
      console.error("Error creating geofenced transfer:", error)
      alert("Failed to create geofenced transfer. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isValidToken) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Geofenced Transfers</h1>
            <p className="text-gray-600">Send money that can only be collected in specific locations</p>
          </div>

          <Card className="border-2 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <span>Mapbox Configuration Required</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-red-700">
                  To use geofenced transfers, you need to configure your Mapbox access token.
                </p>
                <div className="bg-red-100 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">Setup Instructions:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-red-700 text-sm">
                    <li>
                      Go to{" "}
                      <a
                        href="https://account.mapbox.com/"
                        className="underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Mapbox Account
                      </a>
                    </li>
                    <li>Create a new access token or copy your existing token</li>
                    <li>Add it to your environment variables as MAPBOX_ACCESS_TOKEN</li>
                    <li>Restart your development server</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Geofenced Transfers</h1>
          <p className="text-gray-600">Send money that can only be collected in specific locations</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Map Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Select Location</span>
              </CardTitle>
              <CardDescription>
                {isDrawingMode
                  ? "Click and drag to draw a circle for your geofence area"
                  : "Choose where the recipient can collect the funds"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isDrawingMode && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-800">Drawing Mode Active</p>
                        <p className="text-sm text-blue-600">
                          Click and drag on the map to create your geofence circle
                          {currentRadius > 0 && ` (${Math.round(currentRadius)}m radius)`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedGeofence && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">Geofence Selected</p>
                        <p className="text-sm text-green-600">Radius: {Math.round(selectedGeofence.radius)} meters</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  {!isDrawingMode ? (
                    <Button onClick={startDrawing} className="flex items-center space-x-2">
                      <Target className="h-4 w-4" />
                      <span>Draw Circle</span>
                    </Button>
                  ) : (
                    <Button onClick={cancelDrawing} variant="outline">
                      Cancel Drawing
                    </Button>
                  )}
                </div>

                <div
                  ref={mapContainer}
                  className="w-full h-96 rounded-lg border border-gray-200"
                  style={{ minHeight: "400px" }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Transfer Form */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="h-5 w-5" />
                <span>Transfer Details</span>
              </CardTitle>
              <CardDescription>Configure your geofenced money transfer</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Email</Label>
                  <Input
                    id="recipient"
                    name="recipient"
                    type="email"
                    placeholder="recipient@example.com"
                    value={transferData.recipient}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={transferData.amount}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="memo">Memo (Optional)</Label>
                  <Textarea
                    id="memo"
                    name="memo"
                    placeholder="What's this for?"
                    value={transferData.memo}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeLimit">Time Limit (hours)</Label>
                  <Input
                    id="timeLimit"
                    name="timeLimit"
                    type="number"
                    min="1"
                    max="168"
                    value={transferData.timeLimit}
                    onChange={handleInputChange}
                  />
                </div>

                {transferData.amount && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div className="space-y-2">
                        <h4 className="font-medium text-yellow-800">Transaction Summary</h4>
                        <div className="text-sm text-yellow-700 space-y-1">
                          <p>Transfer Amount: ${Number.parseFloat(transferData.amount).toFixed(2)}</p>
                          <p>Money Buddy Fee (2%): ${(Number.parseFloat(transferData.amount) * 0.02).toFixed(2)}</p>
                          <p className="font-medium">
                            Total Deducted: ${(Number.parseFloat(transferData.amount) * 1.02).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={!selectedGeofence || isLoading}>
                  {isLoading ? "Creating Transfer..." : "Create Geofenced Transfer"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Existing Geofences */}
        {existingGeofences.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Active Geofences</CardTitle>
              <CardDescription>Manage your existing geofenced transfers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {existingGeofences.map((geofence) => (
                  <div
                    key={geofence.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{geofence.name}</p>
                        <p className="text-sm text-gray-500">
                          ${geofence.amount} to {geofence.recipient_email}
                        </p>
                        <p className="text-sm text-gray-500">Radius: {geofence.radius}m</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        className={geofence.is_claimed ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}
                      >
                        {geofence.is_claimed ? "Claimed" : "Active"}
                      </Badge>
                      {geofence.expires_at && (
                        <p className="text-sm text-gray-500 mt-1">
                          <Clock className="h-3 w-3 inline mr-1" />
                          Expires: {new Date(geofence.expires_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
