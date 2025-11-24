import { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import { Target } from "lucide-react";
import ProviderMarker from "./ProviderMarker";
import "leaflet/dist/leaflet.css";

// Component to re-center map
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const ProviderMap = ({
  providers,
  userLocation,
  radius,
  onLocationChange,
  selectedProviderId,
}) => {
  const [mapCenter, setMapCenter] = useState(
    userLocation || [15.2993, 74.124] // Default: Center of Goa
  );
  const [mapZoom, setMapZoom] = useState(userLocation ? 12 : 10);
  const markerRefs = useRef({});

  useEffect(() => {
    if (userLocation) {
      setMapCenter(userLocation);
      setMapZoom(12);
    }
  }, [userLocation]);

  // If a provider is selected from the list, center the map and open its popup
  useEffect(() => {
    if (!selectedProviderId) return;

    const marker = markerRefs.current[selectedProviderId];
    if (marker && marker.openPopup) {
      const latlng = marker.getLatLng ? marker.getLatLng() : null;
      if (latlng) {
        setMapCenter([latlng.lat, latlng.lng]);
        setMapZoom(14);
      }
      try {
        marker.openPopup();
      } catch {
        // ignore
      }
    }
  }, [selectedProviderId]);

  const handleRecenter = () => {
    if (userLocation) {
      setMapCenter(userLocation);
      setMapZoom(12);
    }
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <ChangeView center={mapCenter} zoom={mapZoom} />

        {/* Base Map Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Marker */}
        {userLocation && (
          <>
            <Marker position={userLocation}>
              <Popup>
                <div className="text-center">
                  <p className="font-bold">Your Location</p>
                  <p className="text-xs text-gray-600">
                    Searching within {radius} km
                  </p>
                </div>
              </Popup>
            </Marker>

            {/* Search Radius Circle */}
            <Circle
              center={userLocation}
              radius={radius * 1000} // Convert km to meters
              pathOptions={{
                fillColor: "#0066ff",
                fillOpacity: 0.1,
                color: "#0066ff",
                weight: 2,
              }}
            />
          </>
        )}

        {/* Provider Markers */}
        {providers.map((provider) => (
          <ProviderMarker
            key={provider.provider_id}
            provider={provider}
            markerRefs={markerRefs}
          />
        ))}
      </MapContainer>

      {/* Re-center Button */}
      {userLocation && (
        <button
          onClick={handleRecenter}
          className="absolute bottom-6 right-6 z-[1000] w-12 h-12 bg-white hover:bg-gray-100 rounded-full shadow-lg flex items-center justify-center transition-colors"
          title="Re-center to your location"
        >
          <Target size={20} className="text-blue-600" />
        </button>
      )}
    </div>
  );
};

export default ProviderMap;
