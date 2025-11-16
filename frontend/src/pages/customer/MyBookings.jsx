import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Loader2, AlertCircle, Plus } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import BookingStatusBadge from "../../components/common/BookingStatusBadge";
import Skeleton from "../../components/common/Skeleton";
import bookingsService from "../../api/bookingsService";
import { format } from "date-fns";
import toast from "react-hot-toast";

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, accepted, completed, cancelled

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingsService.getMyBookings();
      setBookings(data);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true;
    return booking.status === filter;
  });

  const handleViewDetails = (booking) => {
    navigate(`/customer/bookings/${booking.booking_id}`, {
      state: { booking },
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                My Bookings 📋
              </h1>
              <p className="text-dark-muted">
                View and manage all your service bookings
              </p>
            </div>
            <button
              onClick={() => navigate("/customer/search")}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              New Booking
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-wrap gap-2">
            {["all", "pending", "accepted", "completed", "cancelled"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === status
                      ? "bg-primary-600 text-white"
                      : "bg-dark-bg text-dark-muted hover:text-dark-text hover:bg-dark-hover"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              )
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card">
                <Skeleton variant="title" className="mb-4" />
                <Skeleton variant="text" className="mb-2" />
                <Skeleton variant="text" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredBookings.length === 0 && (
          <div className="card text-center py-12">
            <Calendar className="mx-auto mb-4 text-dark-muted" size={64} />
            <h3 className="text-xl font-bold mb-2">
              {filter === "all" ? "No Bookings Yet" : `No ${filter} Bookings`}
            </h3>
            <p className="text-dark-muted mb-6">
              {filter === "all"
                ? "Start by finding service providers near you"
                : `You don't have any ${filter} bookings`}
            </p>
            <button
              onClick={() => navigate("/customer/search")}
              className="btn-primary"
            >
              Find Services
            </button>
          </div>
        )}

        {/* Bookings List */}
        {!loading && filteredBookings.length > 0 && (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.booking_id}
                className="card hover:border-primary-500 transition-all cursor-pointer"
                onClick={() => handleViewDetails(booking)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Provider Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">
                        {booking.provider?.user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg mb-1">
                        {booking.provider?.user?.name}
                      </h3>
                      <p className="text-sm text-dark-muted mb-2">
                        {booking.service_type.replace(/_/g, " ").toUpperCase()}
                      </p>
                      <div className="flex flex-wrap gap-2 text-sm">
                        <span className="text-dark-muted">
                          📅{" "}
                          {format(new Date(booking.date_time), "MMM dd, yyyy")}
                        </span>
                        <span className="text-dark-muted">
                          🕐 {format(new Date(booking.date_time), "hh:mm a")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Status and Price */}
                  <div className="flex flex-col items-end gap-2">
                    <BookingStatusBadge status={booking.status} />
                    {booking.estimated_price && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-500">
                          ₹{booking.estimated_price}
                        </p>
                        <p className="text-xs text-dark-muted">Estimated</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Special Instructions Preview */}
                {booking.special_instructions && (
                  <div className="mt-4 pt-4 border-t border-dark-border">
                    <p className="text-sm text-dark-muted line-clamp-2">
                      <span className="font-medium text-dark-text">Note: </span>
                      {booking.special_instructions}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyBookings;
