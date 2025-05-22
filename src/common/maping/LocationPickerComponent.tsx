import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";
import L, { LeafletEvent } from "leaflet";

// Marker fix
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom location marker icons
const blueIcon = new L.Icon({
  iconUrl:
    "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const redIcon = new L.Icon({
  iconUrl:
    "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});


interface NominatimRaw {
  place_id?: number;
  display_name?: string;
  boundingbox?: [string, string, string, string]; // [minLat, maxLat, minLon, maxLon]
  geojson?: unknown; // Could be a GeoJSON object
  [key: string]: unknown; // Allow additional fields
}


interface GeoSearchResult {
  x: number; // Longitude
  y: number; // Latitude
  label: string; // Display name or address
  bounds?: L.LatLngBounds; // Optional: Bounds of the location
  raw?: NominatimRaw; // Optional: Raw data from the search provider
}

interface ResultEvent extends LeafletEvent {
  location: GeoSearchResult;
}

// Search control component
const SearchControl = ({
  onSearchResultSelected,
  searchMode,
}: {
  onSearchResultSelected?: (coords: [number, number], label: string) => void;
  searchMode: boolean;
}) => {
  const map = useMap();

  useEffect(() => {
    if (!searchMode) return;

    console.log("SearchControl: Adding search control");
    const provider = new OpenStreetMapProvider();
    const searchControl = GeoSearchControl({
      provider,
      style: "bar",
      showMarker: true,
      showPopup: false,
      marker: {
        icon: DefaultIcon,
        draggable: false,
      },
      maxMarkers: 1,
      retainZoomLevel: false,
      animateZoom: true,
      autoClose: true,
      searchLabel: "Search location...",
      keepResult: true,
    });

    map.addControl(searchControl);

    const handleSearchResult = (event: ResultEvent) => {
      console.log("SearchControl: Search result received", event);
      if (event?.location?.y && event?.location?.x) {
        const coords: [number, number] = [event.location.y, event.location.x];
        const label =
          event.location.label ||
          `Lat: ${coords[0].toFixed(4)}, Lng: ${coords[1].toFixed(4)}`;
        onSearchResultSelected?.(coords, label);
      }
    };

    map.on("geosearch/showlocation", handleSearchResult as L.LeafletEventHandlerFn);

    const focusInput = () => {
      const input = document.querySelector(
        ".leaflet-geosearch-bar input"
      ) as HTMLInputElement;
      if (input) {
        input.focus();
        L.DomEvent.disableClickPropagation(input);
        L.DomEvent.disableScrollPropagation(input);
      }
    };

    const interval = setInterval(focusInput, 100);
    setTimeout(() => clearInterval(interval), 1000);

    return () => {
      console.log("SearchControl: Cleaning up");
      map.removeControl(searchControl);
      map.off("geosearch/showlocation", handleSearchResult as L.LeafletEventHandlerFn);
      clearInterval(interval);
    };
  }, [map, searchMode, onSearchResultSelected]);

  return null;
};

// Live location tracker component
const LiveLocationTracker = ({
  onLocationChange,
  setInitialView = true,
  disabled = false,
}: {
  onLocationChange: (pos: [number, number], accuracy: number) => void;
  setInitialView?: boolean;
  disabled?: boolean;
}) => {
  const map = useMap();

  useEffect(() => {
    if (disabled || !navigator.geolocation) {
      if (!navigator.geolocation) {
        console.warn("Geolocation is not supported by this browser.");
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        if (setInitialView) {
          map.setView(coords, 16);
        }
        onLocationChange(coords, position.coords.accuracy);
      },
      (error) => {
        console.error("Error getting initial location:", error);
      },
      { enableHighAccuracy: true }
    );

 const LocateControl = L.Control.extend({
  options: {
    position: "bottomright" as const,
  },
  onAdd: () => {
    const div = L.DomUtil.create("div", "leaflet-bar leaflet-control");
    const button = L.DomUtil.create("a", "", div);
    button.href = "#";
    button.title = "Center on my location";
    button.innerHTML = "📍";
    button.style.fontSize = "20px";
    button.style.textAlign = "center";
    button.style.lineHeight = "30px";

    L.DomEvent.on(button, "click", (e) => {
      L.DomEvent.stopPropagation(e);
      L.DomEvent.preventDefault(e);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latlng: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          map.setView(latlng, 16);
          onLocationChange(latlng, position.coords.accuracy);
        },
        (error) => {
          console.error("Error centering on location:", error);
        },
        { enableHighAccuracy: true }
      );
    });

    return div;
  },
});

const locateButton = new LocateControl();
locateButton.addTo(map);

    locateButton.addTo(map);

    return () => {
      map.removeControl(locateButton);
    };
  }, [map, onLocationChange, setInitialView, disabled]);

  return null;
};

