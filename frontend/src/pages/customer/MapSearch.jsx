import { useState, useEffect, useCallback } from "react";
import { MapPin, Loader2, AlertCircle, Navigation } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ProviderMap from "../../components/map/ProviderMap";
import MapFilters from "../../components/map/MapFilters";
import Button from "../../components/common/Button";
import providersService from "../../api/providersService";
import toast from "react-hot-toast";

const MapSearch = () => {
  const [providers, setProviders] = useState([]);
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [filters, setFilters] = useState({
    service: "",
    radius: 10,
    min_rating: "",
    max_price: "",
    available_only: true,
  });
  const searchProviders = useCallback(
    async (lat, lng) => {
      setLoading(true);
      try {
        const params = {
          service: filters.service || undefined,
          min_rating: filters.min_rating
            ? parseFloat(filters.min_rating)
            : undefined,
          max_price: filters.max_price
            ? parseFloat(filters.max_price)
            : undefined,
          available_only: filters.available_only,
        };

        const data = await providersService.getNearbyProviders(
          lat,
          lng,
          filters.radius,
          params
        );

        setProviders(data.providers);

        if (data.providers.length === 0) {
          toast("No providers found in this area. Try increasing radius.", {
            icon: "🔍",
          });
        } else {
          toast.success(`Found ${data.providers.length} provider(s) nearby`);
        }
      } catch (error) {
        console.error("Map search error:", error);
        toast.error("Failed to search providers");
      } finally {
        setLoading(false);
        setLocationLoading(false);
      }
    },
    [filters]
  );

  const getUserLocation = useCallback(() => {
    setLocationLoading(true);

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setLocationLoading(false);
      // Default to Goa center
      searchProviders(15.2993, 74.124);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        searchProviders(latitude, longitude);
        toast.success("Location detected!");
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Could not get your location. Using default.");
        setLocationLoading(false);
        // Default to Goa center
        setUserLocation([15.2993, 74.124]);
        searchProviders(15.2993, 74.124);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds
      }
    );
  }, [searchProviders]);

  useEffect(() => {
    // Try to get user location on mount
    getUserLocation();
  }, [getUserLocation]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    if (userLocation) {
      searchProviders(userLocation[0], userLocation[1]);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      service: "",
      radius: 10,
      min_rating: "",
      max_price: "",
      available_only: true,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <MapPin className="text-primary-500" size={28} />
                Map Search
              </h1>
              <p className="text-dark-muted">
                Find service providers near you on the map
              </p>
            </div>
            <Button
              variant="primary"
              icon={Navigation}
              loading={locationLoading}
              onClick={getUserLocation}
            >
              Detect Location
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card">
            <p className="text-dark-muted text-sm">Total Found</p>
            <p className="text-2xl font-bold text-primary-500">
              {providers.length}
            </p>
          </div>
          <div className="card">
            <p className="text-dark-muted text-sm">Search Radius</p>
            <p className="text-2xl font-bold text-green-500">
              {filters.radius} km
            </p>
          </div>
          <div className="card">
            <p className="text-dark-muted text-sm">Location</p>
            <p className="text-sm font-medium">
              {userLocation ? "📍 Detected" : "🌍 Goa (Default)"}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <MapFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />

            <Button
              variant="primary"
              onClick={handleApplyFilters}
              loading={loading}
              fullWidth
              icon={MapPin}
            >
              Apply Filters
            </Button>

            {/* Provider List */}
            {providers.length > 0 && (
              <div className="bg-dark-card border border-dark-border rounded-lg p-4">
                <h3 className="font-bold mb-3 text-sm">Providers List</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {providers.map((provider) => (
                    <div
                      key={provider.provider_id}
                      className="p-3 bg-dark-bg hover:bg-dark-hover rounded border border-dark-border cursor-pointer transition-colors"
                      onClick={() => {
                        // Select provider to center map and open popup
                        setSelectedProviderId(provider.provider_id);
                        toast.info(
                          `${provider.name} - ${provider.distance_km} km away`
                        );
                        // clear selection after a short delay so clicking again will re-open
                        setTimeout(() => setSelectedProviderId(null), 3000);
                      }}
                    >
                      <p className="font-medium text-sm">{provider.name}</p>
                      <p className="text-xs text-dark-muted">
                        {provider.distance_km} km • ₹{provider.pricing}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            <div
              className="card p-0 overflow-hidden"
              style={{ height: "600px" }}
            >
              {loading ? (
                <div className="h-full flex items-center justify-center bg-dark-bg">
                  <div className="text-center">
                    <Loader2
                      className="animate-spin text-primary-500 mx-auto mb-4"
                      size={48}
                    />
                    <p className="text-dark-muted">Loading map...</p>
                  </div>
                </div>
              ) : !userLocation ? (
                <div className="h-full flex items-center justify-center bg-dark-bg">
                  <div className="text-center">
                    <Navigation
                      className="text-primary-500 mx-auto mb-4"
                      size={48}
                    />
                    <p className="text-dark-text font-bold mb-2">
                      Location Access Required
                    </p>
                    <p className="text-dark-muted mb-4">
                      Allow location access to find providers near you
                    </p>
                    <Button
                      variant="primary"
                      onClick={getUserLocation}
                      loading={locationLoading}
                    >
                      Enable Location
                    </Button>
                  </div>
                </div>
              ) : (
                <ProviderMap
                  providers={providers}
                  userLocation={userLocation}
                  radius={filters.radius}
                  selectedProviderId={selectedProviderId}
                />
              )}
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="card bg-blue-500/5 border-blue-500/20">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <AlertCircle className="text-blue-500" size={18} />
            How to use Map Search
          </h3>
          <ul className="text-sm text-dark-muted space-y-1 list-disc list-inside">
            <li>Click "Detect Location" to find providers near you</li>
            <li>Use the radius slider to expand or narrow your search area</li>
            <li>Click on map markers to see provider details</li>
            <li>Filter by service type, rating, or price</li>
            <li>Click "View Profile" in popup to book a service</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MapSearch;
