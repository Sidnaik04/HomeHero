import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Calendar, AlertCircle } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import DateTimePicker from "../../components/common/DateTimePIcker";
import Button from "../../components/common/Button";
import bookingsService from "../../api/bookingsService";
import { format } from "date-fns";
import toast from "react-hot-toast";

const RescheduleBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state?.booking;

  const [newDateTime, setNewDateTime] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleReschedule = async (e) => {
    e.preventDefault();

    if (!newDateTime) {
      toast.error("Please select new date and time");
      return;
    }

    if (!reason.trim()) {
      toast.error("Please provide a reason for rescheduling");
      return;
    }

    setLoading(true);
    try {
      await bookingsService.rescheduleBooking(
        booking.booking_id,
        newDateTime,
        reason
      );
      toast.success("Booking rescheduled successfully! 📅");
      navigate(`/customer/bookings/${booking.booking_id}`);
    } catch (error) {
      console.error("Reschedule error:", error);
      toast.error(error.detail || "Failed to reschedule booking");
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
            Reschedule Booking 📅
          </h1>
          <p className="text-dark-muted">
            Change the date and time for your service
          </p>
        </div>

        {/* Current Booking Info */}
        <div className="card bg-primary-500/5 border-primary-500">
          <h3 className="font-bold mb-3">Current Booking Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-dark-muted">Provider:</span>
              <span className="font-medium">
                {booking.provider?.user?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-muted">Service:</span>
              <span className="font-medium">
                {booking.service_type.replace(/_/g, " ").toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-muted">Current Date:</span>
              <span className="font-medium">
                {format(new Date(booking.date_time), "MMM dd, yyyy hh:mm a")}
              </span>
            </div>
          </div>
        </div>

        {/* Reschedule Form */}
        <form onSubmit={handleReschedule} className="card space-y-6">
          <h2 className="text-xl font-bold">New Schedule</h2>

          {/* New Date Time */}
          <DateTimePicker
            label="Select New Date & Time *"
            value={newDateTime}
            onChange={setNewDateTime}
          />

          {/* Reason */}
          <div>
            <label className="label">Reason for Rescheduling *</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain why you need to reschedule..."
              rows={4}
              className="input-field resize-none"
              required
            />
            <p className="mt-1 text-xs text-dark-muted">
              Provider will be notified about the change
            </p>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <h4 className="font-bold text-yellow-500 mb-2 flex items-center gap-2">
              <AlertCircle size={18} />
              Important Notice
            </h4>
            <ul className="text-sm text-dark-muted space-y-1 list-disc list-inside">
              <li>The provider needs to approve the new schedule</li>
              <li>You can reschedule up to 2 hours before the appointment</li>
              <li>Multiple reschedules may affect your booking priority</li>
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
              icon={Calendar}
              fullWidth
            >
              Reschedule Booking
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default RescheduleBooking;
