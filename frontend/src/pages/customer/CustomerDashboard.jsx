import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  Home,
  Search,
  Calendar,
  TrendingUp,
  Wrench,
  Zap,
  Hammer,
  Droplet,
  Paintbrush,
} from "lucide-react";

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const stats = [
    {
      label: "Total Bookings",
      value: "12",
      icon: Calendar,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Active Services",
      value: "3",
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Completed",
      value: "8",
      icon: Home,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Saved Providers",
      value: "5",
      icon: Search,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
  ];

  const popularServices = [
    {
      name: "Plumber",
      icon: Droplet,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      name: "Electrician",
      icon: Zap,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
    {
      name: "Carpenter",
      icon: Hammer,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      name: "Painter",
      icon: Paintbrush,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      name: "Cleaner",
      icon: Wrench,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
  ];

  const handleQuickSearch = (serviceName) => {
    navigate("/customer/search", {
      state: { service: serviceName.toLowerCase() },
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate("/customer/search", { state: { service: searchQuery.trim() } });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section with Search */}
        <div className="card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-dark-muted">
                Find trusted service providers near you
              </p>
            </div>
          </div>

          {/* Quick Search Bar */}
          <form onSubmit={handleSearch} className="mt-6">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted"
                size={20}
              />
              <input
                type="text"
                placeholder="Search for services (plumber, electrician, etc.)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-12 pr-4 py-4 text-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary"
              >
                Search
              </button>
            </div>
          </form>
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

        {/* Popular Services */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Popular Services</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {popularServices.map((service, index) => (
              <button
                key={index}
                onClick={() => handleQuickSearch(service.name)}
                className="flex flex-col items-center gap-3 p-4 rounded-lg border border-dark-border hover:border-primary-500 transition-all group"
              >
                <div
                  className={`p-4 rounded-full ${service.bg} group-hover:scale-110 transition-transform`}
                >
                  <service.icon className={service.color} size={28} />
                </div>
                <span className="text-sm font-medium text-dark-text group-hover:text-primary-500 transition-colors">
                  {service.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Bookings</h2>
            <button
              onClick={() => navigate("/customer/bookings")}
              className="text-sm text-primary-500 hover:text-primary-400"
            >
              View All
            </button>
          </div>
          <div className="text-center py-8 text-dark-muted">
            <Calendar className="mx-auto mb-3 text-dark-muted" size={48} />
            <p>No recent bookings</p>
            <button
              onClick={() => navigate("/customer/search")}
              className="btn-primary mt-4"
            >
              Book Your First Service
            </button>
          </div>
        </div>

        {/* Tips Section */}
        <div className="card bg-primary-500/5 border-primary-500">
          <h3 className="text-lg font-bold mb-2">💡 Pro Tip</h3>
          <p className="text-dark-muted">
            Check provider ratings and reviews before booking. Providers with
            4.5+ ratings are highly recommended by our community!
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
