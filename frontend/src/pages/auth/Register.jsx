import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, MapPin, UserPlus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { USER_TYPES, GOA_LOCATIONS, VALIDATION } from "../../constants";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState(USER_TYPES.CUSTOMER);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();
  const password = watch("password");

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        user_type: userType,
        location: data.location,
        pincode: data.pincode,
      });

      // Redirect to login after successful registration
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-500 mb-2">HomeHero</h1>
          <p className="text-dark-muted">Join us to find or provide services</p>
        </div>

        {/* Register Card */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Create Account
          </h2>

          {/* User Type Selector */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setUserType(USER_TYPES.CUSTOMER)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                userType === USER_TYPES.CUSTOMER
                  ? "bg-primary-600 text-white"
                  : "bg-dark-bg text-dark-muted hover:bg-dark-hover"
              }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setUserType(USER_TYPES.PROVIDER)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                userType === USER_TYPES.PROVIDER
                  ? "bg-primary-600 text-white"
                  : "bg-dark-bg text-dark-muted hover:bg-dark-hover"
              }`}
            >
              Provider
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <Input
              label="Full Name"
              icon={User}
              placeholder="Enter your full name"
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
              placeholder="Enter your email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: VALIDATION.EMAIL,
                  message: "Invalid email address",
                },
              })}
              error={errors.email?.message}
            />

            {/* Phone */}
            <Input
              label="Phone Number"
              icon={Phone}
              placeholder="10-digit phone number"
              {...register("phone", {
                required: "Phone number is required",
                pattern: {
                  value: VALIDATION.PHONE,
                  message: "Invalid phone number (10 digits)",
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
                className="input-field"
              >
                <option value="">Select your location</option>
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
              placeholder="Enter pincode"
              {...register("pincode", {
                required: "Pincode is required",
                pattern: {
                  value: /^[0-9]{6}$/,
                  message: "Invalid pincode (6 digits)",
                },
              })}
              error={errors.pincode?.message}
            />

            {/* Password */}
            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="Create a strong password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: VALIDATION.PASSWORD_MIN_LENGTH,
                  message: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`,
                },
              })}
              error={errors.password?.message}
            />

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              type="password"
              icon={Lock}
              placeholder="Re-enter your password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              error={errors.confirmPassword?.message}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              fullWidth
              icon={UserPlus}
            >
              Create Account
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-dark-border"></div>
            <span className="px-4 text-sm text-dark-muted">OR</span>
            <div className="flex-1 border-t border-dark-border"></div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-dark-muted">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary-500 hover:text-primary-400 font-medium"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
