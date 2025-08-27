"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"

// Dynamically import mapbox to avoid SSR issues
const MapboxComponent = dynamic(() => import('./mapbox-component'), {
  ssr: false,
  loading: () => <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">Loading map...</div>
})

interface GeofenceMapProps {
  onLocationChange: (location: { lat: number; lng: number; address?: string }) => void
  initialRadius?: number
  initialLocation?: { lat: number; lng: number }
  className?: string
}

export function GeofenceMap({
  onLocationChange,
  initialRadius = 100,
  initialLocation,
  className = ""
}: GeofenceMapProps) {

  return (
    <div className={`space-y-4 ${className}`}>
      <MapboxComponent
        onLocationChange={onLocationChange}
        initialRadius={initialRadius}
        initialLocation={initialLocation}
      />
    </div>
  )
}
