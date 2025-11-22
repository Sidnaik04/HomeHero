import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ReviewCard from "../../components/common/ReviewCard";
import Skeleton from "../../components/common/Skeleton";
import reviewService from "../../api/reviewService";
import providersService from "../../api/providersService";
import toast from "react-hot-toast";

const ProviderReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  // provider id used to fetch reviews (not stored separately)

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const profile = await providersService.getMyProfile();
        const id = profile?.provider_id;
        if (id) {
          const data = await reviewService.getProviderReviews(id);
          setReviews(data || []);
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.error("Failed to fetch provider reviews:", error);
        toast.error("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="card">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">My Reviews ⭐</h1>
          <p className="text-dark-muted">
            Reviews customers left for your services
          </p>
        </div>

        {!loading && reviews.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card">
              <p className="text-sm text-dark-muted mb-1">Total Reviews</p>
              <p className="text-3xl font-bold">{reviews.length}</p>
            </div>
            <div className="card">
              <p className="text-sm text-dark-muted mb-1">Average Rating</p>
              <p className="text-3xl font-bold text-yellow-500">
                {averageRating}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-dark-muted mb-1">5-Star Reviews</p>
              <p className="text-3xl font-bold text-green-500">
                {reviews.filter((r) => r.rating === 5).length}
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card">
                <div className="flex gap-4">
                  <Skeleton variant="avatar" />
                  <div className="flex-1 space-y-2">
                    <Skeleton variant="title" />
                    <Skeleton variant="text" />
                    <Skeleton variant="text" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && reviews.length === 0 && (
          <div className="card text-center py-12">
            <Star className="mx-auto mb-4 text-dark-muted" size={64} />
            <h3 className="text-xl font-bold mb-2">No Reviews Yet</h3>
            <p className="text-dark-muted mb-6">
              Customers will see an option to leave reviews after services are
              completed.
            </p>
          </div>
        )}

        {!loading && reviews.length > 0 && (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.review_id} review={review} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProviderReviews;
