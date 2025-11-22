import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  Briefcase,
  Calendar,
  TrendingUp,
  Star,
  CheckCircle,
  XCircle,
} from "lucide-react";
import BookingStatusBadge from "../../components/common/BookingStatusBadge";
import Button from "../../components/common/Button";
import bookingsService from "../../api/bookingsService";
import providersService from "../../api/providersService";
import { format } from "date-fns";
import toast from "react-hot-toast";

const ProviderDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [providerProfile, setProviderProfile] = useState(null);

  useEffect(() => {
    fetchPendingBookings();
    checkProviderProfile();
    fetchAllBookings();
  }, []);

  const fetchPendingBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingsService.getPendingBookings();
      setPendingBookings(data || []);
    } catch (error) {
      console.error("Failed to fetch pending bookings:", error);
      setPendingBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const checkProviderProfile = async () => {
    try {
      const profile = await providersService.getMyProfile();
      setProviderProfile(profile);
    } catch (error) {
      console.error("Failed to fetch provider profile:", error);
      setProviderProfile(null);
    }
  };

  const fetchAllBookings = async () => {
    try {
      const data = await bookingsService.getMyBookings();
      setAllBookings(data);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      // finished fetching bookings
    }
  };

  const completedBookings = allBookings.filter((b) => b.status === "completed");
  // totalEarnings is available via monthly and completed filters if needed
  const thisMonth = completedBookings.filter((b) => {
    const bookingDate = new Date(b.date_time);
    const now = new Date();
    return bookingDate.getMonth() === now.getMonth();
  });
  const monthlyEarnings = thisMonth.reduce(
    (sum, b) => sum + (b.estimated_price || 0),
    0
  );

  const handleAccept = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      await bookingsService.respondToBooking(bookingId, "accepted");
      toast.success("Booking accepted! 🎉");
      fetchPendingBookings(); // Refresh list
    } catch (error) {
      console.error("Accept error:", error);
      toast.error("Failed to accept booking");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      await bookingsService.respondToBooking(bookingId, "declined");
      toast.success("Booking declined");
      fetchPendingBookings(); // Refresh list
    } catch (error) {
      console.error("Decline error:", error);
      toast.error("Failed to decline booking");
    } finally {
      setActionLoading(null);
    }
  };

  const stats = [
    {
      label: "Total Bookings",
      value: allBookings.length.toString(),
      icon: Calendar,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "This Month",
      value: `₹${monthlyEarnings}`,
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Completed Jobs",
      value: completedBookings.length.toString(),
      icon: Briefcase,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Rating",
      value: providerProfile?.rating?.toFixed(1) || "0.0",
      icon: Star,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-dark-muted">
                Manage your services and bookings efficiently.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="card hover:border-primary-500 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={stat.color} size={24} />
                </div>
                <div>
                  <p className="text-dark-muted text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pending Bookings */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">Pending Bookings</h2>
              <p className="text-sm text-dark-muted">
                Requests waiting for your response
              </p>
            </div>
            {pendingBookings.length > 0 && (
              <button
                onClick={() => navigate("/provider/bookings")}
                className="text-sm text-primary-500 hover:text-primary-400"
              >
                View All
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
            </div>
          ) : pendingBookings.length === 0 ? (
            <div className="text-center py-8 text-dark-muted">
              <Calendar className="mx-auto mb-3 text-dark-muted" size={48} />
              <p>No pending bookings</p>
              <p className="text-sm mt-1">New requests will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingBookings.slice(0, 3).map((booking) => (
                <div
                  key={booking.booking_id}
                  className="bg-dark-bg rounded-lg p-4 border border-dark-border"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Customer Info */}
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">
                          {booking.customer?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold mb-1">
                          {booking.customer?.name}
                        </h3>
                        <p className="text-sm text-dark-muted mb-2">
                          {booking.service_type
                            .replace(/_/g, " ")
                            .toUpperCase()}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs text-dark-muted">
                          <span>
                            📅 {format(new Date(booking.date_time), "MMM dd")}
                          </span>
                          <span>
                            🕐 {format(new Date(booking.date_time), "hh:mm a")}
                          </span>
                          <span>💰 ₹{booking.estimated_price}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/provider/bookings")}
              className="btn-primary"
            >
              <Calendar size={20} />
              View All Bookings
            </button>
            <button
              onClick={() => navigate("/provider/services")}
              className="btn-secondary"
            >
              <Briefcase size={20} />
              Manage Services
            </button>
            <button
              onClick={() => navigate("/provider/profile")}
              className="btn-secondary"
            >
              <Star size={20} />
              Update Profile
            </button>
          </div>
        </div>

        {/* Performance Tip */}
        <div className="card bg-primary-500/5 border-primary-500">
          <h3 className="text-lg font-bold mb-2">💡 Performance Tip</h3>
          <p className="text-dark-muted">
            Quick response time improves your rating! Try to accept or decline
            bookings within 24 hours to maintain a high customer satisfaction
            score.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProviderDashboard;
