import { useState, useEffect } from "react";
import { Briefcase, CheckCircle } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/common/Button";
import adminService from "../../api/adminService";
import toast from "react-hot-toast";

const AdminProviders = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllProviders();
      setProviders(data);
    } catch (error) {
      console.error("Failed to fetch providers:", error);
      toast.error("Failed to load providers");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (providerId) => {
    setActionLoading(providerId);
    try {
      await adminService.approveProvider(providerId);
      toast.success("Provider approved!");
      fetchProviders();
    } catch (error) {
      console.error("Approve error:", error);
      toast.error("Failed to approve provider");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="card">
          <h1 className="text-2xl font-bold mb-2">All Providers 🔧</h1>
          <p className="text-dark-muted">Manage service providers</p>
        </div>

        <div className="card">
          <p className="mb-4">
            Total Providers: <strong>{providers.length}</strong>
          </p>
          <div className="space-y-3">
            {providers.map((provider) => (
              <div
                key={provider.provider_id}
                className="bg-dark-bg rounded-lg p-4 border border-dark-border"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-bold">{provider.user?.name}</p>
                    <p className="text-sm text-dark-muted">
                      {provider.user?.email}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {provider.services?.map((service, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-primary-500/10 text-primary-500 rounded text-xs"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    {provider.is_approved ? (
                      <span className="text-green-500 text-sm">
                        ✅ Approved
                      </span>
                    ) : (
                      <Button
                        variant="success"
                        icon={CheckCircle}
                        loading={actionLoading === provider.provider_id}
                        onClick={() => handleApprove(provider.provider_id)}
                      >
                        Approve
                      </Button>
                    )}
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

export default AdminProviders;
