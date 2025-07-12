"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"

// Initialize Mapbox
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZkangifQ.-g_vE53SD2WrJ6tFX7QHmA'

interface GeofenceMapProps {
  onLocationChange: (location: { lat: number; lng: number; address?: string }) => void
  onRadiusChange: (radius: number) => void
  initialLocation?: { lat: number; lng: number }
  initialRadius?: number
  className?: string
}

export function GeofenceMap({
  onLocationChange,
  onRadiusChange,
  initialLocation,
  initialRadius = 100,
  className = ""
}: GeofenceMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const marker = useRef<mapboxgl.Marker | null>(null)
  const circle = useRef<string | null>(null)
  
  const [currentLocation, setCurrentLocation] = useState(initialLocation || { lat: 40.7128, lng: -74.0060 })
  const [radius, setRadius] = useState(initialRadius)
  const [searchValue, setSearchValue] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [currentLocation.lng, currentLocation.lat],
      zoom: 15
    })

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // Add click handler
    map.current.on('click', handleMapClick)

    return () => {
      if (map.current) {
        // Clean up layers and sources before removing map
        const circleId = 'geofence-circle'
        const borderLayerId = `${circleId}-border`
        
        try {
          if (map.current.getLayer(borderLayerId)) {
            map.current.removeLayer(borderLayerId)
          }
          if (map.current.getLayer(circleId)) {
            map.current.removeLayer(circleId)
          }
          if (map.current.getSource(circleId)) {
            map.current.removeSource(circleId)
          }
        } catch (error) {
          // Ignore cleanup errors
          console.log('Map cleanup:', error)
        }
        
        map.current.remove()
      }
    }
  }, [])

  // Update map when location changes
  useEffect(() => {
    if (!map.current) return

    updateMapLocation(currentLocation.lat, currentLocation.lng)
  }, [currentLocation])

  // Update circle when radius changes
  useEffect(() => {
    if (!map.current) return

    updateCircle()
  }, [radius])

  const updateMapLocation = (lat: number, lng: number) => {
    if (!map.current) return

    // Update map center
    map.current.flyTo({
      center: [lng, lat],
      zoom: 15
    })

    // Update marker
    if (marker.current) {
      marker.current.remove()
    }

    marker.current = new mapboxgl.Marker({ color: '#3b82f6', draggable: true })
      .setLngLat([lng, lat])
      .addTo(map.current)

    // Add drag handler to marker
    marker.current.on('dragend', () => {
      if (marker.current) {
        const lngLat = marker.current.getLngLat()
        const newLocation = { lat: lngLat.lat, lng: lngLat.lng }
        setCurrentLocation(newLocation)
        onLocationChange(newLocation)
        reverseGeocode(lngLat.lat, lngLat.lng)
      }
    })

    updateCircle()
    onLocationChange({ lat, lng })
  }

  const updateCircle = () => {
    if (!map.current) return

    const addCircleToMap = () => {
      if (!map.current) return

      const circleId = 'geofence-circle'
      const borderLayerId = `${circleId}-border`

      // Remove existing layers first (order matters!)
      if (map.current.getLayer(borderLayerId)) {
        map.current.removeLayer(borderLayerId)
      }
      if (map.current.getLayer(circleId)) {
        map.current.removeLayer(circleId)
      }
      
      // Then remove source
      if (map.current.getSource(circleId)) {
        map.current.removeSource(circleId)
      }

      // Create circle geometry
      const steps = 64
      const coordinates = []

      for (let i = 0; i < steps; i++) {
        const angle = (i * 360) / steps
        const radiusInDegrees = radius / 111320 // Approximate meters to degrees
        const x = currentLocation.lng + radiusInDegrees * Math.cos(angle * Math.PI / 180)
        const y = currentLocation.lat + radiusInDegrees * Math.sin(angle * Math.PI / 180)
        coordinates.push([x, y])
      }
      coordinates.push(coordinates[0]) // Close the circle

      // Add circle to map (only if source doesn't exist)
      if (!map.current.getSource(circleId)) {
        map.current.addSource(circleId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [coordinates]
            },
            properties: {}
          }
        })
      }

      // Add layers (only if they don't exist)
      if (!map.current.getLayer(circleId)) {
        map.current.addLayer({
          id: circleId,
          type: 'fill',
          source: circleId,
          paint: {
            'fill-color': '#3b82f6',
            'fill-opacity': 0.2
          }
        })
      }

      if (!map.current.getLayer(borderLayerId)) {
        map.current.addLayer({
          id: borderLayerId,
          type: 'line',
          source: circleId,
          paint: {
            'line-color': '#3b82f6',
            'line-width': 2
          }
        })
      }

      circle.current = circleId
    }

    // Wait for style to load before adding sources/layers
    if (map.current.isStyleLoaded()) {
      addCircleToMap()
    } else {
      map.current.once('styledata', addCircleToMap)
    }
  }

  const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
    const { lat, lng } = e.lngLat
    const newLocation = { lat, lng }
    setCurrentLocation(newLocation)
    reverseGeocode(lat, lng)
  }

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
      )
      const data = await response.json()
      
      if (data.features && data.features.length > 0) {
        const address = data.features[0].place_name
        setSearchValue(address)
        onLocationChange({ lat, lng, address })
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
    }
  }

  const searchLocation = async (query: string) => {
    if (!query.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxgl.accessToken}&limit=1`
      )
      const data = await response.json()

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center
        const address = data.features[0].place_name
        const newLocation = { lat, lng }
        
        setCurrentLocation(newLocation)
        setSearchValue(address)
        onLocationChange({ lat, lng, address })
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    searchLocation(searchValue)
  }

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius)
    onRadiusChange(newRadius)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="space-y-2">
        <div className="flex space-x-2">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSearchSubmit(e as any)
              }
            }}
            placeholder="Search for an address..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleSearchSubmit}
            disabled={isSearching}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Radius Slider */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Geofence Radius: {radius} meters
        </label>
        <input
          type="range"
          min="25"
          max="1000"
          step="25"
          value={radius}
          onChange={(e) => handleRadiusChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>25m</span>
          <span>1000m</span>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapContainer} 
        className="w-full h-96 rounded-lg border border-gray-300 shadow-lg"
        style={{ minHeight: '400px' }}
      />

      {/* Instructions */}
      <div className="text-sm text-gray-600 space-y-1">
        <p>• Click on the map to set a new location</p>
        <p>• Drag the blue marker to fine-tune the position</p>
        <p>• Use the address search to find specific locations</p>
        <p>• Adjust the radius slider to change the geofence size</p>
      </div>
    </div>
  )
}
