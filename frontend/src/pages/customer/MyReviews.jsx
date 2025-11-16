import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Loader2, AlertCircle } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ReviewCard from "../../components/common/ReviewCard";
import Skeleton from "../../components/common/Skeleton";
import reviewService from "../../api/reviewService";
import toast from "react-hot-toast";

const MyReviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const fetchMyReviews = async () => {
    setLoading(true);
    try {
      const data = await reviewService.getMyReviews();
      setReviews(data);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="card">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">My Reviews ⭐</h1>
          <p className="text-dark-muted">
            Reviews you've written for service providers
          </p>
        </div>

        {/* Stats */}
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

        {/* Loading State */}
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

        {/* Empty State */}
        {!loading && reviews.length === 0 && (
          <div className="card text-center py-12">
            <Star className="mx-auto mb-4 text-dark-muted" size={64} />
            <h3 className="text-xl font-bold mb-2">No Reviews Yet</h3>
            <p className="text-dark-muted mb-6">
              Complete a service and share your experience
            </p>
            <button
              onClick={() => navigate("/customer/bookings")}
              className="btn-primary"
            >
              View My Bookings
            </button>
          </div>
        )}

        {/* Reviews List */}
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

export default MyReviews;
