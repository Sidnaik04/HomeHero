import { Marker, Popup } from "react-leaflet";
import { Star, MapPin, IndianRupee, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";

// Fix for default marker icon
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom colored marker
const createCustomIcon = (color = "#0066ff") => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <div style="
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(45deg);
          color: white;
          font-size: 16px;
          font-weight: bold;
        ">📍</div>
      </div>
    `,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42],
  });
};

const ProviderMarker = ({ provider, markerRefs }) => {
  const navigate = useNavigate();

  const handleViewProvider = () => {
    navigate(`/customer/provider/${provider.provider_id}`, {
      state: { provider },
    });
  };

  return (
    <Marker
      position={[provider.latitude, provider.longitude]}
      icon={createCustomIcon(provider.availability ? "#0066ff" : "#666666")}
      ref={(ref) => {
        if (ref && markerRefs && markerRefs.current) {
          markerRefs.current[provider.provider_id] = ref;
        }
      }}
    >
      <Popup maxWidth={300} className="provider-popup">
        <div className="p-2">
          {/* Provider Info */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">
                {provider.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-gray-900 mb-1">
                {provider.name}
              </h3>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <MapPin size={12} />
                <span>{provider.location}</span>
              </div>
            </div>
            {provider.rating > 0 && (
              <div className="flex items-center gap-1 bg-yellow-100 px-2 py-0.5 rounded">
                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-medium text-yellow-700">
                  {provider.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Services */}
          <div className="flex flex-wrap gap-1 mb-3">
            {provider.services?.slice(0, 3).map((service, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs"
              >
                {service.replace(/_/g, " ")}
              </span>
            ))}
          </div>

          {/* Price & Distance */}
          <div className="flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center gap-1 text-green-600 font-bold">
              <IndianRupee size={14} />
              {provider.pricing}
            </div>
            <div className="text-gray-600">
              📍 {provider.distance_km} km away
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleViewProvider}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            View Profile
            <ArrowRight size={16} />
          </button>
        </div>
      </Popup>
    </Marker>
  );
};

export default ProviderMarker;
