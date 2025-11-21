import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const loginResponse = await login({
        email_or_phone: data.email_or_phone,
        password: data.password,
      });

      // Now fetch user profile (to get user_type)
      const token = localStorage.getItem("access_token");
      const profileResponse = await fetch(
        // "https://homehero-synap5e.onrender.com/api/users/me",
        "http://127.0.0.1:8000/api/users/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const userProfile = await profileResponse.json();

      // Redirect based on user type
      const from =
        location.state?.from?.pathname ||
        getDefaultRoute(userProfile.user_type);

      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultRoute = (userType) => {
    switch (userType) {
      case "admin":
        return "/admin/dashboard";
      case "provider":
        return "/provider/dashboard";
      default:
        return "/customer/dashboard";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-500 mb-2">HomeHero</h1>
          <p className="text-dark-muted">Your trusted local service finder</p>
        </div>

        {/* Login Card */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6 text-center">Welcome Back</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email or Phone */}
            <Input
              label="Email or Phone"
              icon={Mail}
              placeholder="Enter your email or phone"
              {...register("email_or_phone", {
                required: "Email or phone is required",
              })}
              error={errors.email_or_phone?.message}
            />

            {/* Password */}
            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="Enter your password"
              {...register("password", {
                required: "Password is required",
              })}
              error={errors.password?.message}
            />

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-primary-500 hover:text-primary-400"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              fullWidth
              icon={LogIn}
            >
              Login
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-dark-border"></div>
            <span className="px-4 text-sm text-dark-muted">OR</span>
            <div className="flex-1 border-t border-dark-border"></div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-dark-muted">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary-500 hover:text-primary-400 font-medium"
              >
                Register Now
              </Link>
            </p>
          </div>

          {/* Test Credentials */}
          <div className="mt-6 p-4 bg-dark-bg rounded-lg border border-dark-border">
            <p className="text-xs text-dark-muted mb-2 font-medium">
              Test Credentials:
            </p>
            <p className="text-xs text-dark-muted">
              Customer: raj.sharma@gmail.com
            </p>
            <p className="text-xs text-dark-muted">
              Provider: ramesh.plumber@gmail.com
            </p>
            <p className="text-xs text-dark-muted">
              Password: CustomerPass123 / ProviderPass123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
