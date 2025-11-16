import { Search, MapPin, Filter, X } from "lucide-react";
import { GOA_LOCATIONS } from "../../constants";

const SearchFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-primary-500" />
          <h3 className="text-lg font-bold">Filters</h3>
        </div>
        <button
          onClick={onClearFilters}
          className="text-sm text-dark-muted hover:text-primary-500 transition-colors flex items-center gap-1"
        >
          <X size={16} />
          Clear All
        </button>
      </div>

      <div className="space-y-4">
        {/* Service Type */}
        <div>
          <label className="label">Service Type</label>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted"
              size={18}
            />
            <input
              type="text"
              placeholder="e.g., plumber, electrician"
              value={filters.service || ""}
              onChange={(e) => handleChange("service", e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="label">Location</label>
          <div className="relative">
            <MapPin
              className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted"
              size={18}
            />
            <select
              value={filters.location || ""}
              onChange={(e) => handleChange("location", e.target.value)}
              className="input-field pl-10"
            >
              <option value="">All Locations</option>
              {GOA_LOCATIONS.map((loc) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="label">Max Price (₹)</label>
          <input
            type="number"
            placeholder="Enter max price"
            value={filters.max_price || ""}
            onChange={(e) => handleChange("max_price", e.target.value)}
            className="input-field"
            min="0"
          />
        </div>

        {/* Min Rating */}
        <div>
          <label className="label">Minimum Rating</label>
          <select
            value={filters.min_rating || ""}
            onChange={(e) => handleChange("min_rating", e.target.value)}
            className="input-field"
          >
            <option value="">Any Rating</option>
            <option value="4.5">4.5+ ⭐</option>
            <option value="4.0">4.0+ ⭐</option>
            <option value="3.5">3.5+ ⭐</option>
            <option value="3.0">3.0+ ⭐</option>
          </select>
        </div>

        {/* Experience */}
        <div>
          <label className="label">Experience (years)</label>
          <select
            value={filters.min_experience || ""}
            onChange={(e) => handleChange("min_experience", e.target.value)}
            className="input-field"
          >
            <option value="">Any Experience</option>
            <option value="1">1+ years</option>
            <option value="3">3+ years</option>
            <option value="5">5+ years</option>
            <option value="10">10+ years</option>
          </select>
        </div>

        {/* Availability */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="available"
            checked={filters.available || false}
            onChange={(e) => handleChange("available", e.target.checked)}
            className="w-4 h-4 rounded border-dark-border bg-dark-bg text-primary-600 focus:ring-primary-500"
          />
          <label
            htmlFor="available"
            className="text-sm text-dark-text cursor-pointer"
          >
            Available Now Only
          </label>
        </div>

        {/* Sort By */}
        <div>
          <label className="label">Sort By</label>
          <select
            value={filters.sort_by || "rating"}
            onChange={(e) => handleChange("sort_by", e.target.value)}
            className="input-field"
          >
            <option value="rating">Highest Rating</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="experience">Most Experienced</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
