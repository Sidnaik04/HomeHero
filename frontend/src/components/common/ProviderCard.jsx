import {
  Star,
  MapPin,
  Phone,
  Briefcase,
  IndianRupee,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProviderCard = ({ provider }) => {
  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate(`/customer/provider/${provider.provider_id}`, {
      state: { provider },
    });
  };

  return (
    <div className="card hover:border-primary-500 transition-all cursor-pointer group">
      <div onClick={handleBookNow}>
        {/* Header with Avatar and Status */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-bold">
                {provider.user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            {/* Availability Badge */}
            {provider.availability && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-dark-card">
                <Check size={12} className="text-white" />
              </div>
            )}
          </div>

          {/* Name and Location */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-dark-text group-hover:text-primary-500 transition-colors truncate">
              {provider.user?.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-dark-muted mt-1">
              <MapPin size={14} />
              <span className="truncate">{provider.user?.location}</span>
            </div>
          </div>

          {/* Rating */}
          {provider.rating > 0 && (
            <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-lg">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium text-yellow-500">
                {provider.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Services */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-dark-muted mb-2">
            <Briefcase size={14} />
            <span className="font-medium">Services:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {provider.services?.slice(0, 3).map((service, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary-500/10 text-primary-500 rounded-full text-xs font-medium"
              >
                {service.replace(/_/g, " ")}
              </span>
            ))}
            {provider.services?.length > 3 && (
              <span className="px-3 py-1 bg-dark-bg text-dark-muted rounded-full text-xs">
                +{provider.services.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Footer with Price and Contact */}
        <div className="flex items-center justify-between pt-4 border-t border-dark-border">
          {/* Pricing */}
          <div className="flex items-center gap-1">
            <IndianRupee size={16} className="text-green-500" />
            <span className="text-lg font-bold text-dark-text">
              {provider.pricing}
            </span>
            <span className="text-sm text-dark-muted">/service</span>
          </div>

          {/* Experience */}
          {provider.experience_years > 0 && (
            <div className="text-sm text-dark-muted">
              {provider.experience_years}+ years exp.
            </div>
          )}
        </div>

        {/* Availability Status */}
        <div className="mt-3">
          {provider.availability ? (
            <span className="text-xs text-green-500 flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Available Now
            </span>
          ) : (
            <span className="text-xs text-red-500 flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Currently Unavailable
            </span>
          )}
        </div>
      </div>

      {/* Action Button */}
      <button onClick={handleBookNow} className="btn-primary w-full mt-4">
        Book Now
      </button>
    </div>
  );
};

export default ProviderCard;
