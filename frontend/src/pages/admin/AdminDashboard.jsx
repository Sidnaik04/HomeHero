import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Users, Briefcase, Calendar, TrendingUp } from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      label: "Total Users",
      value: "1,234",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Active Providers",
      value: "156",
      icon: Briefcase,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Total Bookings",
      value: "3,421",
      icon: Calendar,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Revenue",
      value: "₹2.5L",
      icon: TrendingUp,
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
                Admin Dashboard 👨‍💼
              </h1>
              <p className="text-dark-muted">
                Monitor and manage the entire HomeHero platform.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="card">
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

        {/* Quick Stats */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Platform Overview</h2>
          <p className="text-dark-muted text-center py-8">
            Detailed analytics and reports will appear here.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
