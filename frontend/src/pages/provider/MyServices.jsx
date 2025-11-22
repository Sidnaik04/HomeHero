import { useState, useEffect } from "react";
import { Briefcase, Edit, IndianRupee, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import providersService from "../../api/providersService";
import toast from "react-hot-toast";

const MyServices = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await providersService.getMyProfile();
      setProfile(data);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">My Services 🔧</h1>
              <p className="text-dark-muted">Manage your service offerings</p>
            </div>
            <button
              onClick={() => navigate("/provider/profile")}
              className="btn-primary flex items-center gap-2"
            >
              <Edit size={20} />
              Edit Services
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-center py-8">Loading...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card">
                <IndianRupee className="text-green-500 mb-2" size={24} />
                <p className="text-dark-muted text-sm">Base Pricing</p>
                <p className="text-2xl font-bold">₹{profile?.pricing || 0}</p>
              </div>
              <div className="card">
                <MapPin className="text-blue-500 mb-2" size={24} />
                <p className="text-dark-muted text-sm">Service Radius</p>
                <p className="text-2xl font-bold">
                  {profile?.service_radius || 0} km
                </p>
              </div>
              <div className="card">
                <Briefcase className="text-purple-500 mb-2" size={24} />
                <p className="text-dark-muted text-sm">Services Offered</p>
                <p className="text-2xl font-bold">
                  {profile?.services?.length || 0}
                </p>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-bold mb-4">Your Services</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {profile?.services?.map((service, index) => (
                  <div
                    key={index}
                    className="p-4 bg-primary-500/10 border border-primary-500/20 rounded-lg"
                  >
                    <p className="font-medium text-primary-500">
                      {service.replace(/_/g, " ").toUpperCase()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyServices;
