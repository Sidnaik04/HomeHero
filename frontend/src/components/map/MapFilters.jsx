import { useState } from "react";
import { Filter, X, Sliders } from "lucide-react";
import { SERVICE_CATEGORIES } from "../../constants";

const MapFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg shadow-lg">
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-dark-hover transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-primary-500" />
          <span className="font-medium">Filters</span>
        </div>
        <div className="flex items-center gap-2">
          {Object.values(filters).some((v) => v) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearFilters();
              }}
              className="text-xs text-red-500 hover:text-red-400"
            >
              Clear
            </button>
          )}
          <Sliders
            size={18}
            className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-4 space-y-4 border-t border-dark-border">
          {/* Service Type */}
          <div>
            <label className="label text-sm">Service Type</label>
            <select
              value={filters.service || ""}
              onChange={(e) => handleChange("service", e.target.value)}
              className="input-field text-sm"
            >
              <option value="">All Services</option>
              {SERVICE_CATEGORIES.map((service) => (
                <option key={service} value={service}>
                  {service.replace(/_/g, " ").toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Radius Slider */}
          <div>
            <label className="label text-sm">
              Search Radius:{" "}
              <span className="text-primary-500">
                {filters.radius || 10} km
              </span>
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={filters.radius || 10}
              onChange={(e) => handleChange("radius", Number(e.target.value))}
              className="w-full accent-primary-500"
            />
            <div className="flex justify-between text-xs text-dark-muted mt-1">
              <span>1 km</span>
              <span>50 km</span>
            </div>
          </div>

          {/* Min Rating */}
          <div>
            <label className="label text-sm">Minimum Rating</label>
            <select
              value={filters.min_rating || ""}
              onChange={(e) => handleChange("min_rating", e.target.value)}
              className="input-field text-sm"
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5+ ⭐</option>
              <option value="4.0">4.0+ ⭐</option>
              <option value="3.5">3.5+ ⭐</option>
              <option value="3.0">3.0+ ⭐</option>
            </select>
          </div>

          {/* Max Price */}
          <div>
            <label className="label text-sm">Maximum Price (₹)</label>
            <input
              type="number"
              placeholder="Any price"
              value={filters.max_price || ""}
              onChange={(e) => handleChange("max_price", e.target.value)}
              className="input-field text-sm"
              min="0"
            />
          </div>

          {/* Availability */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="available"
              checked={filters.available_only !== false}
              onChange={(e) => handleChange("available_only", e.target.checked)}
              className="w-4 h-4 rounded border-dark-border bg-dark-bg text-primary-600 focus:ring-primary-500"
            />
            <label
              htmlFor="available"
              className="text-sm text-dark-text cursor-pointer"
            >
              Available Now Only
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapFilters;
