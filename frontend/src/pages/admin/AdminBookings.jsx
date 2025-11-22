import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import BookingStatusBadge from "../../components/common/BookingStatusBadge";
import adminService from "../../api/adminService";
import { format } from "date-fns";
import toast from "react-hot-toast";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllBookings();
      setBookings(data);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="card">
          <h1 className="text-2xl font-bold mb-2">All Bookings 📅</h1>
          <p className="text-dark-muted">Monitor all platform bookings</p>
        </div>

        <div className="card">
          <p className="mb-4">
            Total Bookings: <strong>{bookings.length}</strong>
          </p>
          <div className="space-y-3">
            {bookings.map((booking) => (
              <div
                key={booking.booking_id}
                className="bg-dark-bg rounded-lg p-4 border border-dark-border"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold">
                      {booking.customer?.name} → {booking.provider?.user?.name}
                    </p>
                    <p className="text-sm text-dark-muted">
                      {booking.service_type.replace(/_/g, " ").toUpperCase()}
                    </p>
                    <p className="text-xs text-dark-muted mt-1">
                      {format(
                        new Date(booking.date_time),
                        "MMM dd, yyyy hh:mm a"
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <BookingStatusBadge status={booking.status} />
                    <p className="text-lg font-bold text-green-500 mt-2">
                      ₹{booking.estimated_price}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminBookings;
