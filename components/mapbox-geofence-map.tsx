"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Plus, Minus, Info } from "lucide-react"

interface MapboxGeofenceMapProps {
  onGeofenceSelect: (center: { lat: number; lng: number }, radius: number) => void
  center?: { lat: number; lng: number } | null
  radius?: number
}

declare global {
  interface Window {
    mapboxgl: any
  }
}

export default function MapboxGeofenceMap({ onGeofenceSelect, center, radius = 1000 }: MapboxGeofenceMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [currentRadius, setCurrentRadius] = useState(radius)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [useMockMap, setUseMockMap] = useState(false)
  const [mockCenter, setMockCenter] = useState(center || { lat: 40.7128, lng: -74.006 })
  const [geofenceCenter, setGeofenceCenter] = useState(center)
  const markerRef = useRef<any>(null)
  const circleLayerId = "geofence-circle"
  const [mapboxConfig, setMapboxConfig] = useState<any>(null)

  // Load Mapbox GL JS
  useEffect(() => {
    const loadMapbox = async () => {
      try {
        // Get config from server
        const response = await fetch("/api/maps/mapbox-config")
        const config = await response.json()

        if (!config.hasToken || !config.tokenValid) {
          console.warn("Mapbox token not available, using mock map interface")
          setUseMockMap(true)
          setIsLoaded(true)
          return
        }

        setMapboxConfig(config)

        if (window.mapboxgl) {
          await initializeMapWithConfig(config)
          return
        }

        // Load Mapbox GL JS and CSS
        const script = document.createElement("script")
        script.src = config.scriptUrl
        script.onload = async () => {
          const link = document.createElement("link")
          link.href = config.styleUrl
          link.rel = "stylesheet"
          document.head.appendChild(link)

          await initializeMapWithConfig(config)
        }
        script.onerror = () => {
          console.error("Failed to load Mapbox GL JS, falling back to mock map")
          setHasError(true)
          setUseMockMap(true)
          setIsLoaded(true)
        }
        document.head.appendChild(script)
      } catch (error) {
        console.error("Error loading Mapbox config:", error)
        setUseMockMap(true)
        setIsLoaded(true)
      }
    }

    const initializeMapWithConfig = async (config: any) => {
      try {
        // Initialize map with server-provided config
        const initResponse = await fetch("/api/maps/mapbox-init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            center: center ? [center.lng, center.lat] : [-74.006, 40.7128],
            zoom: 13,
            style: "streets-v12",
          }),
        })

        const initData = await initResponse.json()

        if (initData.success) {
          // Execute the initialization script from server
          eval(initData.config.initScript)

          if (map.current) return // Initialize map only once

          const defaultCenter = center || { lat: 40.7128, lng: -74.006 }

          map.current = new window.mapboxgl.Map({
            container: mapContainer.current,
            style: initData.config.style,
            center: initData.config.center,
            zoom: initData.config.zoom,
          })

          map.current.on("load", () => {
            setIsLoaded(true)
            setHasError(false)

            // Add click handler
            map.current.on("click", (e: any) => {
              const newCenter = {
                lat: e.lngLat.lat,
                lng: e.lngLat.lng,
              }
              updateGeofence(newCenter, currentRadius)
            })

            // If there's an existing center, show it
            if (center) {
              updateGeofence(center, currentRadius)
            }
          })

          map.current.on("error", () => {
            console.error("Mapbox map error, falling back to mock map")
            setHasError(true)
            setUseMockMap(true)
            setIsLoaded(true)
          })
        }
      } catch (error) {
        console.error("Error initializing Mapbox:", error)
        setHasError(true)
        setUseMockMap(true)
        setIsLoaded(true)
      }
    }

    loadMapbox()
  }, [center, currentRadius])

  const updateGeofence = (newCenter: { lat: number; lng: number }, newRadius: number) => {
    if (useMockMap || hasError) {
      // Update mock map
      setMockCenter(newCenter)
      setGeofenceCenter(newCenter)
      setCurrentRadius(newRadius)
      onGeofenceSelect(newCenter, newRadius)
      return
    }

    if (!map.current) return

    try {
      // Remove existing marker
      if (markerRef.current) {
        markerRef.current.remove()
      }

      // Remove existing circle
      if (map.current.getLayer(circleLayerId)) {
        map.current.removeLayer(circleLayerId)
      }
      if (map.current.getSource("geofence-circle")) {
        map.current.removeSource("geofence-circle")
      }

      // Add new marker
      const el = document.createElement("div")
      el.className = "mapbox-marker"
      el.style.cssText = `
        background-color: #3B82F6;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        cursor: pointer;
      `

      markerRef.current = new window.mapboxgl.Marker(el).setLngLat([newCenter.lng, newCenter.lat]).addTo(map.current)

      // Create circle for geofence
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
          "fill-color": "#3B82F6",
          "fill-opacity": 0.2,
        },
      })

      map.current.addLayer({
        id: "geofence-circle-border",
        type: "line",
        source: "geofence-circle",
        paint: {
          "line-color": "#3B82F6",
          "line-width": 2,
        },
      })

      // Center map on the geofence
      map.current.flyTo({
        center: [newCenter.lng, newCenter.lat],
        zoom: 13,
      })

      setGeofenceCenter(newCenter)
      setCurrentRadius(newRadius)
      onGeofenceSelect(newCenter, newRadius)
    } catch (error) {
      console.error("Error updating geofence:", error)
      setHasError(true)
      setUseMockMap(true)
    }
  }

  // Create a circle polygon
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
    coords.push(coords[0]) // Close the polygon

    return {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [coords],
      },
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
    setCurrentRadius(newRadius)
    if (useMockMap || hasError) {
      onGeofenceSelect(mockCenter, newRadius)
    } else if (geofenceCenter) {
      updateGeofence(geofenceCenter, newRadius)
    }
  }

  const handleMockMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!useMockMap && !hasError) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Convert click position to mock coordinates
    const lat = mockCenter.lat + (0.01 * (rect.height / 2 - y)) / (rect.height / 2)
    const lng = mockCenter.lng + (0.01 * (x - rect.width / 2)) / (rect.width / 2)

    const newCenter = { lat, lng }
    setMockCenter(newCenter)
    setGeofenceCenter(newCenter)
    onGeofenceSelect(newCenter, currentRadius)
  }

  if (!isLoaded) {
    return (
      <div className="h-96 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-8 w-8 text-lime-400 mx-auto mb-2 animate-pulse" />
          <p className="text-white/70">Loading Mapbox...</p>
        </div>
      </div>
    )
  }

  if (useMockMap || hasError) {
    return (
      <div className="space-y-4">
        {/* Mock Map Interface */}
        <div
          className="h-96 w-full rounded-lg border-2 border-dashed border-white/30 bg-gradient-to-br from-green-900/20 to-blue-900/20 relative cursor-crosshair overflow-hidden"
          onClick={handleMockMapClick}
        >
          {/* Mock map background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
              {Array.from({ length: 48 }).map((_, i) => (
                <div key={i} className="border border-white/20"></div>
              ))}
            </div>
          </div>

          {/* Mock streets */}
          <div className="absolute top-1/3 left-0 right-0 h-1 bg-white/30"></div>
          <div className="absolute top-2/3 left-0 right-0 h-1 bg-white/30"></div>
          <div className="absolute left-1/4 top-0 bottom-0 w-1 bg-white/30"></div>
          <div className="absolute left-3/4 top-0 bottom-0 w-1 bg-white/30"></div>

          {/* Geofence center marker */}
          {geofenceCenter && (
            <div
              className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{
                left: "50%",
                top: "50%",
              }}
            >
              <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
            </div>
          )}

          {/* Geofence circle */}
          {geofenceCenter && (
            <div
              className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20 rounded-full transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: "50%",
                top: "50%",
                width: `${Math.min(currentRadius / 20, 200)}px`,
                height: `${Math.min(currentRadius / 20, 200)}px`,
              }}
            ></div>
          )}

          {/* Mock location labels */}
          <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded shadow text-xs font-medium">
            📍 New York City
          </div>
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded shadow text-xs">
            Demo Map
          </div>

          {/* Click instruction */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/70 text-white px-4 py-2 rounded-lg shadow-lg text-center">
              <MapPin className="h-5 w-5 text-lime-400 mx-auto mb-1" />
              <p className="text-sm font-medium">Click to set geofence center</p>
            </div>
          </div>
        </div>

        {/* API Key Warning */}
        <Alert className="bg-yellow-500/20 border-yellow-400/30">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-yellow-200">
            <strong>Demo Mode:</strong> This is a mock map interface. To use real Mapbox maps, add your Mapbox access
            token to the environment variables.
            {hasError && " (Mapbox error detected)"}
          </AlertDescription>
        </Alert>

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
              className="w-24 bg-white/10 border-white/20 text-white"
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
          <p>• Click anywhere on the map to set the geofence center</p>
          <p>• Adjust the radius using the controls above</p>
          <p>• The recipient must be within this area to receive the funds</p>
          {geofenceCenter && (
            <p className="mt-2 font-medium text-white">
              Current center: {geofenceCenter.lat.toFixed(4)}, {geofenceCenter.lng.toFixed(4)} | Radius: {currentRadius}
              m
            </p>
          )}
        </div>
      </div>
    )
  }

  // Real Mapbox interface
  return (
    <div className="space-y-4">
      <div ref={mapContainer} className="h-96 w-full rounded-lg border border-white/20" />

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
            className="w-24 bg-white/10 border-white/20 text-white"
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
        <p>• Click anywhere on the map to set the geofence center</p>
        <p>• Adjust the radius using the controls above</p>
        <p>• The recipient must be within this area to receive the funds</p>
        {geofenceCenter && (
          <p className="mt-2 font-medium text-white">
            Current center: {geofenceCenter.lat.toFixed(4)}, {geofenceCenter.lng.toFixed(4)} | Radius: {currentRadius}m
          </p>
        )}
      </div>
    </div>
  )
}
