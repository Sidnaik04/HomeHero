import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import usersService from "../../api/usersService";
import toast from "react-hot-toast";

const CustomerSettings = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await usersService.getMyProfile();
      setProfile(data);
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // upload avatar first if present
      if (avatarFile) {
        const res = await usersService.uploadAvatar(avatarFile);
        profile.avatar_url = res.avatar_url;
      }

      const update = {
        name: profile.name,
        phone: profile.phone,
        location: profile.location,
        pincode: profile.pincode,
      };

      await usersService.updateMyProfile(update);
      toast.success("Profile updated");
      fetchProfile();
    } catch (_err) {
      console.error(_err);
      toast.error(_err.detail || "Failed to update profile");
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
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="card">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-dark-muted">Manage your account settings</p>
        </div>

        <div className="card">
          <h3 className="font-bold mb-4">Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Full name</label>
              <input
                className="input-field"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="label">Phone</label>
              <input
                className="input-field"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
              />
            </div>

            <div>
              <label className="label">Location</label>
              <input
                className="input-field"
                value={profile.location || ""}
                onChange={(e) =>
                  setProfile({ ...profile, location: e.target.value })
                }
              />
            </div>

            <div>
              <label className="label">Pincode</label>
              <input
                className="input-field"
                value={profile.pincode || ""}
                onChange={(e) =>
                  setProfile({ ...profile, pincode: e.target.value })
                }
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="label">Avatar</label>
            <div className="flex items-center gap-4">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="avatar"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                  {profile.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files[0])}
              />
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerSettings;
