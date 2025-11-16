import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  ArrowLeft,
  Star,
  MapPin,
  Briefcase,
  IndianRupee,
  Calendar,
  Phone,
  Mail,
} from "lucide-react";
import { useState, useEffect } from "react";
import reviewService from "../../api/reviewService";
import ReviewCard from "../../components/common/ReviewCard";
import Skeleton from "../../components/common/Skeleton";

const ProviderDetail = () => {
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();
  const provider = location.state?.provider;

  useEffect(() => {
    const fetchReviews = async () => {
      if (!provider?.provider_id) return;
      setReviewsLoading(true);
      try {
        const data = await reviewService.getProviderReviews(
          provider.provider_id
        );
        setReviews(data);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [provider?.provider_id]);

  if (!provider) {
    return (
      <DashboardLayout>
        <div className="card text-center py-12">
          <p className="text-dark-muted">Provider not found</p>
          <button
            onClick={() => navigate("/customer/search")}
            className="btn-primary mt-4"
          >
            Back to Search
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-dark-muted hover:text-primary-500 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Search
        </button>

        {/* Provider Header */}
        <div className="card">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-3xl font-bold">
                {provider.user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {provider.user?.name}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-dark-muted">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      {provider.user?.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase size={16} />
                      {provider.experience_years}+ years
                    </div>
                  </div>
                </div>

                {/* Rating */}
                {provider.rating > 0 && (
                  <div className="flex items-center gap-2 bg-yellow-500/10 px-4 py-2 rounded-lg">
                    <Star
                      size={20}
                      className="text-yellow-500 fill-yellow-500"
                    />
                    <span className="text-xl font-bold text-yellow-500">
                      {provider.rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={16} className="text-primary-500" />
                  <span>{provider.user?.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={16} className="text-primary-500" />
                  <span>{provider.user?.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services and Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Services */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Briefcase className="text-primary-500" />
              Services Offered
            </h2>
            <div className="flex flex-wrap gap-2">
              {provider.services?.map((service, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-primary-500/10 text-primary-500 rounded-lg font-medium"
                >
                  {service.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <IndianRupee className="text-green-500" />
              Pricing
            </h2>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-green-500">
                ₹{provider.pricing}
              </span>
              <span className="text-dark-muted">/service</span>
            </div>
            <p className="text-sm text-dark-muted mt-2">
              Base price. Actual cost may vary based on service complexity.
            </p>
          </div>
        </div>

        {/* Book Now Section */}
        <div className="card bg-primary-500/5 border-primary-500">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2">Ready to Book?</h3>
              <p className="text-dark-muted">
                Schedule a service with {provider.user?.name}
              </p>
            </div>
            <button
              onClick={() =>
                navigate("/customer/book", { state: { provider } })
              }
              className="btn-primary flex items-center gap-2 w-full md:w-auto"
            >
              <Calendar size={20} />
              Book Now
            </button>
          </div>
        </div>

        {/* Reviews Section*/}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">
            Customer Reviews ({reviews.length})
          </h2>

          {reviewsLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton variant="avatar" />
                  <div className="flex-1 space-y-2">
                    <Skeleton variant="title" />
                    <Skeleton variant="text" />
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-dark-muted text-center py-8">
              No reviews yet. Be the first to review this provider!
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard key={review.review_id} review={review} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProviderDetail;
