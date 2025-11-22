import { useState, useEffect } from "react";
import { TrendingUp, Calendar, IndianRupee, CheckCircle } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import bookingsService from "../../api/bookingsService";
import { format } from "date-fns";
import toast from "react-hot-toast";

const Earnings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      const data = await bookingsService.getMyBookings();
      setBookings(data);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast.error("Failed to load earnings");
    } finally {
      setLoading(false);
    }
  };

  const completedBookings = bookings.filter((b) => b.status === "completed");
  const totalEarnings = completedBookings.reduce(
    (sum, b) => sum + (b.estimated_price || 0),
    0
  );
  const thisMonth = completedBookings.filter((b) => {
    const bookingDate = new Date(b.date_time);
    const now = new Date();
    return (
      bookingDate.getMonth() === now.getMonth() &&
      bookingDate.getFullYear() === now.getFullYear()
    );
  });
  const monthlyEarnings = thisMonth.reduce(
    (sum, b) => sum + (b.estimated_price || 0),
    0
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="card">
          <h1 className="text-2xl font-bold mb-2">Earnings 💰</h1>
          <p className="text-dark-muted">
            Track your income and completed services
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <IndianRupee className="text-green-500" size={24} />
              <span className="text-dark-muted">Total Earnings</span>
            </div>
            <p className="text-3xl font-bold text-green-500">
              ₹{totalEarnings}
            </p>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="text-blue-500" size={24} />
              <span className="text-dark-muted">This Month</span>
            </div>
            <p className="text-3xl font-bold text-blue-500">
              ₹{monthlyEarnings}
            </p>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="text-purple-500" size={24} />
              <span className="text-dark-muted">Completed Jobs</span>
            </div>
            <p className="text-3xl font-bold text-purple-500">
              {completedBookings.length}
            </p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Earnings History</h2>
          {loading ? (
            <p className="text-center py-8 text-dark-muted">Loading...</p>
          ) : completedBookings.length === 0 ? (
            <p className="text-center py-8 text-dark-muted">
              No completed bookings yet
            </p>
          ) : (
            <div className="space-y-3">
              {completedBookings.map((booking) => (
                <div
                  key={booking.booking_id}
                  className="bg-dark-bg rounded-lg p-4 border border-dark-border"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold">{booking.customer?.name}</p>
                      <p className="text-sm text-dark-muted">
                        {booking.service_type.replace(/_/g, " ").toUpperCase()}
                      </p>
                      <p className="text-xs text-dark-muted mt-1">
                        {format(new Date(booking.date_time), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-500">
                        ₹{booking.estimated_price}
                      </p>
                      <p className="text-xs text-dark-muted">Completed</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Earnings;
