import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import CustomerSettings from "./customer/CustomerSettings";
import ProviderSettings from "./provider/ProviderSettings";
import DashboardLayout from "../components/layout/DashboardLayout";

// Lightweight hub that renders role-appropriate settings page
const SettingsHub = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  if (loading)
    return (
      <DashboardLayout>
        <div className="card">Loading...</div>
      </DashboardLayout>
    );

  if (!user) return null;

  if (user.user_type === "provider") return <ProviderSettings />;
  if (user.user_type === "customer") return <CustomerSettings />;

  // default for admin or other roles
  return (
    <DashboardLayout>
      <div className="card">
        Settings are not available for this account type.
      </div>
    </DashboardLayout>
  );
};

export default SettingsHub;
