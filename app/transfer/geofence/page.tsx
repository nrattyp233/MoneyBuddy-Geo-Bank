"use client"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MapPin, DollarSign, Users, Clock, Search, Target, Trash2, Circle, Hand, Pencil } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/components/stack-auth-provider"
import type { Geofence } from "@/lib/neon"

interface AddressSuggestion {
  id: string
  place_name: string
  center: [number, number]
}

function GeofenceTransferContent() {
  const { user } = useAuth()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const drawRef = useRef<any>(null)
  const [geofences, setGeofences] = useState<Geofence[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [mapboxToken, setMapboxToken] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedRadius, setSelectedRadius] = useState(100)
  const [drawingMode, setDrawingMode] = useState<"click" | "draw" | "polygon">("click")
  const [drawnFeature, setDrawnFeature] = useState<any>(null)

  // Address search
  const [addressQuery, setAddressQuery] = useState("")
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    recipientEmail: "",
    memo: "",
    radius: 100,
  })

  // Load Mapbox token
  useEffect(() => {
    async function loadMapboxToken() {
      try {
        const response = await fetch("/api/mapbox/token")
        if (response.ok) {
          const data = await response.json()
          setMapboxToken(data.token)
        } else {
          console.error("Failed to load Mapbox token")
        }
      } catch (error) {
        console.error("Error loading Mapbox token:", error)
      }
    }
    loadMapboxToken()
  }, [])

  // Load existing geofences for the authenticated user
  useEffect(() => {
    if (user?.id) {
      loadExistingGeofences()
    }
  }, [user?.id])

  async function loadExistingGeofences() {
    if (!user?.id) return

    try {
      setLoading(true)
      const res = await fetch(`/api/geofences?userId=${user.id}`)
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setGeofences(data.geofences as Geofence[])
    } catch (error) {
      console.error("Error loading geofences:", error)
    } finally {
      setLoading(false)
    }
  }

  // Address search functionality
  async function searchAddresses(query: string) {
    if (query.length < 3) {
      setAddressSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const response = await fetch(`/api/mapbox/geocode?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setAddressSuggestions(data.features || [])
        setShowSuggestions(true)
      }
    } catch (error) {
      console.error("Error searching addresses:", error)
    }
  }

  function selectAddress(suggestion: AddressSuggestion) {
    const [lng, lat] = suggestion.center
    setSelectedLocation({ lat, lng })
    setAddressQuery(suggestion.place_name)
    setShowSuggestions(false)

    // Move map to selected location
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 15,
      })

      // Update preview circle
      updateGeofenceCircle(lat, lng, selectedRadius)
    }
  }

  // Initialize map when token is available
  useEffect(() => {
    if (!mapboxToken || !mapContainerRef.current) return

    const initializeMap = async () => {
      try {
        // Dynamically import Mapbox GL JS and Draw
        const [mapboxgl, MapboxDraw] = await Promise.all([import("mapbox-gl"), import("@mapbox/mapbox-gl-draw")])

        mapboxgl.default.accessToken = mapboxToken

        const map = new mapboxgl.default.Map({
          container: mapContainerRef.current!,
          style: "mapbox://styles/mapbox/streets-v12",
          center: [-74.006, 40.7128], // NYC
          zoom: 13,
        })

        // Initialize drawing controls
        const draw = new MapboxDraw.default({
          displayControlsDefault: false,
          controls: {
            point: true,
            polygon: true,
            trash: true,
          },
          defaultMode: "simple_select",
          styles: [
            // Point styles
            {
              id: "gl-draw-point",
              type: "circle",
              filter: ["all", ["==", "$type", "Point"], ["==", "meta", "feature"]],
              paint: {
                "circle-radius": 8,
                "circle-color": "#3b82f6",
                "circle-stroke-color": "#1d4ed8",
                "circle-stroke-width": 2,
              },
            },
            {
              id: "gl-draw-point-active",
              type: "circle",
              filter: ["all", ["==", "$type", "Point"], ["==", "active", "true"]],
              paint: {
                "circle-radius": 10,
                "circle-color": "#3b82f6",
                "circle-stroke-color": "#1d4ed8",
                "circle-stroke-width": 3,
              },
            },
            // Polygon styles
            {
              id: "gl-draw-polygon-fill",
              type: "fill",
              filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
              paint: {
                "fill-color": "#3b82f6",
                "fill-opacity": 0.3,
              },
            },
            {
              id: "gl-draw-polygon-stroke-active",
              type: "line",
              filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "true"]],
              paint: {
                "line-color": "#1d4ed8",
                "line-width": 3,
              },
            },
            {
              id: "gl-draw-polygon-stroke-inactive",
              type: "line",
              filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "false"]],
              paint: {
                "line-color": "#3b82f6",
                "line-width": 2,
              },
            },
            // Vertex styles
            {
              id: "gl-draw-polygon-and-line-vertex-active",
              type: "circle",
              filter: ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"]],
              paint: {
                "circle-radius": 5,
                "circle-color": "#ffffff",
                "circle-stroke-color": "#1d4ed8",
                "circle-stroke-width": 2,
              },
            },
          ],
        })

        map.addControl(draw, "top-left")
        drawRef.current = draw

        map.on("load", () => {
          // Add click handler for click mode
          map.on("click", (e) => {
            if (drawingMode === "click") {
              const { lng, lat } = e.lngLat
              setSelectedLocation({ lat, lng })
              updateGeofenceCircle(lat, lng, selectedRadius)

              // Clear any drawn features
              if (drawRef.current) {
                drawRef.current.deleteAll()
              }
              setDrawnFeature(null)
            }
          })

          // Handle drawing events
          map.on("draw.create", (e) => {
            const feature = e.features[0]
            setDrawnFeature(feature)

            if (feature.geometry.type === "Point") {
              const [lng, lat] = feature.geometry.coordinates
              setSelectedLocation({ lat, lng })
              updateGeofenceCircle(lat, lng, selectedRadius)
            } else if (feature.geometry.type === "Polygon") {
              // Calculate centroid for polygon
              const centroid = calculatePolygonCentroid(feature.geometry.coordinates[0])
              setSelectedLocation({ lat: centroid[1], lng: centroid[0] })

              // Calculate appropriate radius based on polygon size
              const radius = calculatePolygonRadius(feature.geometry.coordinates[0])
              setSelectedRadius(radius)
              updateGeofenceCircle(centroid[1], centroid[0], radius)
            }
          })

          map.on("draw.update", (e) => {
            const feature = e.features[0]
            setDrawnFeature(feature)

            if (feature.geometry.type === "Point") {
              const [lng, lat] = feature.geometry.coordinates
              setSelectedLocation({ lat, lng })
              updateGeofenceCircle(lat, lng, selectedRadius)
            } else if (feature.geometry.type === "Polygon") {
              const centroid = calculatePolygonCentroid(feature.geometry.coordinates[0])
              setSelectedLocation({ lat: centroid[1], lng: centroid[0] })

              const radius = calculatePolygonRadius(feature.geometry.coordinates[0])
              setSelectedRadius(radius)
              updateGeofenceCircle(centroid[1], centroid[0], radius)
            }
          })

          map.on("draw.delete", () => {
            setSelectedLocation(null)
            setDrawnFeature(null)
            clearGeofencePreview()
          })

          // Load existing geofences on map
          loadGeofencesOnMap()
        })

        mapRef.current = map

        return () => {
          map.remove()
        }
      } catch (error) {
        console.error("Error initializing map:", error)
      }
    }

    initializeMap()
  }, [mapboxToken])

  function calculatePolygonCentroid(coordinates: number[][]): [number, number] {
    let x = 0,
      y = 0
    for (const coord of coordinates) {
      x += coord[0]
      y += coord[1]
    }
    return [x / coordinates.length, y / coordinates.length]
  }

  function calculatePolygonRadius(coordinates: number[][]): number {
    const centroid = calculatePolygonCentroid(coordinates)
    let maxDistance = 0

    for (const coord of coordinates) {
      const distance = Math.sqrt(Math.pow(coord[0] - centroid[0], 2) + Math.pow(coord[1] - centroid[1], 2)) * 111000 // Convert to meters approximately
      maxDistance = Math.max(maxDistance, distance)
    }

    return Math.round(Math.max(50, Math.min(1000, maxDistance)))
  }

  function updateGeofenceCircle(lat: number, lng: number, radius: number) {
    if (!mapRef.current) return

    const map = mapRef.current

    // Remove existing circle
    clearGeofencePreview()

    // Add new circle
    map.addSource("geofence-preview", {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
      },
    })

    map.addLayer({
      id: "geofence-preview-circle",
      type: "circle",
      source: "geofence-preview",
      paint: {
        "circle-radius": {
          stops: [
            [0, 0],
            [20, radius / 2],
          ],
          base: 2,
        },
        "circle-color": "#3b82f6",
        "circle-opacity": 0.3,
        "circle-stroke-color": "#3b82f6",
        "circle-stroke-width": 2,
      },
    })

    // Add center marker
    if (typeof window !== "undefined" && (window as any).mapboxgl) {
      ;new (window as any).mapboxgl.Marker({ color: "#3b82f6" }).setLngLat([lng, lat]).addTo(map)
    }
  }

  function clearGeofencePreview() {
    if (!mapRef.current) return

    const map = mapRef.current
    if (map.getSource("geofence-preview")) {
      map.removeLayer("geofence-preview-circle")
      map.removeSource("geofence-preview")
    }
  }

  function loadGeofencesOnMap() {
    if (!mapRef.current) return

    geofences.forEach((geofence, index) => {
      const map = mapRef.current

      // Add marker for geofence center
      if (typeof window !== "undefined" && (window as any).mapboxgl) {
        ;new (window as any).mapboxgl.Marker({ color: "#22c55e" })
          .setLngLat([geofence.center_lng, geofence.center_lat])
          .setPopup(
            new (window as any).mapboxgl.Popup().setHTML(
              `<div class="p-2">
                <h3 class="font-semibold">${geofence.name}</h3>
                <p class="text-sm">$${geofence.amount}</p>
                <p class="text-xs text-gray-600">${geofence.radius}m radius</p>
              </div>`,
            ),
          )
          .addTo(map)
      }

      // Add circle for geofence radius
      map.addSource(`geofence-${index}`, {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [geofence.center_lng, geofence.center_lat],
          },
        },
      })

      map.addLayer({
        id: `geofence-circle-${index}`,
        type: "circle",
        source: `geofence-${index}`,
        paint: {
          "circle-radius": {
            stops: [
              [0, 0],
              [20, geofence.radius / 2],
            ],
            base: 2,
          },
          "circle-color": "#22c55e",
          "circle-opacity": 0.2,
          "circle-stroke-color": "#22c55e",
          "circle-stroke-width": 2,
        },
      })
    })
  }

  // Update circle when radius changes
  useEffect(() => {
    if (selectedLocation) {
      setFormData((prev) => ({ ...prev, radius: selectedRadius }))
      updateGeofenceCircle(selectedLocation.lat, selectedLocation.lng, selectedRadius)
    }
  }, [selectedRadius, selectedLocation])

  function clearSelection() {
    setSelectedLocation(null)
    setAddressQuery("")
    setDrawnFeature(null)
    clearGeofencePreview()

    if (drawRef.current) {
      drawRef.current.deleteAll()
    }
  }

  function switchDrawingMode(mode: "click" | "draw" | "polygon") {
    setDrawingMode(mode)
    clearSelection()

    if (drawRef.current) {
      if (mode === "draw") {
        drawRef.current.changeMode("draw_point")
      } else if (mode === "polygon") {
        drawRef.current.changeMode("draw_polygon")
      } else {
        drawRef.current.changeMode("simple_select")
      }
    }
  }

  async function handleCreateGeofence() {
    if (!selectedLocation || !formData.name || !formData.amount || !formData.recipientEmail || !user?.id) {
      alert("Please fill in all required fields and select a location")
      return
    }

    try {
      setCreating(true)

      const geofenceData = {
        user_id: user.id,
        name: formData.name,
        center_lat: selectedLocation.lat,
        center_lng: selectedLocation.lng,
        radius: selectedRadius,
        amount: Number.parseFloat(formData.amount),
        recipient_email: formData.recipientEmail,
        memo: formData.memo || null,
        is_active: true,
        is_claimed: false,
      }

      const res = await fetch("/api/geofences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geofenceData),
      })

      if (res.ok) {
        const { geofence: newGeofence } = await res.json()
        setGeofences((prev) => [newGeofence, ...prev])

        // Reset form
        setFormData({
          name: "",
          amount: "",
          recipientEmail: "",
          memo: "",
          radius: 100,
        })
        clearSelection()
        setSelectedRadius(100)

        alert("Geofence created successfully!")
        loadGeofencesOnMap()
      } else {
        const { error } = await res.json()
        alert(`Failed to create geofence: ${error}`)
      }
    } catch (error) {
      console.error("Error creating geofence:", error)
      alert("Error creating geofence")
    } finally {
      setCreating(false)
    }
  }

  if (!mapboxToken) {
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
                <Clock className="h-5 w-5" />
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Geofenced Transfers</h1>
            <p className="text-gray-600">Send money that can only be collected in specific locations</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Logged in as</p>
            <p className="font-semibold text-purple-900">{user?.displayName || user?.primaryEmail}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Map Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Define Geofence Area</span>
              </CardTitle>
              <CardDescription>Search for an address, click on the map, or draw to set location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Drawing Mode Toggle */}
                <div className="flex space-x-2">
                  <Button
                    variant={drawingMode === "click" ? "default" : "outline"}
                    size="sm"
                    onClick={() => switchDrawingMode("click")}
                    className="flex items-center space-x-2"
                  >
                    <Hand className="h-4 w-4" />
                    <span>Click</span>
                  </Button>
                  <Button
                    variant={drawingMode === "draw" ? "default" : "outline"}
                    size="sm"
                    onClick={() => switchDrawingMode("draw")}
                    className="flex items-center space-x-2"
                  >
                    <Circle className="h-4 w-4" />
                    <span>Point</span>
                  </Button>
                  <Button
                    variant={drawingMode === "polygon" ? "default" : "outline"}
                    size="sm"
                    onClick={() => switchDrawingMode("polygon")}
                    className="flex items-center space-x-2"
                  >
                    <Pencil className="h-4 w-4" />
                    <span>Area</span>
                  </Button>
                </div>

                {/* Mode Instructions */}
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {drawingMode === "click" && (
                    <p>
                      🖱️ <strong>Click Mode:</strong> Click anywhere on the map to place your geofence center
                    </p>
                  )}
                  {drawingMode === "draw" && (
                    <p>
                      📍 <strong>Point Mode:</strong> Use the point tool to place and drag points on the map
                    </p>
                  )}
                  {drawingMode === "polygon" && (
                    <p>
                      ✏️ <strong>Area Mode:</strong> Draw a custom area by clicking to create polygon vertices
                    </p>
                  )}
                </div>

                {/* Address Search */}
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search for an address..."
                      value={addressQuery}
                      onChange={(e) => {
                        setAddressQuery(e.target.value)
                        searchAddresses(e.target.value)
                      }}
                      className="pl-10"
                    />
                  </div>

                  {showSuggestions && addressSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                      {addressSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          onClick={() => selectAddress(suggestion)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{suggestion.place_name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Radius Control */}
                <div>
                  <Label htmlFor="radius-slider">Geofence Radius: {selectedRadius}m</Label>
                  <input
                    id="radius-slider"
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={selectedRadius}
                    onChange={(e) => setSelectedRadius(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>10m</span>
                    <span>1000m</span>
                  </div>
                </div>

                {/* Map */}
                <div
                  ref={mapContainerRef}
                  className="w-full h-96 rounded-lg border border-gray-200"
                  style={{ minHeight: "400px" }}
                />

                {/* Selected Location Info */}
                {selectedLocation && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Selected Location: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                      </p>
                      <p className="text-xs text-blue-600">
                        Radius: {selectedRadius}m • Mode:{" "}
                        {drawingMode === "click" ? "Click" : drawingMode === "draw" ? "Point" : "Area"}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearSelection}
                      className="text-blue-600 border-blue-200 hover:bg-blue-100 bg-transparent"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Transfer Form */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Transfer Details</span>
              </CardTitle>
              <CardDescription>Configure your geofenced money transfer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Geofence Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Coffee Shop Transfer"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="25.00"
                  value={formData.amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="recipient">Recipient Email</Label>
                <Input
                  id="recipient"
                  type="email"
                  placeholder="friend@example.com"
                  value={formData.recipientEmail}
                  onChange={(e) => setFormData((prev) => ({ ...prev, recipientEmail: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="memo">Memo (Optional)</Label>
                <Textarea
                  id="memo"
                  placeholder="Coffee money when you get to the shop!"
                  value={formData.memo}
                  onChange={(e) => setFormData((prev) => ({ ...prev, memo: e.target.value }))}
                />
              </div>

              <Button onClick={handleCreateGeofence} disabled={creating || !selectedLocation} className="w-full">
                {creating ? "Creating..." : "Create Geofence"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Existing Geofences List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Active Geofences ({geofences.length})
            </CardTitle>
            <CardDescription>Manage your location-based transfers</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading geofences...</p>
              </div>
            ) : geofences.length === 0 ? (
              <div className="text-center py-8">
                <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Geofences Yet</h3>
                <p className="text-gray-600">Create your first location-based transfer above</p>
              </div>
            ) : (
              <div className="space-y-4">
                {geofences.map((geofence) => (
                  <div key={geofence.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{geofence.name}</h3>
                        <p className="text-sm text-gray-600">To: {geofence.recipient_email}</p>
                        <p className="text-sm text-gray-600">
                          Location: {geofence.center_lat.toFixed(4)}, {geofence.center_lng.toFixed(4)}
                        </p>
                        {geofence.memo && <p className="text-sm text-gray-600 mt-1">"{geofence.memo}"</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">${geofence.amount.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{geofence.radius}m radius</p>
                        <Badge variant={geofence.is_claimed ? "secondary" : "default"} className="mt-1">
                          {geofence.is_claimed ? "Claimed" : "Active"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Created {new Date(geofence.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default function GeofenceTransferPage() {
  return (
    <AuthGuard>
      <GeofenceTransferContent />
    </AuthGuard>
  )
}
