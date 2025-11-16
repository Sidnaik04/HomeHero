import { Star } from "lucide-react";
import { useState } from "react";

const StarRating = ({
  rating = 0,
  onRatingChange,
  size = 24,
  readonly = false,
  showValue = true,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (!readonly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => handleClick(value)}
            onMouseEnter={() => handleMouseEnter(value)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={`transition-colors ${
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
            }`}
          >
            <Star
              size={size}
              className={`transition-all ${
                value <= displayRating
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-gray-600"
              }`}
            />
          </button>
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-dark-muted">
          {displayRating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
