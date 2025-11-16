import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  IndianRupee,
  FileText,
  Star,
  AlertCircle,
  XCircle,
  Edit,
  MessageCircle,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import BookingStatusBadge from "../../components/common/BookingStatusBadge";
import Button from "../../components/common/Button";
import bookingsService from "../../api/bookingsService";
import { format } from "date-fns";
import toast from "react-hot-toast";

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const fetchBookingDetails = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bookingsService.getBookingById(id);
      setBooking(data);
    } catch (error) {
      console.error("Failed to fetch booking:", error);
      toast.error("Failed to load booking details");
      navigate("/customer/bookings");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (!booking) {
      fetchBookingDetails();
    }
  }, [booking, fetchBookingDetails]);

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    setActionLoading(true);
    try {
      await bookingsService.cancelBooking(booking.booking_id, cancelReason);
      toast.success("Booking cancelled successfully");
      setShowCancelModal(false);
      fetchBookingDetails(); // Refresh booking data
    } catch (error) {
      console.error("Cancel error:", error);
      toast.error(error.detail || "Failed to cancel booking");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReschedule = () => {
    navigate(`/customer/bookings/${booking.booking_id}/reschedule`, {
      state: { booking },
    });
  };

  const canCancelOrReschedule = () => {
    return booking?.status === "pending" || booking?.status === "accepted";
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!booking) {
    return (
      <DashboardLayout>
        <div className="card text-center py-12">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h3 className="text-xl font-bold mb-2">Booking Not Found</h3>
          <button
            onClick={() => navigate("/customer/bookings")}
            className="btn-primary mt-4"
          >
            Back to Bookings
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/customer/bookings")}
          className="flex items-center gap-2 text-dark-muted hover:text-primary-500 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Bookings
        </button>

        {/* Header */}
        <div className="card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Booking Details
              </h1>
              <p className="text-dark-muted">
                Booking ID: {booking.booking_id.slice(0, 8)}...
              </p>
            </div>
            <BookingStatusBadge status={booking.status} />
          </div>
        </div>

        {/* Provider Information */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Provider Information</h2>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-bold">
                {booking.provider?.user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2">
                {booking.provider?.user?.name}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-dark-muted">
                  <MapPin size={16} />
                  {booking.provider?.user?.location}
                </div>
                <div className="flex items-center gap-2 text-dark-muted">
                  <Phone size={16} />
                  {booking.provider?.user?.phone}
                </div>
                <div className="flex items-center gap-2 text-dark-muted">
                  <Mail size={16} />
                  {booking.provider?.user?.email}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Service Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-dark-muted mb-1">Service Type</p>
              <p className="font-medium text-lg">
                {booking.service_type.replace(/_/g, " ").toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-sm text-dark-muted mb-1">Estimated Price</p>
              <div className="flex items-center gap-1">
                <IndianRupee size={20} className="text-green-500" />
                <span className="font-bold text-2xl text-green-500">
                  {booking.estimated_price || "N/A"}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-dark-muted mb-1">Scheduled Date</p>
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-primary-500" />
                <span className="font-medium">
                  {format(new Date(booking.date_time), "MMMM dd, yyyy")}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-dark-muted mb-1">Scheduled Time</p>
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-primary-500" />
                <span className="font-medium">
                  {format(new Date(booking.date_time), "hh:mm a")}
                </span>
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          {booking.special_instructions && (
            <div className="mt-4 pt-4 border-t border-dark-border">
              <div className="flex items-start gap-2">
                <FileText
                  size={18}
                  className="text-primary-500 mt-1 flex-shrink-0"
                />
                <div>
                  <p className="font-medium mb-1">Special Instructions</p>
                  <p className="text-dark-muted">
                    {booking.special_instructions}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Booking Timeline</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <Calendar size={16} className="text-white" />
                </div>
                <div className="w-0.5 h-full bg-dark-border"></div>
              </div>
              <div className="pb-6">
                <p className="font-medium">Booking Created</p>
                <p className="text-sm text-dark-muted">
                  {format(new Date(booking.created_at), "MMM dd, yyyy hh:mm a")}
                </p>
              </div>
            </div>

            {booking.status === "accepted" && (
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <Clock size={16} className="text-white" />
                  </div>
                  <div className="w-0.5 h-full bg-dark-border"></div>
                </div>
                <div className="pb-6">
                  <p className="font-medium">Booking Accepted</p>
                  <p className="text-sm text-dark-muted">
                    Provider confirmed the booking
                  </p>
                </div>
              </div>
            )}

            {booking.status === "completed" && (
              <div className="card bg-green-500/5 border-green-500">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold mb-1">
                      Service Completed! 🎉
                    </h3>
                    <p className="text-dark-muted">
                      How was your experience? Leave a review to help others.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    icon={Star}
                    onClick={() =>
                      navigate("/customer/review", { state: { booking } })
                    }
                  >
                    Write Review
                  </Button>
                </div>
              </div>
            )}

            {booking.status === "cancelled" && (
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                    <XCircle size={16} className="text-white" />
                  </div>
                </div>
                <div>
                  <p className="font-medium">Booking Cancelled</p>
                  <p className="text-sm text-dark-muted">
                    This booking was cancelled
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {canCancelOrReschedule() && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant="secondary"
                icon={Edit}
                onClick={handleReschedule}
              >
                Reschedule Booking
              </Button>
              <Button
                variant="danger"
                icon={XCircle}
                onClick={() => setShowCancelModal(true)}
              >
                Cancel Booking
              </Button>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="card bg-primary-500/5 border-primary-500">
          <div className="flex items-start gap-3">
            <MessageCircle
              className="text-primary-500 flex-shrink-0"
              size={24}
            />
            <div>
              <h3 className="font-bold mb-1">Need Help?</h3>
              <p className="text-sm text-dark-muted mb-3">
                If you have any questions or concerns about this booking, feel
                free to contact support.
              </p>
              <button className="text-sm text-primary-500 hover:text-primary-400 font-medium">
                Contact Support →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card rounded-xl p-6 max-w-md w-full border border-dark-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="text-red-500" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Cancel Booking?</h3>
                <p className="text-sm text-dark-muted">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="label">Reason for Cancellation *</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason..."
                rows={4}
                className="input-field resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                fullWidth
              >
                Keep Booking
              </Button>
              <Button
                variant="danger"
                loading={actionLoading}
                onClick={handleCancelBooking}
                fullWidth
              >
                Cancel Booking
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default BookingDetail;
