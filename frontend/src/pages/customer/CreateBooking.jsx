import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  Calendar,
  IndianRupee,
  FileText,
  AlertCircle,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import DateTimePicker from "../../components/common/DateTimePIcker";
import bookingsService from "../../api/bookingsService";
import toast from "react-hot-toast";

const CreateBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const provider = location.state?.provider;
  const [loading, setLoading] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  if (!provider) {
    return (
      <DashboardLayout>
        <div className="card text-center py-12">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h3 className="text-xl font-bold mb-2">Provider Not Found</h3>
          <p className="text-dark-muted mb-4">
            Please select a provider to create a booking
          </p>
          <button
            onClick={() => navigate("/customer/search")}
            className="btn-primary"
          >
            Find Providers
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const onSubmit = async (data) => {
    if (!selectedDateTime) {
      toast.error("Please select date and time");
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        provider_id: provider.provider_id,
        service_type: data.service_type,
        date_time: selectedDateTime,
        special_instructions: data.special_instructions || "",
        estimated_price: provider.pricing,
      };

      const response = await bookingsService.createBooking(bookingData);

      toast.success("Booking created successfully! 🎉");
      navigate("/customer/bookings");
    } catch (error) {
      console.error("Booking error:", error);
      const errorMsg = error.detail || "Failed to create booking";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-dark-muted hover:text-primary-500 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Header */}
        <div className="card">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Create New Booking 📅
          </h1>
          <p className="text-dark-muted">
            Fill in the details to book a service with {provider.user?.name}
          </p>
        </div>

        {/* Provider Info */}
        <div className="card bg-primary-500/5 border-primary-500">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-bold">
                {provider.user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold">{provider.user?.name}</h3>
              <p className="text-sm text-dark-muted">
                {provider.user?.location}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-green-500">
                <IndianRupee size={20} />
                <span className="text-2xl font-bold">{provider.pricing}</span>
              </div>
              <p className="text-xs text-dark-muted">Base Price</p>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
          <h2 className="text-xl font-bold">Booking Details</h2>

          {/* Service Type */}
          <div>
            <label className="label">Select Service *</label>
            <select
              {...register("service_type", {
                required: "Please select a service",
              })}
              className="input-field"
            >
              <option value="">Choose a service</option>
              {provider.services?.map((service, index) => (
                <option key={index} value={service}>
                  {service.replace(/_/g, " ").toUpperCase()}
                </option>
              ))}
            </select>
            {errors.service_type && (
              <p className="mt-1 text-sm text-red-500">
                {errors.service_type.message}
              </p>
            )}
          </div>

          {/* Date and Time */}
          <DateTimePicker
            label="Preferred Date & Time *"
            value={selectedDateTime}
            onChange={setSelectedDateTime}
            error={errors.date_time?.message}
          />

          {/* Special Instructions */}
          <div>
            <label className="label">Special Instructions (Optional)</label>
            <textarea
              {...register("special_instructions")}
              rows={4}
              placeholder="Any specific requirements or details about the job..."
              className="input-field resize-none"
            />
            <p className="mt-1 text-xs text-dark-muted">
              Provide details about the issue, location within your property, or
              any special requirements
            </p>
          </div>

          {/* Pricing Info */}
          <div className="bg-dark-bg rounded-lg p-4 border border-dark-border">
            <h3 className="font-bold mb-3">Pricing Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-muted">Base Service Fee:</span>
                <span className="font-medium">₹{provider.pricing}</span>
              </div>
              <div className="border-t border-dark-border pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Estimated Total:</span>
                  <span className="text-green-500">₹{provider.pricing}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-dark-muted mt-2">
              * Final price may vary based on actual work required
            </p>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <h4 className="font-bold text-yellow-500 mb-2 flex items-center gap-2">
              <AlertCircle size={18} />
              Important Notes
            </h4>
            <ul className="text-sm text-dark-muted space-y-1 list-disc list-inside">
              <li>Provider will confirm the booking within 24 hours</li>
              <li>
                You can cancel free of charge up to 2 hours before scheduled
                time
              </li>
              <li>Payment will be collected after service completion</li>
              <li>You'll receive notifications about booking status updates</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              icon={Calendar}
              fullWidth
            >
              Confirm Booking
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateBooking;
