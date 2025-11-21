import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Customer Pages
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import SearchProviders from "./pages/customer/SearchProviders";
import ProviderDetail from "./pages/customer/ProviderDetail";
import CreateBooking from "./pages/customer/CreateBooking";
import MyBookings from "./pages/customer/MyBookings";
import BookingDetail from "./pages/customer/BookingDetail";
import RescheduleBooking from "./pages/customer/RescheduleBooking";
import SubmitReview from "./pages/customer/SubmitReview";
import MyReviews from "./pages/customer/MyReviews";
import CustomerProfile from "./pages/customer/CustomerProfile";

// Provider Pages
import ProviderDashboard from "./pages/provider/ProviderDashboard";
import ProviderBookings from "./pages/provider/ProviderBookings";
import ProviderProfile from "./pages/provider/ProviderProfile";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";

// Debug
import ProviderDebug from "./pages/debug/ProviderDebug";

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-dark-bg">
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#141829",
              color: "#e2e8f0",
              border: "1px solid #1e2438",
            },
            success: {
              iconTheme: {
                primary: "#0066ff",
                secondary: "#e2e8f0",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#e2e8f0",
              },
            },
          }}
        />

        {/* Routes */}
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Customer Routes */}
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/search"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <SearchProviders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/provider/:id"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <ProviderDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/book"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <CreateBooking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/bookings"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/bookings/:id"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <BookingDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/bookings/:id/reschedule"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <RescheduleBooking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/review"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <SubmitReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/reviews"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <MyReviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/profile"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <CustomerProfile />
              </ProtectedRoute>
            }
          />

          {/* Protected Provider Routes */}
          <Route
            path="/provider/dashboard"
            element={
              <ProtectedRoute allowedRoles={["provider"]}>
                <ProviderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/bookings"
            element={
              <ProtectedRoute allowedRoles={["provider"]}>
                <ProviderBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/profile"
            element={
              <ProtectedRoute allowedRoles={["provider"]}>
                <ProviderProfile />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Debug (development only) */}
          <Route path="/debug/providers" element={<ProviderDebug />} />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 404 - Not Found */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
