import { useEffect, useRef, useState } from "react"

interface MapboxComponentProps {
  onLocationChange: (location: { lat: number; lng: number; address?: string }) => void
  initialRadius?: number
  initialLocation?: { lat: number; lng: number }
}

export default function MapboxComponent({
  onLocationChange,
  initialRadius = 100,
  initialLocation
}: MapboxComponentProps) {
  const [currentLocation, setCurrentLocation] = useState(initialLocation || { lat: 40.7128, lng: -74.0060 })
  const [radius, setRadius] = useState(initialRadius)
  const [searchValue, setSearchValue] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    // Initialize location
    onLocationChange(currentLocation)
  }, [])

  const searchLocation = async (query: string) => {
    if (!query.trim()) return

    setIsSearching(true)
    try {
      // Mock search for now - replace with actual Mapbox geocoding when token is available
      const mockResults = [
        { lat: 40.7128, lng: -74.0060, address: "New York, NY" },
        { lat: 34.0522, lng: -118.2437, address: "Los Angeles, CA" },
        { lat: 41.8781, lng: -87.6298, address: "Chicago, IL" }
      ]
      
      const result = mockResults[0]
      setCurrentLocation({ lat: result.lat, lng: result.lng })
      setSearchValue(result.address)
      onLocationChange({ lat: result.lat, lng: result.lng, address: result.address })
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

  return (
    <div className="space-y-4">
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
          onChange={(e) => setRadius(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>25m</span>
          <span>1000m</span>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg border border-gray-300 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Interactive Map</h3>
          <p className="text-gray-600">Location: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}</p>
          <p className="text-sm text-gray-500 mt-2">Radius: {radius}m</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <p className="font-medium mb-1">Map functionality:</p>
        <p>• Search for addresses using the search bar</p>
        <p>• Adjust the radius slider to change the geofence size</p>
        <p>• Current location will be used for geofence center</p>
        <p>• Add Mapbox token to enable full interactive map</p>
      </div>
    </div>
  )
}