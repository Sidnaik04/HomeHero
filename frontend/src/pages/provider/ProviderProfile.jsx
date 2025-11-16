import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  Camera,
  Briefcase,
  IndianRupee,
  Clock,
  Star,
  X,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import usersService from "../../api/usersService";
import providersService from "../../api/providersService";
import { GOA_LOCATIONS, SERVICE_CATEGORIES } from "../../constants";
import toast from "react-hot-toast";

const ProviderProfile = () => {
  const { user, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [providerProfile, setProviderProfile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    fetchProviderProfile();
  }, []);

  useEffect(() => {
    if (user && providerProfile) {
      reset({
        name: user.name || "",
        phone: user.phone || "",
        location: user.location || "",
        pincode: user.pincode || "",
        pricing: providerProfile.pricing || "",
        experience_years: providerProfile.experience_years || "",
        service_radius: providerProfile.service_radius || "",
      });
      setSelectedServices(providerProfile.services || []);
    }
  }, [user, providerProfile, reset]);

  const fetchProviderProfile = async () => {
    try {
      const profile = await providersService.getMyProfile();
      setProviderProfile(profile);
    } catch (error) {
      console.error("Failed to fetch provider profile:", error);
      // If provider profile doesn't exist, user needs to create one
      if (error.status === 404) {
        toast.error("Please complete your provider profile");
      }
    }
  };

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

  const toggleService = (service) => {
    setSelectedServices((prev) => {
      if (prev.includes(service)) {
        return prev.filter((s) => s !== service);
      } else {
        return [...prev, service];
      }
    });
  };

  const onSubmit = async (data) => {
    if (selectedServices.length === 0) {
      toast.error("Please select at least one service");
      return;
    }

    setLoading(true);
    try {
      // Update user profile
      await usersService.updateMyProfile({
        name: data.name,
        phone: data.phone,
        location: data.location,
        pincode: data.pincode,
      });

      // Prepare provider profile data
      const providerData = {
        services: selectedServices,
        pricing: parseFloat(data.pricing),
        experience_years: parseInt(data.experience_years),
        service_radius: parseFloat(data.service_radius),
        availability:
          providerProfile?.availability !== undefined
            ? providerProfile.availability
            : true,
      };

      // Update or create provider profile
      if (providerProfile) {
        await providersService.updateProfile(providerData);
      } else {
        await providersService.createProfile(providerData);
      }

      await refreshProfile();
      toast.success("Profile updated successfully!");
      setEditing(false);
      fetchProviderProfile();
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.detail || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      await providersService.updateAvailability(!providerProfile.availability);
      setProviderProfile({
        ...providerProfile,
        availability: !providerProfile.availability,
      });
      toast.success(
        providerProfile.availability
          ? "You are now unavailable"
          : "You are now available for bookings!"
      );
    } catch (error) {
      console.error("Availability toggle error:", error);
      toast.error("Failed to update availability");
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
                Manage your professional profile
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

        {/* Profile Picture & Availability */}
        <div className="card">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
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
              <div>
                <h3 className="font-bold text-lg mb-1">{user?.name}</h3>
                <p className="text-sm text-dark-muted mb-2">Service Provider</p>
                {avatarFile && (
                  <Button
                    variant="primary"
                    loading={loading}
                    onClick={handleAvatarUpload}
                  >
                    Upload Picture
                  </Button>
                )}
              </div>
            </div>

            {/* Availability Toggle */}
            {providerProfile && (
              <div className="text-center">
                <p className="text-sm text-dark-muted mb-2">
                  Availability Status
                </p>
                <button
                  onClick={toggleAvailability}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    providerProfile.availability
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-red-500 text-white hover:bg-red-600"
                  }`}
                >
                  {providerProfile.availability
                    ? "✓ Available"
                    : "✗ Unavailable"}
                </button>
                <p className="text-xs text-dark-muted mt-2">
                  {providerProfile.availability
                    ? "Customers can book your services"
                    : "Not accepting new bookings"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Profile Stats */}
        {providerProfile && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card text-center">
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Briefcase className="text-blue-500" size={24} />
              </div>
              <p className="text-2xl font-bold">
                {providerProfile.total_bookings || 0}
              </p>
              <p className="text-sm text-dark-muted">Total Jobs</p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="text-yellow-500" size={24} />
              </div>
              <p className="text-2xl font-bold">
                {providerProfile.rating?.toFixed(1) || "0.0"}
              </p>
              <p className="text-sm text-dark-muted">Rating</p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <IndianRupee className="text-green-500" size={24} />
              </div>
              <p className="text-2xl font-bold">₹{providerProfile.pricing}</p>
              <p className="text-sm text-dark-muted">Base Price</p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="text-purple-500" size={24} />
              </div>
              <p className="text-2xl font-bold">
                {providerProfile.experience_years}+
              </p>
              <p className="text-sm text-dark-muted">Years Exp.</p>
            </div>
          </div>
        )}

        {/* Profile Information Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
          <h2 className="text-xl font-bold">Professional Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <Input
              label="Full Name"
              icon={User}
              disabled={!editing}
              {...register("name", {
                required: "Name is required",
              })}
              error={errors.name?.message}
            />

            {/* Email (Read-only) */}
            <Input
              label="Email"
              icon={Mail}
              type="email"
              disabled={true}
              value={user?.email || ""}
              readOnly
            />

            {/* Phone */}
            <Input
              label="Phone Number"
              icon={Phone}
              disabled={!editing}
              {...register("phone", {
                required: "Phone number is required",
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
              })}
              error={errors.pincode?.message}
            />

            {/* Base Pricing */}
            <Input
              label="Base Pricing (₹)"
              icon={IndianRupee}
              type="number"
              disabled={!editing}
              {...register("pricing", {
                required: "Pricing is required",
                min: { value: 100, message: "Minimum ₹100" },
              })}
              error={errors.pricing?.message}
            />

            {/* Experience Years */}
            <Input
              label="Years of Experience"
              icon={Clock}
              type="number"
              disabled={!editing}
              {...register("experience_years", {
                required: "Experience is required",
                min: { value: 0, message: "Cannot be negative" },
              })}
              error={errors.experience_years?.message}
            />

            {/* Service Radius */}
            <Input
              label="Service Radius (km)"
              icon={MapPin}
              type="number"
              disabled={!editing}
              {...register("service_radius", {
                required: "Service radius is required",
                min: { value: 1, message: "Minimum 1 km" },
              })}
              error={errors.service_radius?.message}
            />
          </div>

          {/* Services Selection */}
          <div>
            <label className="label">Services You Offer *</label>
            <p className="text-xs text-dark-muted mb-3">
              Select all services you can provide to customers
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {SERVICE_CATEGORIES.map((service) => (
                <button
                  key={service}
                  type="button"
                  disabled={!editing}
                  onClick={() => toggleService(service)}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    selectedServices.includes(service)
                      ? "border-primary-500 bg-primary-500/10 text-primary-500"
                      : "border-dark-border bg-dark-bg text-dark-muted hover:border-dark-muted"
                  } ${
                    !editing
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate">
                      {service.replace(/_/g, " ").toUpperCase()}
                    </span>
                    {selectedServices.includes(service) && (
                      <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            {editing && selectedServices.length === 0 && (
              <p className="mt-2 text-sm text-red-500">
                Please select at least one service
              </p>
            )}
          </div>

          {/* Selected Services Display */}
          {selectedServices.length > 0 && (
            <div className="bg-primary-500/5 border border-primary-500/20 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">
                Selected Services ({selectedServices.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedServices.map((service) => (
                  <span
                    key={service}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-primary-500/10 text-primary-500 rounded-full text-xs font-medium"
                  >
                    {service.replace(/_/g, " ").toUpperCase()}
                    {editing && (
                      <button
                        type="button"
                        onClick={() => toggleService(service)}
                        className="hover:bg-primary-500/20 rounded-full p-0.5"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {editing && (
            <div className="flex gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditing(false);
                  reset();
                  setSelectedServices(providerProfile?.services || []);
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
              <span className="text-dark-muted">Provider ID:</span>
              <span className="font-medium font-mono text-xs">
                {providerProfile?.provider_id?.slice(0, 8) || "Not created yet"}
                ...
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProviderProfile;
