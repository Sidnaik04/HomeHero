import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  IndianRupee,
  Clock,
  MapPin,
  Save,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import providersService from "../../api/providersService";
import { SERVICE_CATEGORIES } from "../../constants";
import toast from "react-hot-toast";

const CreateProviderProfile = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      pricing: "500",
      experience_years: "1",
      service_radius: "10",
    },
  });

  const toggleService = (service) => {
    setSelectedServices((prev) => {
      if (prev.includes(service)) {
        return prev.filter((s) => s !== service);
      } else {
        return [...prev, service];
      }
    });
  };

  const handleNext = () => {
    if (selectedServices.length === 0) {
      toast.error("Please select at least one service");
      return;
    }
    setStep(2);
  };

  const onSubmit = async (data) => {
    if (selectedServices.length === 0) {
      toast.error("Please select at least one service");
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      const profileData = {
        services: selectedServices,
        pricing: parseFloat(data.pricing),
        experience_years: parseInt(data.experience_years),
        service_radius: parseFloat(data.service_radius),
        availability: true, // Default to available
      };

      console.log("Creating provider profile with data:", profileData);

      const response = await providersService.createProfile(profileData);

      console.log("Profile created successfully:", response);

      await refreshProfile();

      toast.success("🎉 Provider profile created successfully!");
      navigate("/provider/dashboard");
    } catch (error) {
      console.error("Profile creation error:", error);
      const errorMsg =
        error.detail || error.message || "Failed to create profile";
      toast.error(errorMsg);

      // Show detailed error in console
      if (error.response) {
        console.error("Error response:", error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
              <Briefcase className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                Create Your Provider Profile
              </h1>
              <p className="text-dark-muted">
                Set up your professional profile to start receiving bookings
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mt-6">
            <div
              className={`flex items-center gap-2 ${
                step >= 1 ? "text-primary-500" : "text-dark-muted"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 1 ? "bg-primary-500 text-white" : "bg-dark-bg"
                }`}
              >
                {step > 1 ? <CheckCircle2 size={20} /> : "1"}
              </div>
              <span className="font-medium">Select Services</span>
            </div>
            <div className="flex-1 h-0.5 bg-dark-border"></div>
            <div
              className={`flex items-center gap-2 ${
                step >= 2 ? "text-primary-500" : "text-dark-muted"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 2 ? "bg-primary-500 text-white" : "bg-dark-bg"
                }`}
              >
                2
              </div>
              <span className="font-medium">Professional Details</span>
            </div>
          </div>
        </div>

        {/* Step 1: Services Selection */}
        {step === 1 && (
          <div className="card space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">
                What Services Do You Offer?
              </h2>
              <p className="text-dark-muted text-sm">
                Select all services you can provide to customers
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {SERVICE_CATEGORIES.map((service) => (
                <button
                  key={service}
                  type="button"
                  onClick={() => toggleService(service)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedServices.includes(service)
                      ? "border-primary-500 bg-primary-500/10"
                      : "border-dark-border bg-dark-bg hover:border-dark-muted"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-left">
                      {service.replace(/_/g, " ").toUpperCase()}
                    </span>
                    {selectedServices.includes(service) && (
                      <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 size={16} className="text-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {selectedServices.length > 0 && (
              <div className="bg-primary-500/5 border border-primary-500/20 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">
                  Selected Services ({selectedServices.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedServices.map((service) => (
                    <span
                      key={service}
                      className="px-3 py-1 bg-primary-500 text-white rounded-full text-sm"
                    >
                      {service.replace(/_/g, " ").toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Button
              type="button"
              variant="primary"
              onClick={handleNext}
              fullWidth
            >
              Next: Professional Details →
            </Button>
          </div>
        )}

        {/* Step 2: Professional Details */}
        {step === 2 && (
          <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Professional Details</h2>
              <p className="text-dark-muted text-sm">
                Tell customers about your expertise
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Base Pricing */}
              <Input
                label="Base Pricing (₹) *"
                icon={IndianRupee}
                type="number"
                placeholder="500"
                {...register("pricing", {
                  required: "Pricing is required",
                  min: { value: 100, message: "Minimum ₹100" },
                  max: { value: 50000, message: "Maximum ₹50,000" },
                })}
                error={errors.pricing?.message}
              />

              {/* Experience Years */}
              <Input
                label="Years of Experience *"
                icon={Clock}
                type="number"
                placeholder="1"
                {...register("experience_years", {
                  required: "Experience is required",
                  min: { value: 0, message: "Cannot be negative" },
                  max: { value: 50, message: "Maximum 50 years" },
                })}
                error={errors.experience_years?.message}
              />

              {/* Service Radius */}
              <Input
                label="Service Radius (km) *"
                icon={MapPin}
                type="number"
                placeholder="10"
                {...register("service_radius", {
                  required: "Service radius is required",
                  min: { value: 1, message: "Minimum 1 km" },
                  max: { value: 100, message: "Maximum 100 km" },
                })}
                error={errors.service_radius?.message}
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle
                  className="text-blue-500 flex-shrink-0 mt-0.5"
                  size={20}
                />
                <div className="text-sm text-dark-muted space-y-1">
                  <p>
                    <strong>Pricing:</strong> Set your base service charge.
                    Final price may vary based on work.
                  </p>
                  <p>
                    <strong>Experience:</strong> Total years you've been
                    providing this service.
                  </p>
                  <p>
                    <strong>Service Radius:</strong> Maximum distance you're
                    willing to travel for jobs.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep(1)}
                fullWidth
              >
                ← Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                icon={Save}
                fullWidth
              >
                Create Profile
              </Button>
            </div>
          </form>
        )}

        {/* Help Section */}
        <div className="card bg-yellow-500/5 border-yellow-500/20">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <AlertCircle className="text-yellow-500" size={20} />
            Important Notes
          </h3>
          <ul className="text-sm text-dark-muted space-y-1 list-disc list-inside">
            <li>
              You can update your services and pricing anytime from your profile
            </li>
            <li>Your availability will be set to "Available" by default</li>
            <li>
              Customers will be able to find and book your services once profile
              is created
            </li>
            <li>
              Make sure all information is accurate to build trust with
              customers
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateProviderProfile;
