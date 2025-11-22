import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Bell,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleProfileClick = () => {
    setShowProfileMenu(false);
    const route =
      user?.user_type === "admin"
        ? "/admin/profile"
        : user?.user_type === "provider"
        ? "/provider/profile"
        : "/customer/profile";
    navigate(route);
  };

  return (
    <header className="bg-dark-card border-b border-dark-border sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        {/* Left: Menu + Logo */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden text-dark-text hover:text-primary-500 transition-colors"
          >
            <Menu size={24} />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-xl font-bold text-dark-text hidden sm:block">
              HomeHero
            </span>
          </Link>
        </div>

        {/* Right: Notifications + Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative p-2 text-dark-muted hover:text-primary-500 transition-colors">
            <Bell size={20} />
            {/* Notification badge */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-dark-hover transition-colors"
            >
              {/* Avatar */}
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center overflow-hidden">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={`${user?.name || "User"} avatar`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* User info - hidden on mobile */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-dark-text">
                  {user?.name}
                </p>
                <p className="text-xs text-dark-muted capitalize">
                  {user?.user_type}
                </p>
              </div>

              <ChevronDown
                size={16}
                className={`text-dark-muted transition-transform ${
                  showProfileMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-dark-card border border-dark-border rounded-lg shadow-xl py-2">
                {/* User info in dropdown - mobile only */}
                <div className="md:hidden px-4 py-2 border-b border-dark-border">
                  <p className="text-sm font-medium text-dark-text">
                    {user?.name}
                  </p>
                  <p className="text-xs text-dark-muted">{user?.email}</p>
                </div>

                {/* Profile */}
                <button
                  onClick={handleProfileClick}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-dark-text hover:bg-dark-hover transition-colors"
                >
                  <User size={16} />
                  My Profile
                </button>

                {/* Settings */}
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/settings");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-dark-text hover:bg-dark-hover transition-colors"
                >
                  <Settings size={16} />
                  Settings
                </button>

                <div className="border-t border-dark-border my-2"></div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-dark-hover transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
