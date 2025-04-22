"use client"

import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapPin, Navigation } from "lucide-react"

// Fix for default Leaflet icon issues
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
})

interface LocationPickerProps {
  onClose: () => void
  onLocationSelect: (lat: number, lng: number, address: string) => void
  initialLocation?: { lat: number; lng: number; address: string } | null
}

const MapController: React.FC<{ position: [number, number] }> = ({ position }) => {
  const map = useMap()
  useEffect(() => {
    map.setView(position, 13)
  }, [position, map])
  return null
}

const MapLocationPicker: React.FC<LocationPickerProps> = ({ onClose, onLocationSelect, initialLocation }) => {
  const [position, setPosition] = useState<[number, number]>(
    initialLocation ? [initialLocation.lat, initialLocation.lng] : [51.505, -0.09]
  )
  const [address, setAddress] = useState<string>(initialLocation?.address || "")
  const markerRef = useRef<L.Marker>(null)

  // Fetch address for initial location if not provided
  useEffect(() => {
    if (initialLocation && !initialLocation.address) {
      getAddress(initialLocation.lat, initialLocation.lng)
    }
  }, [initialLocation])

  // Function to get address from coordinates using Nominatim
  const getAddress = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      )
      const data = await response.json()
      setAddress(data.display_name || "Unknown location")
    } catch (error) {
      console.error("Error fetching address:", error)
      setAddress("Unable to fetch address")
    }
  }

  // Handle map click to set new marker position
  const handleMapClick = async (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng
    setPosition([lat, lng])
    await getAddress(lat, lng)
  }

  // Handle confirm button
  const handleConfirm = () => {
    onLocationSelect(position[0], position[1], address)
    onClose()
  }

  // Handle get directions button
  const handleGetDirections = () => {
    const [lat, lng] = position
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    window.open(googleMapsUrl, "_blank")
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-serif font-bold text-gray-800">Select Location</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="h-[400px] rounded-lg overflow-hidden mb-4">
          <MapContainer
            center={position}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            eventHandlers={{
              click: handleMapClick,
            }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapController position={position} />
            <Marker position={position} ref={markerRef}>
              <Popup>{address || "Selected location"}</Popup>
            </Marker>
          </MapContainer>
        </div>

        <div className="mb-4">
          <p className="text-gray-700 flex items-center gap-2">
            <MapPin size={16} className="text-black" />
            {address || "Click on the map to select a location"}
          </p>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGetDirections}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Navigation size={16} />
            Get Directions
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

export default MapLocationPicker