import {
  LayoutDashboard,
  Search,
  Calendar,
  CreditCard,
  Star,
  User,
  Briefcase,
  Users,
  Settings,
  FileText,
  TrendingUp,
} from "lucide-react";

export const getNavigationItems = (userType) => {
  switch (userType) {
    case "customer":
      return [
        {
          label: "Dashboard",
          path: "/customer/dashboard",
          icon: LayoutDashboard,
        },
        {
          label: "Find Services",
          path: "/customer/search",
          icon: Search,
        },
        {
          label: "My Bookings",
          path: "/customer/bookings",
          icon: Calendar,
        },
        {
          label: "Payments",
          path: "/customer/payments",
          icon: CreditCard,
        },
        {
          label: "My Reviews",
          path: "/customer/reviews",
          icon: Star,
        },
        {
          label: "Profile",
          path: "/customer/profile",
          icon: User,
        },
      ];

    case "provider":
      return [
        {
          label: "Dashboard",
          path: "/provider/dashboard",
          icon: LayoutDashboard,
        },
        {
          label: "My Services",
          path: "/provider/services",
          icon: Briefcase,
        },
        {
          label: "Bookings",
          path: "/provider/bookings",
          icon: Calendar,
        },
        {
          label: "Earnings",
          path: "/provider/earnings",
          icon: TrendingUp,
        },
        {
          label: "Reviews",
          path: "/provider/reviews",
          icon: Star,
        },
        {
          label: "Profile",
          path: "/provider/profile",
          icon: User,
        },
        {
          label: "Settings",
          path: "/provider/settings",
          icon: Settings,
        },
      ];

    case "admin":
      return [
        {
          label: "Dashboard",
          path: "/admin/dashboard",
          icon: LayoutDashboard,
        },
        {
          label: "Users",
          path: "/admin/users",
          icon: Users,
        },
        {
          label: "Providers",
          path: "/admin/providers",
          icon: Briefcase,
        },
        {
          label: "Bookings",
          path: "/admin/bookings",
          icon: Calendar,
        },
        {
          label: "Payments",
          path: "/admin/payments",
          icon: CreditCard,
        },
        {
          label: "Reports",
          path: "/admin/reports",
          icon: FileText,
        },
        {
          label: "Settings",
          path: "/admin/settings",
          icon: Settings,
        },
      ];

    default:
      return [];
  }
};
