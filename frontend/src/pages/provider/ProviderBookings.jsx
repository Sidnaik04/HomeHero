import { useState, useEffect, useCallback, useMemo } from "react";
import { Calendar, CheckCircle, XCircle, Loader2 } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import BookingStatusBadge from "../../components/common/BookingStatusBadge";
import Button from "../../components/common/Button";
import Skeleton from "../../components/common/Skeleton";
import bookingsService from "../../api/bookingsService";
import { format } from "date-fns";
import toast from "react-hot-toast";

const ProviderBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [actionLoading, setActionLoading] = useState(null);

  const STATUSES = [
    "pending",
    "accepted",
    "completed",
    "declined",
    "cancelled",
    "all",
  ];

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bookingsService.getMyBookings();
      setBookings(data || []);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleRespond = useCallback(
    async (bookingId, response) => {
      setActionLoading(bookingId);
      try {
        await bookingsService.respondToBooking(bookingId, response);
        toast.success(
          response === "accepted" ? "Booking accepted! 🎉" : "Booking declined"
        );
        await fetchBookings();
      } catch (error) {
        console.error(`${response} error:`, error);
        toast.error(`Failed to ${response} booking`);
      } finally {
        setActionLoading(null);
      }
    },
    [fetchBookings]
  );

  const handleAccept = (id) => handleRespond(id, "accepted");
  const handleDecline = (id) => handleRespond(id, "declined");
  const handleComplete = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      await bookingsService.completeBooking(bookingId);
      toast.success("Service marked as completed!");
      fetchBookings();
    } catch (error) {
      console.error("Complete error:", error);
      toast.error("Failed to mark as completed");
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = useMemo(
    () => bookings.filter((b) => b.status === "pending").length,
    [bookings]
  );

  const filteredBookings = useMemo(
    () =>
      bookings.filter((booking) =>
        filter === "all" ? true : booking.status === filter
      ),
    [bookings, filter]
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="card">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            My Bookings 📋
          </h1>
          <p className="text-dark-muted">
            Manage your service bookings and appointments
          </p>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((status) => (
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
                {status === "pending" && pendingCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
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
            <p className="text-dark-muted">
              {filter === "pending"
                ? "New booking requests will appear here"
                : `You don't have any ${filter} bookings`}
            </p>
          </div>
        )}

        {/* Bookings List */}
        {!loading && filteredBookings.length > 0 && (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const customerName = booking.customer?.name || "Unknown";
              return (
                <div key={booking.booking_id} className="card">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Customer Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold">
                          {customerName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg mb-1">
                          {customerName}
                        </h3>
                        <p className="text-sm text-dark-muted mb-2">
                          {(booking.service_type || "")
                            .replace(/_/g, " ")
                            .toUpperCase()}
                        </p>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <span className="text-dark-muted">
                            📅{" "}
                            {format(
                              new Date(booking.date_time),
                              "MMM dd, yyyy"
                            )}
                          </span>
                          <span className="text-dark-muted">
                            🕐 {format(new Date(booking.date_time), "hh:mm a")}
                          </span>
                          <span className="text-dark-muted">
                            📍 {booking.customer?.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Status and Actions */}
                    <div className="flex flex-col items-end gap-3">
                      <BookingStatusBadge status={booking.status} />

                      {booking.estimated_price && (
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-500">
                            ₹{booking.estimated_price}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons for Pending */}
                      {booking.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            variant="success"
                            icon={CheckCircle}
                            loading={actionLoading === booking.booking_id}
                            onClick={() => handleAccept(booking.booking_id)}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="danger"
                            icon={XCircle}
                            disabled={actionLoading === booking.booking_id}
                            onClick={() => handleDecline(booking.booking_id)}
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                      {booking.status === "accepted" && (
                        <Button
                          variant="success"
                          loading={actionLoading === booking.booking_id}
                          onClick={() => handleComplete(booking.booking_id)}
                        >
                          Mark as Completed
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Special Instructions */}
                  {booking.special_instructions && (
                    <div className="mt-4 pt-4 border-t border-dark-border">
                      <p className="text-sm">
                        <span className="font-medium text-dark-text">
                          Customer Note:{" "}
                        </span>
                        <span className="text-dark-muted">
                          {booking.special_instructions}
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Customer Contact */}
                  {(booking.status === "accepted" ||
                    booking.status === "pending") && (
                    <div className="mt-4 pt-4 border-t border-dark-border">
                      <div className="flex flex-wrap gap-4 text-sm">
                        <a
                          href={`tel:${booking.customer?.phone}`}
                          className="text-primary-500 hover:text-primary-400 flex items-center gap-1"
                        >
                          📞 {booking.customer?.phone}
                        </a>
                        <a
                          href={`mailto:${booking.customer?.email}`}
                          className="text-primary-500 hover:text-primary-400 flex items-center gap-1"
                        >
                          ✉️ {booking.customer?.email}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProviderBookings;
