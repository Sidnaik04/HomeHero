import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { User, Mail, Phone, MapPin, Edit, Save, Camera } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import usersService from "../../api/usersService";
import { GOA_LOCATIONS, VALIDATION } from "../../constants";
import toast from "react-hot-toast";

const CustomerProfile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      location: user?.location || "",
      pincode: user?.pincode || "",
    },
  });

  useEffect(() => {
    reset({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      location: user?.location || "",
      pincode: user?.pincode || "",
    });
  }, [user, reset]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fetch the latest profile from the server and update auth context
  const refreshProfile = async () => {
    try {
      const updatedUser = await usersService.getMyProfile();
      if (updatedUser) {
        updateUser(updatedUser);
      }
    } catch (err) {
      console.error("Failed to refresh profile:", err);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    setLoading(true);
    try {
      await usersService.uploadAvatar(avatarFile);
      // Refresh user profile from server
      await refreshProfile();
      toast.success("Profile picture updated!");
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error("Failed to upload profile picture");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await usersService.updateMyProfile(data);
      updateUser(response);
      toast.success("Profile updated successfully!");
      setEditing(false);
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.detail || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                My Profile 👤
              </h1>
              <p className="text-dark-muted">
                Manage your personal information
              </p>
            </div>
            {!editing && (
              <Button
                variant="primary"
                icon={Edit}
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Profile Picture */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Profile Picture</h2>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 bg-primary-600 rounded-full flex items-center justify-center">
                {avatarPreview || user?.avatar_url ? (
                  <img
                    src={avatarPreview || user.avatar_url}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white text-4xl font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors border-4 border-dark-card"
              >
                <Camera size={20} className="text-white" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-bold text-lg mb-1">{user?.name}</h3>
              <p className="text-sm text-dark-muted mb-4 capitalize">
                {user?.user_type} Account
              </p>
              {avatarFile && (
                <Button
                  variant="primary"
                  loading={loading}
                  onClick={handleAvatarUpload}
                >
                  Upload New Picture
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
          <h2 className="text-xl font-bold">Personal Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <Input
              label="Full Name"
              icon={User}
              disabled={!editing}
              {...register("name", {
                required: "Name is required",
                minLength: {
                  value: 3,
                  message: "Name must be at least 3 characters",
                },
              })}
              error={errors.name?.message}
            />

            {/* Email */}
            <Input
              label="Email"
              icon={Mail}
              type="email"
              disabled={true}
              {...register("email")}
              error={errors.email?.message}
            />

            {/* Phone */}
            <Input
              label="Phone Number"
              icon={Phone}
              disabled={!editing}
              {...register("phone", {
                required: "Phone number is required",
                pattern: {
                  value: VALIDATION.PHONE,
                  message: "Invalid phone number",
                },
              })}
              error={errors.phone?.message}
            />

            {/* Location */}
            <div>
              <label className="label">Location</label>
              <select
                {...register("location", {
                  required: "Location is required",
                })}
                disabled={!editing}
                className="input-field"
              >
                <option value="">Select location</option>
                {GOA_LOCATIONS.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
              {errors.location && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.location.message}
                </p>
              )}
            </div>

            {/* Pincode */}
            <Input
              label="Pincode"
              icon={MapPin}
              disabled={!editing}
              {...register("pincode", {
                required: "Pincode is required",
                pattern: {
                  value: /^[0-9]{6}$/,
                  message: "Invalid pincode",
                },
              })}
              error={errors.pincode?.message}
            />
          </div>

          {/* Action Buttons */}
          {editing && (
            <div className="flex gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditing(false);
                  reset();
                }}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                icon={Save}
                fullWidth
              >
                Save Changes
              </Button>
            </div>
          )}
        </form>

        {/* Account Stats */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Account Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-dark-bg rounded-lg">
              <p className="text-2xl font-bold text-primary-500">12</p>
              <p className="text-sm text-dark-muted">Total Bookings</p>
            </div>
            <div className="text-center p-4 bg-dark-bg rounded-lg">
              <p className="text-2xl font-bold text-green-500">8</p>
              <p className="text-sm text-dark-muted">Completed</p>
            </div>
            <div className="text-center p-4 bg-dark-bg rounded-lg">
              <p className="text-2xl font-bold text-yellow-500">5</p>
              <p className="text-sm text-dark-muted">Reviews Given</p>
            </div>
            <div className="text-center p-4 bg-dark-bg rounded-lg">
              <p className="text-2xl font-bold text-purple-500">5</p>
              <p className="text-sm text-dark-muted">Saved Providers</p>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Account Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-dark-border">
              <span className="text-dark-muted">Account Type:</span>
              <span className="font-medium capitalize">{user?.user_type}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-dark-border">
              <span className="text-dark-muted">Member Since:</span>
              <span className="font-medium">
                {new Date(user?.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-dark-muted">User ID:</span>
              <span className="font-medium font-mono text-xs">
                {user?.user_id?.slice(0, 8)}...
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerProfile;