// Main LocationPicker component
interface LocationPickerProps {
  onLocationChange: (
    locationName: string,
    point1: [number, number],
    point2: [number, number] | null
  ) => void;
  initialLocations?: {
    point1?: [number, number];
    point2?: [number, number];
    locationName?: string;
  };
  isModalVisible?: boolean;
  liveLocationEnabled?: boolean;
  onToggleLiveLocation?: (enabled: boolean) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationChange,
  initialLocations,
  isModalVisible,
  liveLocationEnabled = true,
  onToggleLiveLocation,
}) => {
  const fallbackPosition: [number, number] = [51.505, -0.09];
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    initialLocations?.point1 || null
  );
  const [secondLocation, setSecondLocation] = useState<[number, number] | null>(
    initialLocations?.point2 || null
  );
  const [locationName, setLocationName] = useState<string>(
    initialLocations?.locationName || ""
  );
  const [isPickingSecondPoint, setIsPickingSecondPoint] =
    useState<boolean>(false);
  const [searchMode, setSearchMode] = useState<boolean>(false);
  const mapRef = useRef<L.Map | null>(null);

  // Invalidate map size when modal becomes visible
  useEffect(() => {
    if (mapRef.current && isModalVisible) {
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 100);
    }
  }, [isModalVisible]);

  const handleLocationChange = (pos: [number, number]) => {
    setUserLocation(pos);
    onLocationChange(locationName, pos, secondLocation);
  };

  const handleSearchResultSelected = (
    coords: [number, number],
    label: string
  ) => {
    setUserLocation(coords);
    setSearchMode(false);
    if (mapRef.current) {
      mapRef.current.setView(coords, 16);
    }
    // Disable live location
    onToggleLiveLocation?.(false);
    // Update location name with search result label
    setLocationName(label);
    onLocationChange(label, coords, secondLocation);
  };

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (searchMode) return;
    const clickedPos: [number, number] = [e.latlng.lat, e.latlng.lng];

    if (isPickingSecondPoint) {
      setSecondLocation(clickedPos);
      setIsPickingSecondPoint(false);
      if (userLocation) {
        onLocationChange(locationName, userLocation, clickedPos);
      }
    } else {
      setUserLocation(clickedPos);
      onLocationChange(locationName, clickedPos, secondLocation);
    }
  };

  const togglePointPicking = () => {
    setIsPickingSecondPoint(!isPickingSecondPoint);
    setSearchMode(false);
  };

  const clearSecondPoint = () => {
    setSecondLocation(null);
    if (userLocation) {
      onLocationChange(locationName, userLocation, null);
    }
  };

  const handleLocationNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setLocationName(newName);
    if (userLocation) {
      onLocationChange(newName, userLocation, secondLocation);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        setUserLocation(coords);
        if (mapRef.current) {
          mapRef.current.setView(coords, 16);
        }
        // Enable live location
        onToggleLiveLocation?.(true);
        // Fetch location name via reverse geocoding
        const fetchedName = await fetchLocationName(coords[0], coords[1]);
        setLocationName(fetchedName);
        onLocationChange(fetchedName, coords, secondLocation);
      },
      (error) => {
        console.error("Error getting current location:", error);
        alert(
          "Unable to retrieve your location. Please check your location settings."
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Reverse geocoding function
  const fetchLocationName = async (
    lat: number,
    lng: number
  ): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        {
          headers: {
            "User-Agent": "LocationPicker/1.0",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch location name");
      }
      const data = await response.json();
      if (data.display_name) {
        return (
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.suburb ||
          data.display_name.split(",")[0] ||
          data.display_name
        );
      }
      return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
    } catch (error) {
      console.error("Error in reverse geocoding:", error);
      return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
    }
  };

  const MapEvents = () => {
    const map = useMap();

    useEffect(() => {
      mapRef.current = map;
      return () => {
        mapRef.current = null;
      };
    }, [map]);

    useEffect(() => {
      const handleClick = (e: L.LeafletMouseEvent) => {
        const target = e.originalEvent.target as HTMLElement;
        if (
          target.closest(".leaflet-control") ||
          target.closest(".leaflet-geosearch-bar") ||
          target.closest(".leaflet-marker-icon")
        ) {
          return;
        }
        handleMapClick(e);
      };

      map.on("click", handleClick);
      return () => {
        map.off("click", handleClick);
      };
    }, [map]);

    return null;
  };

  return (
    <div className="location-picker-wrapper">
      <style>
        {`
        .location-buttons {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
          flex-wrap: wrap;
        }
        .location-button {
          background: white;
          border: 2px solid rgba(0,0,0,0.2);
          border-radius: 4px;
          padding: 5px 10px;
          cursor: pointer;
          font-weight: normal;
          transition: all 0.2s ease;
        }
        .location-button.active {
          background: #e0e0e0;
          font-weight: bold;
        }
        .location-button:hover {
          background: #f0f0f0;
        }
        .location-name-input {
          margin-bottom: 10px;
          width: 100%;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .search-mode-indicator {
          background: #e6f0fa;
          padding: 8px;
          border-radius: 4px;
          margin-bottom: 10px;
          text-align: center;
          font-size: 14px;
        }
        .leaflet-geosearch-bar {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          max-width: 400px;
          z-index: 1000 !important;
          background: white;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .leaflet-geosearch-bar input {
          width: 100%;
          padding: 10px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
        }
        .leaflet-geosearch-bar input:focus {
          outline: none;
          box-shadow: 0 0 0 2px #4285f4;
        }
        .coordinate-display {
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 10px;
          margin-top: 10px;
          font-size: 13px;
        }
        .coordinate-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          align-items: center;
        }
        .coordinate-label {
          font-weight: bold;
          width: 100px;
        }
        .coordinate-value {
          font-family: monospace;
        }
        .map-container-wrapper {
          position: relative;
          height: 40vh; /* Changed from 250px to 40vh */
          max-height: 200px; /* Added to limit maximum height */
          width: 100%; 
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid #ccc;
        }
      `}
      
     </style>

      <div className="location-name-container">
        <div className="flex space-x-2 mb-3">
          <input
            type="text"
            placeholder="Enter location name"
            value={locationName}
            onChange={handleLocationNameChange}
            className="location-name-input flex-grow"
          />
          <button
            type="button"
            className="location-button"
            onClick={handleGetCurrentLocation}
          >
            📍 Current Location
          </button>
        </div>
      </div>

      <div className="location-buttons">
        <button
          className={`location-button ${
            !isPickingSecondPoint && !searchMode ? "active" : ""
          }`}
          onClick={() => {
            setIsPickingSecondPoint(false);
            setSearchMode(false);
          }}
        >
          Set First Point
        </button>
        <button
          className={`location-button ${isPickingSecondPoint ? "active" : ""}`}
          onClick={togglePointPicking}
        >
          Set Second Point
        </button>
        {secondLocation && (
          <button className="location-button" onClick={clearSecondPoint}>
            Clear Second Point
          </button>
        )}
        <button
          className={`location-button ${searchMode ? "active" : ""}`}
          onClick={() => {
            setSearchMode(!searchMode);
            setIsPickingSecondPoint(false);
          }}
        >
          {searchMode ? "Exit Search Mode" : "🔍 Search Location"}
        </button>
      </div>

      {searchMode && (
        <div className="search-mode-indicator">
          🔍 Searching... Click "Exit Search Mode" to return to map interaction
        </div>
      )}

      <div className="map-container-wrapper">
        <MapContainer
          center={userLocation || fallbackPosition}
          zoom={16}
          style={{ height: "100%", width: "100%" }}
          dragging={!searchMode}
        >
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {userLocation && (
            <Marker
              position={userLocation}
              icon={blueIcon}
              draggable={!isPickingSecondPoint && !searchMode}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const position = marker.getLatLng();
                  const newPosition: [number, number] = [
                    position.lat,
                    position.lng,
                  ];
                  setUserLocation(newPosition);
                  onLocationChange(locationName, newPosition, secondLocation);
                },
              }}
            >
              <Popup>
                <div>
                  <strong>First Point</strong>
                  <br />
                  Lat: {userLocation[0].toFixed(6)}
                  <br />
                  Lng: {userLocation[1].toFixed(6)}
                </div>
              </Popup>
            </Marker>
          )}
          {secondLocation && (
            <Marker
              position={secondLocation}
              icon={redIcon}
              draggable={isPickingSecondPoint && !searchMode}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const position = marker.getLatLng();
                  const newPosition: [number, number] = [
                    position.lat,
                    position.lng,
                  ];
                  setSecondLocation(newPosition);
                  if (userLocation) {
                    onLocationChange(locationName, userLocation, newPosition);
                  }
                },
              }}
            >
              <Popup>
                <div>
                  <strong>Second Point</strong>
                  <br />
                  Lat: {secondLocation[0].toFixed(6)}
                  <br />
                  Lng: {secondLocation[1].toFixed(6)}
                </div>
              </Popup>
            </Marker>
          )}
          <SearchControl
            onSearchResultSelected={handleSearchResultSelected}
            searchMode={searchMode}
          />
          <LiveLocationTracker
            onLocationChange={handleLocationChange}
            setInitialView={!userLocation}
            disabled={searchMode || !liveLocationEnabled}
          />
          <MapEvents />
        </MapContainer>
      </div>

      <div className="coordinate-display">
        <h4 className="text-sm font-medium mb-2">Coordinates:</h4>
        <div className="coordinate-row">
          <span className="coordinate-label">First Point:</span>
          {userLocation ? (
            <span className="coordinate-value">
              {userLocation[0].toFixed(6)}, {userLocation[1].toFixed(6)}
            </span>
          ) : (
            <span className="text-gray-500">Not set</span>
          )}
        </div>
        <div className="coordinate-row">
          <span className="coordinate-label">Second Point:</span>
          {secondLocation ? (
            <span className="coordinate-value">
              {secondLocation[0].toFixed(6)}, {secondLocation[1].toFixed(6)}
            </span>
          ) : (
            <span className="text-gray-500">Not set</span>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-2">
          {searchMode ? (
            <strong>Search Mode: Use the search bar to find locations</strong>
          ) : isPickingSecondPoint ? (
            <strong>Click on the map to set the second point</strong>
          ) : (
            <strong>
              Click on the map to set the first point or drag the existing
              marker
            </strong>
          )}
        </div>
      </div>
    </div>
  );
};
