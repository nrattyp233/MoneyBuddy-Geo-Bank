"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Plus, Minus, Search, Navigation, Target } from "lucide-react"
import MapboxStatusCheck from "./mapbox-status-check"

interface EnhancedMapboxGeofenceProps {
  onGeofenceSelect: (center: { lat: number; lng: number }, radius: number) => void
  center?: { lat: number; lng: number } | null
  radius?: number
}

declare global {
  interface Window {
    mapboxgl: any
    mapboxInitialized?: boolean
  }
}

export default function EnhancedMapboxGeofence({
  onGeofenceSelect,
  center,
  radius = 1000,
}: EnhancedMapboxGeofenceProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [currentRadius, setCurrentRadius] = useState(radius)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [useMockMap, setUseMockMap] = useState(false)
  const [geofenceCenter, setGeofenceCenter] = useState(center)
  const [searchQuery, setSearchQuery] = useState("")
  const [mapStyle, setMapStyle] = useState("streets-v12")
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [mockCenter, setMockCenter] = useState(center || { lat: 40.7128, lng: -74.006 })
  const markerRef = useRef<any>(null)
  const circleLayerId = "geofence-circle"

  // Predefined locations for quick selection
  const quickLocations = [
    { name: "Times Square, NYC", lat: 40.758, lng: -73.9855 },
    { name: "Central Park, NYC", lat: 40.7829, lng: -73.9654 },
    { name: "Brooklyn Bridge", lat: 40.7061, lng: -73.9969 },
    { name: "Wall Street", lat: 40.7074, lng: -74.0113 },
  ]

  // Map styles
  const mapStyles = [
    { value: "streets-v12", label: "Streets" },
    { value: "outdoors-v12", label: "Outdoors" },
    { value: "light-v11", label: "Light" },
    { value: "dark-v11", label: "Dark" },
    { value: "satellite-v9", label: "Satellite" },
  ]

  useEffect(() => {
    if (!mapContainer.current) return

    const loadMapbox = async () => {
      try {
        // Check Mapbox configuration from server
        const configResponse = await fetch("/api/maps/mapbox-config")
        const config = await configResponse.json()

        if (!config.hasToken || !config.tokenValid || config.useMockMap) {
          setUseMockMap(true)
          setIsLoaded(true)
          return
        }

        // Load Mapbox scripts
        if (!window.mapboxgl) {
          await loadMapboxScripts(config.scriptUrl, config.styleUrl)
        }

        // Initialize map with server-provided config
        await initializeMapWithServer()
      } catch (error) {
        console.error("Error loading Mapbox:", error)
        setUseMockMap(true)
        setIsLoaded(true)
      }
    }

    const loadMapboxScripts = (scriptUrl: string, styleUrl: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script")
        script.src = scriptUrl
        script.onload = () => {
          const link = document.createElement("link")
          link.href = styleUrl
          link.rel = "stylesheet"
          document.head.appendChild(link)
          link.onload = () => resolve()
          setTimeout(resolve, 500) // Fallback
        }
        script.onerror = reject
        document.head.appendChild(script)
      })
    }

    const initializeMapWithServer = async () => {
      try {
        if (!mapContainer.current) {
          setTimeout(initializeMapWithServer, 100)
          return
        }

        // Get initialization config from server
        const initResponse = await fetch("/api/maps/mapbox-init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            center: center ? [center.lng, center.lat] : [-74.006, 40.7128],
            zoom: 13,
            style: mapStyle,
          }),
        })

        const initData = await initResponse.json()

        if (!initData.success) {
          throw new Error("Failed to get map initialization config")
        }

        // Execute the initialization script (contains token)
        eval(initData.config.initScript)

        if (map.current) return

        map.current = new window.mapboxgl.Map({
          container: mapContainer.current,
          style: initData.config.style,
          center: initData.config.center,
          zoom: initData.config.zoom,
        })

        // Add controls
        map.current.addControl(new window.mapboxgl.NavigationControl(), "top-right")

        const geolocate = new window.mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
          showUserHeading: true,
        })
        map.current.addControl(geolocate, "top-right")

        map.current.on("load", () => {
          setIsLoaded(true)
          setHasError(false)

          map.current.on("click", (e: any) => {
            const newCenter = { lat: e.lngLat.lat, lng: e.lngLat.lng }
            updateGeofence(newCenter, currentRadius)
          })

          if (center) {
            updateGeofence(center, currentRadius)
          }
        })

        geolocate.on("geolocate", (e: any) => {
          setUserLocation({
            lat: e.coords.latitude,
            lng: e.coords.longitude,
          })
        })

        map.current.on("error", () => {
          setHasError(true)
          setUseMockMap(true)
          setIsLoaded(true)
        })
      } catch (error) {
        console.error("Error initializing map:", error)
        setHasError(true)
        setUseMockMap(true)
        setIsLoaded(true)
      }
    }

    const timeoutId = setTimeout(loadMapbox, 50)
    return () => clearTimeout(timeoutId)
  }, [center, currentRadius, mapStyle])

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
    }
  }, [])

  const updateGeofence = (newCenter: { lat: number; lng: number }, newRadius: number) => {
    if (useMockMap || hasError) {
      setMockCenter(newCenter)
      setGeofenceCenter(newCenter)
      setCurrentRadius(newRadius)
      onGeofenceSelect(newCenter, newRadius)
      return
    }

    if (!map.current) return

    try {
      // Remove existing elements
      if (markerRef.current) {
        markerRef.current.remove()
      }

      if (map.current.getLayer(circleLayerId)) {
        map.current.removeLayer(circleLayerId)
        map.current.removeLayer("geofence-circle-border")
      }
      if (map.current.getSource("geofence-circle")) {
        map.current.removeSource("geofence-circle")
      }

      // Add new marker
      const el = document.createElement("div")
      el.innerHTML = `
        <div style="
          background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
          "></div>
        </div>
      `

      markerRef.current = new window.mapboxgl.Marker(el).setLngLat([newCenter.lng, newCenter.lat]).addTo(map.current)

      // Create circle
      const circle = createCircle([newCenter.lng, newCenter.lat], newRadius)

      map.current.addSource("geofence-circle", {
        type: "geojson",
        data: circle,
      })

      map.current.addLayer({
        id: circleLayerId,
        type: "fill",
        source: "geofence-circle",
        paint: {
          "fill-color": "#7c3aed",
          "fill-opacity": 0.2,
        },
      })

      map.current.addLayer({
        id: "geofence-circle-border",
        type: "line",
        source: "geofence-circle",
        paint: {
          "line-color": "#7c3aed",
          "line-width": 3,
          "line-opacity": 0.8,
        },
      })

      const zoom = newRadius > 5000 ? 10 : newRadius > 2000 ? 12 : newRadius > 1000 ? 13 : 14
      map.current.flyTo({
        center: [newCenter.lng, newCenter.lat],
        zoom: zoom,
        duration: 1000,
      })

      setGeofenceCenter(newCenter)
      setCurrentRadius(newRadius)
      onGeofenceSelect(newCenter, newRadius)
    } catch (error) {
      console.error("Error updating geofence:", error)
    }
  }

  const createCircle = (center: [number, number], radiusInMeters: number) => {
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
    coords.push(coords[0])

    return {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [coords],
      },
    }
  }

  const searchLocation = async () => {
    if (!searchQuery.trim()) return

    try {
      const response = await fetch("/api/maps/mapbox-geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      })

      const data = await response.json()

      if (data.success && data.location) {
        updateGeofence(data.location, currentRadius)
        setSearchQuery("")
      }
    } catch (error) {
      console.error("Search error:", error)
    }
  }

  const adjustRadius = (delta: number) => {
    const newRadius = Math.max(100, Math.min(10000, currentRadius + delta))
    if (useMockMap || hasError) {
      setCurrentRadius(newRadius)
      onGeofenceSelect(mockCenter, newRadius)
    } else if (geofenceCenter) {
      updateGeofence(geofenceCenter, newRadius)
    }
  }

  const handleRadiusInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRadius = Number.parseInt(e.target.value) || 1000
    if (useMockMap || hasError) {
      setCurrentRadius(newRadius)
      onGeofenceSelect(mockCenter, newRadius)
    } else if (geofenceCenter) {
      updateGeofence(geofenceCenter, newRadius)
    }
  }

  const goToQuickLocation = (location: { lat: number; lng: number }) => {
    updateGeofence(location, currentRadius)
  }

  const useMyLocation = () => {
    if (userLocation) {
      updateGeofence(userLocation, currentRadius)
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setUserLocation(location)
          updateGeofence(location, currentRadius)
        },
        (error) => {
          console.error("Geolocation error:", error)
        },
      )
    }
  }

  const changeMapStyle = (newStyle: string) => {
    setMapStyle(newStyle)
    if (map.current && !useMockMap) {
      map.current.setStyle(`mapbox://styles/mapbox/${newStyle}`)

      map.current.once("styledata", () => {
        if (geofenceCenter) {
          setTimeout(() => {
            updateGeofence(geofenceCenter, currentRadius)
          }, 100)
        }
      })
    }
  }

  const handleMockMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!useMockMap && !hasError) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const lat = mockCenter.lat + (0.01 * (rect.height / 2 - y)) / (rect.height / 2)
    const lng = mockCenter.lng + (0.01 * (x - rect.width / 2)) / (rect.width / 2)

    const newCenter = { lat, lng }
    setMockCenter(newCenter)
    setGeofenceCenter(newCenter)
    onGeofenceSelect(newCenter, currentRadius)
  }

  if (!isLoaded) {
    return (
      <div className="space-y-4">
        <MapboxStatusCheck />
        <div className="h-96 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-8 w-8 text-lime-400 mx-auto mb-2 animate-pulse" />
            <p className="text-white/70">Loading secure Mapbox...</p>
          </div>
        </div>
      </div>
    )
  }

  if (useMockMap || hasError) {
    return (
      <div className="space-y-4">
        <MapboxStatusCheck />
        {/* Mock Map Interface */}
        <div
          className="h-96 w-full rounded-lg border-2 border-dashed border-white/30 bg-gradient-to-br from-green-900/20 to-blue-900/20 relative cursor-crosshair overflow-hidden"
          onClick={handleMockMapClick}
        >
          {/* Mock map elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
              {Array.from({ length: 48 }).map((_, i) => (
                <div key={i} className="border border-white/20"></div>
              ))}
            </div>
          </div>

          <div className="absolute top-1/3 left-0 right-0 h-1 bg-white/30"></div>
          <div className="absolute top-2/3 left-0 right-0 h-1 bg-white/30"></div>
          <div className="absolute left-1/4 top-0 bottom-0 w-1 bg-white/30"></div>
          <div className="absolute left-3/4 top-0 bottom-0 w-1 bg-white/30"></div>

          {geofenceCenter && (
            <>
              <div
                className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 z-10"
                style={{ left: "50%", top: "50%" }}
              >
                <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
              </div>
              <div
                className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: "50%",
                  top: "50%",
                  width: `${Math.min(currentRadius / 20, 200)}px`,
                  height: `${Math.min(currentRadius / 20, 200)}px`,
                }}
              ></div>
            </>
          )}

          <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded shadow text-xs font-medium">
            📍 Demo Location
          </div>
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded shadow text-xs">
            Secure Demo Map
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/70 text-white px-4 py-2 rounded-lg shadow-lg text-center">
              <MapPin className="h-5 w-5 text-lime-400 mx-auto mb-1" />
              <p className="text-sm font-medium">Click to set geofence center</p>
            </div>
          </div>
        </div>
        {/* Controls for mock map */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Label htmlFor="radius" className="text-white">
              Radius (meters):
            </Label>
            <Input
              id="radius"
              type="number"
              min="100"
              max="10000"
              value={currentRadius}
              onChange={handleRadiusInputChange}
              className="w-24 input-white"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => adjustRadius(-100)}
              disabled={currentRadius <= 100}
              className="glass-effect text-white border-white/30 hover:bg-white/10"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => adjustRadius(100)}
              disabled={currentRadius >= 10000}
              className="glass-effect text-white border-white/30 hover:bg-white/10"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="text-sm text-white/60">
          <p>• Click anywhere on the demo map to set the geofence center</p>
          <p>• Adjust the radius using the controls above</p>
          <p>• Add your Mapbox token to enable real maps</p>
          {geofenceCenter && (
            <p className="mt-2 font-medium text-white">
              Current center: {geofenceCenter.lat.toFixed(4)}, {geofenceCenter.lng.toFixed(4)} | Radius: {currentRadius}
              m
            </p>
          )}
        </div>
        return
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <MapboxStatusCheck />

      {/* Map Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex space-x-2">
          <Input
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && searchLocation()}
            className="input-white"
          />
          <Button
            onClick={searchLocation}
            variant="outline"
            className="glass-effect text-white border-white/30 hover:bg-white/10"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <Select value={mapStyle} onValueChange={changeMapStyle}>
          <SelectTrigger className="select-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {mapStyles.map((style) => (
              <SelectItem key={style.value} value={style.value}>
                {style.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={useMyLocation}
          variant="outline"
          size="sm"
          className="glass-effect text-white border-white/30 hover:bg-white/10"
        >
          <Navigation className="h-4 w-4 mr-1" />
          My Location
        </Button>
        {quickLocations.map((location) => (
          <Button
            key={location.name}
            onClick={() => goToQuickLocation(location)}
            variant="outline"
            size="sm"
            className="glass-effect text-white border-white/30 hover:bg-white/10"
          >
            <Target className="h-4 w-4 mr-1" />
            {location.name.split(",")[0]}
          </Button>
        ))}
      </div>

      {/* Real Map */}
      <div ref={mapContainer} className="h-96 w-full rounded-lg border border-white/20 shadow-2xl" />

      {/* Radius Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Label htmlFor="radius" className="text-white">
            Radius (meters):
          </Label>
          <Input
            id="radius"
            type="number"
            min="100"
            max="10000"
            value={currentRadius}
            onChange={handleRadiusInputChange}
            className="w-24 input-white"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => adjustRadius(-100)}
            disabled={currentRadius <= 100}
            className="glass-effect text-white border-white/30 hover:bg-white/10"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => adjustRadius(100)}
            disabled={currentRadius >= 10000}
            className="glass-effect text-white border-white/30 hover:bg-white/10"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Status Info */}
      <div className="text-sm text-white/60 space-y-1">
        <p>• Click anywhere on the map to set the geofence center</p>
        <p>• Use search to find specific addresses or landmarks</p>
        <p>• Try different map styles for better visibility</p>
        {geofenceCenter && (
          <div className="mt-2 p-2 bg-white/5 rounded border border-white/10">
            <p className="font-medium text-white">
              📍 Center: {geofenceCenter.lat.toFixed(4)}, {geofenceCenter.lng.toFixed(4)}
            </p>
            <p className="text-lime-400">🎯 Radius: {currentRadius}m</p>
          </div>
        )}
      </div>
    </div>
  )
}
