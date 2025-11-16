import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.user_type)) {
    // User doesn't have permission - redirect to their dashboard
    const redirectPath =
      user.user_type === "admin"
        ? "/admin"
        : user.user_type === "provider"
        ? "/provider/dashboard"
        : "/customer/dashboard";

    return <Navigate to={redirectPath} replace />;
  }

  // User is authenticated and has correct role
  return children;
};

export default ProtectedRoute;
