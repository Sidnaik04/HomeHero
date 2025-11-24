import { Star, MapPin, IndianRupee, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProviderSuggestion = ({ provider }) => {
  const navigate = useNavigate();

  const handleViewProvider = () => {
    navigate(`/customer/provider/${provider.provider_id}`, {
      state: { provider },
    });
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-4 hover:border-primary-500 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">
              {provider.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-dark-text">{provider.name}</h3>
            <div className="flex items-center gap-2 text-xs text-dark-muted">
              <MapPin size={12} />
              {provider.location}
            </div>
          </div>
        </div>
        {provider.rating > 0 && (
          <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded">
            <Star size={12} className="text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-medium text-yellow-500">
              {provider.rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {provider.services?.slice(0, 3).map((service, i) => (
          <span
            key={i}
            className="px-2 py-1 bg-primary-500/10 text-primary-500 rounded text-xs"
          >
            {service.replace(/_/g, " ").toUpperCase()}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-green-500">
          <IndianRupee size={16} />
          <span className="font-bold">{provider.pricing}</span>
        </div>
        <button
          onClick={handleViewProvider}
          className="flex items-center gap-1 text-primary-500 hover:text-primary-400 text-sm font-medium"
        >
          View Profile
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default ProviderSuggestion;
