import { format } from "date-fns";
import StarRating from "./StarRating";
import { User } from "lucide-react";

const ReviewCard = ({ review }) => {
  return (
    <div className="card">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
          {review.customer?.avatar_url ? (
            <img
              src={review.customer.avatar_url}
              alt={review.customer.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-white font-bold">
              {review.customer?.name?.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Review Content */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div>
              <h3 className="font-bold">{review.customer?.name}</h3>
              <p className="text-xs text-dark-muted">
                {format(new Date(review.created_at), "MMM dd, yyyy")}
              </p>
            </div>
            <StarRating
              rating={review.rating}
              readonly
              size={18}
              showValue={false}
            />
          </div>

          {/* Comment */}
          {review.comment && (
            <p className="text-dark-muted text-sm leading-relaxed">
              {review.comment}
            </p>
          )}

          {/* Service Type */}
          {review.booking?.service_type && (
            <div className="mt-2">
              <span className="text-xs bg-primary-500/10 text-primary-500 px-2 py-1 rounded-full">
                {review.booking.service_type.replace(/_/g, " ").toUpperCase()}
              </span>
            </div>
          )}

          {/* Images */}
          {review.images && review.images.length > 0 && (
            <div className="mt-3 flex gap-2 flex-wrap">
              {review.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Review ${index + 1}`}
                  className="w-20 h-20 rounded-lg object-cover border border-dark-border cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => window.open(image, "_blank")}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
