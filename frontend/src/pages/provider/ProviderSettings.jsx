import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import providersService from "../../api/providersService";
import usersService from "../../api/usersService";
import toast from "react-hot-toast";

const ProviderSettings = () => {
  const [user, setUser] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [u, p] = await Promise.all([
        usersService.getMyProfile(),
        providersService.getMyProfile(),
      ]);
      setUser(u);
      setProvider(p);
    } catch {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // update user fields
      await usersService.updateMyProfile({
        name: user.name,
        phone: user.phone,
      });

      // update provider profile (allowed fields)
      const providerUpdate = {
        business_name: provider.business_name,
        about: provider.about,
      };
      await providersService.updateProfile(providerUpdate);

      toast.success("Settings saved");
      fetchData();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <DashboardLayout>
        <div className="card">Loading...</div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="card">
          <h1 className="text-2xl font-bold">Provider Settings</h1>
          <p className="text-dark-muted">
            Manage your provider account and business details
          </p>
        </div>

        <div className="card">
          <h3 className="font-bold mb-4">Account</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Full name</label>
              <input
                className="input-field"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                className="input-field"
                value={user.phone}
                onChange={(e) => setUser({ ...user, phone: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold mb-4">Business</h3>
          <div>
            <label className="label">Business name</label>
            <input
              className="input-field"
              value={provider.business_name || ""}
              onChange={(e) =>
                setProvider({ ...provider, business_name: e.target.value })
              }
            />
          </div>

          <div className="mt-4">
            <label className="label">About</label>
            <textarea
              className="input-field resize-none"
              rows={4}
              value={provider.about || ""}
              onChange={(e) =>
                setProvider({ ...provider, about: e.target.value })
              }
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProviderSettings;
