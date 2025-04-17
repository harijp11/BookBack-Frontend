import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import L from 'leaflet';

// Marker fix
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom location marker icon
const locationIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// 🔍 Search control component
const SearchControl = () => {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    const searchControl = GeoSearchControl({
      provider,
      style: 'bar',
      showMarker: true,
      showPopup: true,
      marker: {
        icon: DefaultIcon,
        draggable: false,
      },
      popupFormat: (result: { label: string }) => result.label,
      maxMarkers: 1,
      retainZoomLevel: false,
      animateZoom: true,
      autoClose: true,
      searchLabel: 'Search location...',
      keepResult: true,
    });

    map.addControl(searchControl);
    return () => {
      map.removeControl(searchControl);
    };
  }, [map]);

  return null;
};

// 🔄 Live Location tracker component
const LiveLocationTracker = ({ 
  onLocationChange 
}: { 
  onLocationChange: (pos: [number, number], accuracy: number) => void 
}) => {
  const map = useMap();
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser.");
      return;
    }

    // Initial location fix
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        map.setView(coords, 16);
        onLocationChange(coords, position.coords.accuracy);
      },
      (error) => {
        console.error("Error getting initial location:", error);
      },
      { enableHighAccuracy: true }
    );

    // Setup continuous tracking
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const coords: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        onLocationChange(coords, position.coords.accuracy);
      },
      (error) => {
        console.error("Error watching position:", error);
      },
      { 
        enableHighAccuracy: true, 
        maximumAge: 0,  // Don't use cached positions
        timeout: 5000   // Time to wait for a position in ms
      }
    );

    // Add a "center on my location" button
    const locateButton = L.control({ position: 'bottomright' });

    locateButton.onAdd = () => {
      const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
      const button = L.DomUtil.create('a', '', div);
      button.href = '#';
      button.title = 'Center on my location';
      button.innerHTML = '📍';
      button.style.fontSize = '20px';
      button.style.textAlign = 'center';
      button.style.lineHeight = '30px';
      
      L.DomEvent.on(button, 'click', (e) => {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latlng: [number, number] = [
              position.coords.latitude,
              position.coords.longitude,
            ];
            map.setView(latlng, 16);
          },
          (error) => {
            console.error("Error centering on location:", error);
          },
          { enableHighAccuracy: true }
        );
      });
      
      return div;
    };
    
    locateButton.addTo(map);

    // Cleanup
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      map.removeControl(locateButton);
    };
  }, [map, onLocationChange]);

  return null;
};

// 🧭 Compass/orientation component
const CompassHeading = ({ userLocation }: { userLocation: [number, number] | null }) => {
  const map = useMap();
  const [heading, setHeading] = useState<number | null>(null);
  
  useEffect(() => {
    if (!window.DeviceOrientationEvent) {
      console.warn("DeviceOrientation not supported");
      return;
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      // Use compassHeading or alpha depending on what's available
      const alpha = event.webkitCompassHeading || event.alpha;
      
      if (alpha !== null) {
        // Convert to degrees if necessary
        const degrees = event.webkitCompassHeading ? alpha : 360 - alpha;
        setHeading(degrees);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, true);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [map]);

  return null;
};

// 🌍 Main MapView component
const MapView: React.FC = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [isTracking, setIsTracking] = useState<boolean>(true);
  const fallbackPosition: [number, number] = [51.505, -0.09]; // London fallback

  const handleLocationChange = (pos: [number, number], acc: number) => {
    setUserLocation(pos);
    setAccuracy(acc);
  };

  const toggleTracking = () => {
    setIsTracking(!isTracking);
  };

  // Pulsating circle effect for user location
 
  return (
    <div className="map-wrapper">
      <style>
        {`
          @keyframes pulse {
            0% {
              transform: scale(0.7);
              opacity: 1;
            }
            50% {
              transform: scale(1);
              opacity: 0.8;
            }
            100% {
              transform: scale(0.7);
              opacity: 1;
            }
          }
          .location-button {
            position: absolute;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            background: white;
            border: 2px solid rgba(0,0,0,0.2);
            border-radius: 4px;
            padding: 5px 10px;
            cursor: pointer;
          }
          .location-info {
            position: absolute;
            bottom: 20px;
            left: 20px;
            z-index: 1000;
            background: white;
            border: 2px solid rgba(0,0,0,0.2);
            border-radius: 4px;
            padding: 5px 10px;
            font-size: 12px;
          }
        `}
      </style>
      
      <MapContainer 
        center={userLocation || fallbackPosition} 
        zoom={16} 
        style={{ height: '500px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        
        {userLocation && (
          <>
            {/* Accuracy circle */}
            <Circle 
              center={userLocation}
              radius={accuracy}
              color="blue"
              fillColor="blue"
              fillOpacity={0.1}
            />
            
            {/* User location marker */}
            <Marker 
              position={userLocation} 
              icon={locationIcon}
              zIndexOffset={1000}
            >
              <Popup>
                <div>
                  <strong>Your current location</strong><br />
                  Lat: {userLocation[0].toFixed(6)}<br />
                  Lng: {userLocation[1].toFixed(6)}<br />
                  Accuracy: {accuracy.toFixed(1)} meters
                </div>
              </Popup>
            </Marker>
            
            {/* Pulsating circle to indicate live tracking */}
            {isTracking && (
              <Circle 
                center={userLocation}
                radius={8}
                color="blue"
                fillColor="blue"
                fillOpacity={0.6}
                weight={2}
                pathOptions={{ className: "pulsating-circle" }}
              />
            )}
          </>
        )}
        
        <SearchControl />
        {isTracking && <LiveLocationTracker onLocationChange={handleLocationChange} />}
        {userLocation && <CompassHeading userLocation={userLocation} />}
      </MapContainer>
      
      {/* Location information display */}
      {userLocation && (
        <div className="location-info">
          <div>Lat: {userLocation[0].toFixed(6)}</div>
          <div>Lng: {userLocation[1].toFixed(6)}</div>
          <div>Accuracy: {accuracy.toFixed(1)}m</div>
        </div>
      )}
      
      {/* Tracking toggle button */}
      <button className="location-button" onClick={toggleTracking}>
        {isTracking ? "🔴 Stop Tracking" : "▶️ Start Tracking"}
      </button>
    </div>
  );
};

export default MapView;