"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Plus, Minus, Info } from "lucide-react"

interface GeofenceMapProps {
  onGeofenceSelect: (center: { lat: number; lng: number }, radius: number) => void
  center?: { lat: number; lng: number } | null
  radius?: number
}

declare global {
  interface Window {
    google: any
  }
}

export default function GeofenceMap({ onGeofenceSelect, center, radius = 1000 }: GeofenceMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [circle, setCircle] = useState<google.maps.Circle | null>(null)
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)
  const [currentRadius, setCurrentRadius] = useState(radius)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [useMockMap, setUseMockMap] = useState(false)
  const [mockCenter, setMockCenter] = useState(center || { lat: 40.7128, lng: -74.006 })

  // Load Google Maps API with error handling
  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        // Get maps configuration from server
        const response = await fetch("/api/maps/config")
        const config = await response.json()

        if (!config.hasApiKey || config.useMockMap) {
          console.warn("Google Maps API key not configured, using mock map interface")
          setUseMockMap(true)
          setIsLoaded(true)
          return
        }

        if (window.google) {
          setIsLoaded(true)
          return
        }

        const script = document.createElement("script")
        script.src = config.scriptUrl
        script.async = true
        script.defer = true

        script.onload = () => {
          setIsLoaded(true)
          setHasError(false)
        }

        script.onerror = () => {
          console.error("Failed to load Google Maps API, falling back to mock map")
          setHasError(true)
          setUseMockMap(true)
          setIsLoaded(true)
        }

        document.head.appendChild(script)
      } catch (error) {
        console.error("Error loading maps config:", error)
        setUseMockMap(true)
        setIsLoaded(true)
      }
    }

    loadGoogleMaps()
  }, [])

  // Initialize real Google Map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || useMockMap || hasError) return

    try {
      const defaultCenter = center || { lat: 40.7128, lng: -74.006 }

      const newMap = new window.google.maps.Map(mapRef.current, {
        zoom: 13,
        center: defaultCenter,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      })

      setMap(newMap)

      // Add click listener to set geofence center
      newMap.addListener("click", (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const newCenter = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
          }
          updateGeofence(newCenter, currentRadius)
        }
      })

      // If there's an existing center, show it
      if (center) {
        updateGeofence(center, currentRadius)
      }
    } catch (error) {
      console.error("Error initializing Google Maps:", error)
      setHasError(true)
      setUseMockMap(true)
    }
  }, [isLoaded, center, currentRadius, useMockMap, hasError])

  const updateGeofence = (newCenter: { lat: number; lng: number }, newRadius: number) => {
    if (useMockMap || hasError) {
      // Update mock map
      setMockCenter(newCenter)
      setCurrentRadius(newRadius)
      onGeofenceSelect(newCenter, newRadius)
      return
    }

    if (!map) return

    try {
      // Remove existing marker and circle
      if (marker) marker.setMap(null)
      if (circle) circle.setMap(null)

      // Create new marker
      const newMarker = new window.google.maps.Marker({
        position: newCenter,
        map: map,
        title: "Geofence Center",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#3B82F6",
          fillOpacity: 1,
          strokeColor: "#1E40AF",
          strokeWeight: 2,
        },
      })

      // Create new circle
      const newCircle = new window.google.maps.Circle({
        strokeColor: "#3B82F6",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#3B82F6",
        fillOpacity: 0.2,
        map: map,
        center: newCenter,
        radius: newRadius,
      })

      setMarker(newMarker)
      setCircle(newCircle)
      setCurrentRadius(newRadius)

      // Center map on the geofence
      map.setCenter(newCenter)

      // Notify parent component
      onGeofenceSelect(newCenter, newRadius)
    } catch (error) {
      console.error("Error updating geofence:", error)
      setHasError(true)
      setUseMockMap(true)
    }
  }

  const adjustRadius = (delta: number) => {
    const newRadius = Math.max(100, Math.min(10000, currentRadius + delta))
    if (useMockMap || hasError) {
      setCurrentRadius(newRadius)
      onGeofenceSelect(mockCenter, newRadius)
    } else if (center) {
      updateGeofence(center, newRadius)
    }
  }

  const handleRadiusInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRadius = Number.parseInt(e.target.value) || 1000
    setCurrentRadius(newRadius)
    if (useMockMap || hasError) {
      onGeofenceSelect(mockCenter, newRadius)
    } else if (center) {
      updateGeofence(center, newRadius)
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
    onGeofenceSelect(newCenter, currentRadius)
  }

  if (!isLoaded) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-pulse" />
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    )
  }

  if (useMockMap || hasError) {
    return (
      <div className="space-y-4">
        {/* Mock Map Interface */}
        <div
          className="h-96 w-full rounded-lg border-2 border-dashed border-gray-300 bg-gradient-to-br from-green-50 to-blue-50 relative cursor-crosshair overflow-hidden"
          onClick={handleMockMapClick}
        >
          {/* Mock map background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
              {Array.from({ length: 48 }).map((_, i) => (
                <div key={i} className="border border-gray-400"></div>
              ))}
            </div>
          </div>

          {/* Mock streets */}
          <div className="absolute top-1/3 left-0 right-0 h-1 bg-gray-400 opacity-30"></div>
          <div className="absolute top-2/3 left-0 right-0 h-1 bg-gray-400 opacity-30"></div>
          <div className="absolute left-1/4 top-0 bottom-0 w-1 bg-gray-400 opacity-30"></div>
          <div className="absolute left-3/4 top-0 bottom-0 w-1 bg-gray-400 opacity-30"></div>

          {/* Geofence center marker */}
          {mockCenter && (
            <div
              className="absolute w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{
                left: "50%",
                top: "50%",
              }}
            >
              <div className="absolute inset-0 bg-blue-600 rounded-full animate-ping opacity-75"></div>
            </div>
          )}

          {/* Geofence circle */}
          {mockCenter && (
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
          <div className="absolute top-4 left-4 bg-white px-2 py-1 rounded shadow text-xs font-medium">
            📍 New York City
          </div>
          <div className="absolute bottom-4 right-4 bg-white px-2 py-1 rounded shadow text-xs">Demo Map</div>

          {/* Click instruction */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white bg-opacity-90 px-4 py-2 rounded-lg shadow-lg text-center">
              <MapPin className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <p className="text-sm font-medium text-gray-700">Click to set geofence center</p>
            </div>
          </div>
        </div>

        {/* API Key Warning */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Demo Mode:</strong> This is a mock map interface. To use real Google Maps, add your Google Maps API
            key to the environment variables.
            {hasError && " (API key error detected)"}
          </AlertDescription>
        </Alert>

        {/* Radius Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Label htmlFor="radius">Radius (meters):</Label>
            <Input
              id="radius"
              type="number"
              min="100"
              max="10000"
              value={currentRadius}
              onChange={handleRadiusInputChange}
              className="w-24"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => adjustRadius(-100)}
              disabled={currentRadius <= 100}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => adjustRadius(100)}
              disabled={currentRadius >= 10000}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          <p>• Click anywhere on the map to set the geofence center</p>
          <p>• Adjust the radius using the controls above</p>
          <p>• The recipient must be within this area to receive the funds</p>
          {mockCenter && (
            <p className="mt-2 font-medium">
              Current center: {mockCenter.lat.toFixed(4)}, {mockCenter.lng.toFixed(4)} | Radius: {currentRadius}m
            </p>
          )}
        </div>
      </div>
    )
  }

  // Real Google Maps interface
  return (
    <div className="space-y-4">
      <div ref={mapRef} className="h-96 w-full rounded-lg border" />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Label htmlFor="radius">Radius (meters):</Label>
          <Input
            id="radius"
            type="number"
            min="100"
            max="10000"
            value={currentRadius}
            onChange={handleRadiusInputChange}
            className="w-24"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => adjustRadius(-100)}
            disabled={currentRadius <= 100}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => adjustRadius(100)}
            disabled={currentRadius >= 10000}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        <p>• Click anywhere on the map to set the geofence center</p>
        <p>• Adjust the radius using the controls above</p>
        <p>• The recipient must be within this area to receive the funds</p>
      </div>
    </div>
  )
}
