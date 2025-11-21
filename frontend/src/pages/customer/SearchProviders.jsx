import { useState, useEffect } from "react";
import { useLocation as useRouterLocation } from "react-router-dom";
import { Search, Loader2, AlertCircle } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ProviderCard from "../../components/common/ProviderCard";
import SearchFilters from "../../components/common/SearchFilters";
import Skeleton from "../../components/common/Skeleton";
import providersService from "../../api/providersService";
import toast from "react-hot-toast";

const SearchProviders = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [filters, setFilters] = useState({
    service: "",
    location: "",
    max_price: "",
    min_rating: "",
    min_experience: "",
    available: false,
    sort_by: "rating",
  });

  // Auto-search when filters change (with debounce)
  useEffect(() => {
    if (!searched) return;

    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        // Prepare query params from current filters snapshot
        const params = {};
        if (filters.service) params.service = filters.service;
        if (filters.location) params.location = filters.location;
        if (filters.max_price) params.max_price = parseFloat(filters.max_price);
        if (filters.min_rating)
          params.min_rating = parseFloat(filters.min_rating);
        if (filters.sort_by) params.sort_by = filters.sort_by;
        if (filters.available) params.available = true;

        const data = await providersService.advancedSearch(params);
        setProviders(data);

        if (data.length === 0) {
          toast("No providers found. Try different filters.", { icon: "🔍" });
        }
      } catch (error) {
        console.error("Search error:", error);
        toast.error("Failed to search providers");
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [filters, searched]);

  // Add this after other useState hooks
  const routerLocation = useRouterLocation();

  // Add this useEffect after state declarations
  useEffect(() => {
    // Check if we have initial service from dashboard
    if (routerLocation.state?.service) {
      setFilters((prev) => ({
        ...prev,
        service: routerLocation.state.service,
      }));

      // Trigger an initial search using the service from router state
      // (do the search inline here to avoid referencing the handleSearch function
      // and keep the effect dependency array stable)
      const timer = setTimeout(async () => {
        setLoading(true);
        setSearched(true);

        try {
          const params = { service: routerLocation.state.service };
          const data = await providersService.advancedSearch(params);
          setProviders(data);

          if (data.length === 0) {
            toast("No providers found. Try different filters.", { icon: "🔍" });
          }
        } catch (error) {
          console.error("Search error:", error);
          toast.error("Failed to search providers");
        } finally {
          setLoading(false);
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [routerLocation.state]);

  const handleSearch = async () => {
    if (!filters.service && !filters.location) {
      toast.error("Please enter service type or location");
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      // Prepare query params
      const params = {};
      if (filters.service) params.service = filters.service;
      if (filters.location) params.location = filters.location;
      if (filters.max_price) params.max_price = parseFloat(filters.max_price);
      if (filters.min_rating)
        params.min_rating = parseFloat(filters.min_rating);
      if (filters.sort_by) params.sort_by = filters.sort_by;
      if (filters.available) params.available = true;

      const response = await providersService.advancedSearch(params);

      console.log("✅ RAW API RESPONSE:", response);
      console.log("📊 Response Type:", typeof response);
      console.log("📊 Is Array?:", Array.isArray(response));
      console.log("📊 Response Length:", response?.length);
      console.log(
        "📋 Provider Names:",
        response?.map((p) => p.user?.name || p.name)
      );
      console.log("📋 Full Response Data:", JSON.stringify(response, null, 2));

      if (!Array.isArray(response)) {
        console.error("❌ Response is not an array!", response);
        toast.error("Invalid response from server");
        setProviders([]);
        return;
      }

      console.log("💾 Setting providers state with:", response.length, "items");
      setProviders(response);

      if (response.length === 0) {
        toast("No providers found. Try different filters.", { icon: "🔍" });
      } else {
        toast.success(`Found ${response.length} provider(s)!`);
      }

      console.log("✅ FRONTEND SEARCH COMPLETE");
    } catch (error) {
      console.error("❌ FRONTEND SEARCH ERROR:", error);
      console.error("Error Response:", error.response);
      console.error("Error Data:", error.response?.data);
      toast.error("Failed to search providers");
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      service: "",
      location: "",
      max_price: "",
      min_rating: "",
      min_experience: "",
      available: false,
      sort_by: "rating",
    });
    setProviders([]);
    setSearched(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="card">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Find Service Providers 🔍
          </h1>
          <p className="text-dark-muted">
            Search and book trusted professionals in your area
          </p>
        </div>

        {/* Search Bar - Mobile */}
        <div className="card lg:hidden">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Search size={20} />
            )}
            Search Providers
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <SearchFilters
              filters={filters}
              onFilterChange={setFilters}
              onClearFilters={handleClearFilters}
            />

            {/* Search Button - Desktop */}
            <button
              onClick={handleSearch}
              disabled={loading}
              className="btn-primary w-full mt-4 hidden lg:flex"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Search size={20} />
              )}
              Search Providers
            </button>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-3">
            {/* Results Count */}
            {searched && !loading && (
              <div className="mb-4 flex items-center justify-between">
                <p className="text-dark-muted">
                  Found{" "}
                  <span className="font-bold text-primary-500">
                    {providers.length}
                  </span>{" "}
                  providers
                </p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="card">
                    <Skeleton variant="avatar" className="mb-4" />
                    <Skeleton variant="title" className="mb-2" />
                    <Skeleton variant="text" className="mb-2" />
                    <Skeleton variant="text" className="mb-4" />
                    <Skeleton variant="button" />
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {searched && !loading && providers.length === 0 && (
              <div className="card text-center py-12">
                <AlertCircle
                  className="mx-auto mb-4 text-dark-muted"
                  size={48}
                />
                <h3 className="text-xl font-bold mb-2">No Providers Found</h3>
                <p className="text-dark-muted mb-4">
                  Try adjusting your search filters to find more results
                </p>
                <button onClick={handleClearFilters} className="btn-primary">
                  Clear Filters
                </button>
              </div>
            )}

            {/* Results Grid */}
            {!loading && providers.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providers.map((provider) => (
                  <ProviderCard
                    key={provider.provider_id}
                    provider={provider}
                  />
                ))}
              </div>
            )}

            {/* Initial State */}
            {!searched && !loading && (
              <div className="card text-center py-12">
                <Search className="mx-auto mb-4 text-primary-500" size={48} />
                <h3 className="text-xl font-bold mb-2">Start Your Search</h3>
                <p className="text-dark-muted">
                  Use the filters to find the perfect service provider for your
                  needs
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SearchProviders;
