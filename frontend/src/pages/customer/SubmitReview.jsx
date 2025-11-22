import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, Star, Send, AlertCircle } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StarRating from "../../components/common/StarRating";
import Button from "../../components/common/Button";
import reviewService from "../../api/reviewService";
import toast from "react-hot-toast";

const SubmitReview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;
  const [rating, setRating] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors: _errors },
  } = useForm();

  if (!booking) {
    return (
      <DashboardLayout>
        <div className="card text-center py-12">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h3 className="text-xl font-bold mb-2">Booking Not Found</h3>
          <p className="text-dark-muted mb-4">
            Please select a completed booking to leave a review
          </p>
          <button
            onClick={() => navigate("/customer/bookings")}
            className="btn-primary"
          >
            Back to Bookings
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const onSubmit = async (data) => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setLoading(true);
    try {
      // if user selected files, upload them first and obtain URLs
      let imageUrls = [];
      if (selectedFiles && selectedFiles.length > 0) {
        const uploadRes = await reviewService.uploadImages(selectedFiles);
        // uploadRes expected shape: { urls: [ ... ] }
        imageUrls = uploadRes.urls || [];
      }

      const reviewData = {
        booking_id: booking.booking_id,
        rating: rating,
        comment: data.comment || "",
        images: imageUrls,
      };

      await reviewService.submitReview(reviewData);
      toast.success("Review submitted successfully! ⭐");
      navigate("/customer/bookings");
    } catch (error) {
      console.error("Review submission error:", error);
      toast.error(error.detail || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-dark-muted hover:text-primary-500 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Header */}
        <div className="card">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Write a Review ⭐
          </h1>
          <p className="text-dark-muted">
            Share your experience with {booking.provider?.user?.name}
          </p>
        </div>

        {/* Provider Info */}
        <div className="card bg-primary-500/5 border-primary-500">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-bold">
                {booking.provider?.user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {booking.provider?.user?.name}
              </h3>
              <p className="text-sm text-dark-muted">
                {booking.service_type.replace(/_/g, " ").toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Review Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
          <h2 className="text-xl font-bold">Your Review</h2>

          {/* Rating */}
          <div>
            <label className="label">Rate Your Experience *</label>
            <div className="flex items-center gap-4 p-4 bg-dark-bg rounded-lg border border-dark-border">
              <StarRating
                rating={rating}
                onRatingChange={setRating}
                size={32}
                showValue={false}
              />
              <div className="flex-1">
                {rating === 0 && (
                  <p className="text-sm text-dark-muted">Click to rate</p>
                )}
                {rating === 1 && <p className="text-sm text-red-500">Poor</p>}
                {rating === 2 && (
                  <p className="text-sm text-orange-500">Fair</p>
                )}
                {rating === 3 && (
                  <p className="text-sm text-yellow-500">Good</p>
                )}
                {rating === 4 && (
                  <p className="text-sm text-green-500">Very Good</p>
                )}
                {rating === 5 && (
                  <p className="text-sm text-green-500">Excellent!</p>
                )}
              </div>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="label">Your Review (Optional)</label>
            <textarea
              {...register("comment")}
              rows={6}
              placeholder="Tell us about your experience... What did you like? Any suggestions for improvement?"
              className="input-field resize-none"
            />
            <p className="mt-1 text-xs text-dark-muted">
              Share specific details to help other customers make informed
              decisions
            </p>
          </div>

          {/* Image upload */}
          <div>
            <label className="label">Add Images (optional)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
              className="mt-2"
            />
            <p className="mt-1 text-xs text-dark-muted">
              You can attach up to 5 images. Images will be uploaded and URLs
              added to your review.
            </p>
          </div>

          {/* Guidelines */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <h4 className="font-bold text-yellow-500 mb-2 flex items-center gap-2">
              <AlertCircle size={18} />
              Review Guidelines
            </h4>
            <ul className="text-sm text-dark-muted space-y-1 list-disc list-inside">
              <li>Be honest and constructive in your feedback</li>
              <li>Focus on the service quality and professionalism</li>
              <li>Avoid personal attacks or inappropriate language</li>
              <li>Your review helps other customers make informed decisions</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              icon={Send}
              fullWidth
            >
              Submit Review
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default SubmitReview;
