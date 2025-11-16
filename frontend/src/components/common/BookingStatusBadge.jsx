import { Clock, CheckCircle, XCircle, Ban, Calendar } from "lucide-react";

const BookingStatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      label: "Pending",
      icon: Clock,
      className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    },
    accepted: {
      label: "Accepted",
      icon: CheckCircle,
      className: "bg-green-500/10 text-green-500 border-green-500/20",
    },
    declined: {
      label: "Declined",
      icon: XCircle,
      className: "bg-red-500/10 text-red-500 border-red-500/20",
    },
    completed: {
      label: "Completed",
      icon: CheckCircle,
      className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
    cancelled: {
      label: "Cancelled",
      icon: Ban,
      className: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.className}`}
    >
      <Icon size={16} />
      <span className="text-sm font-medium">{config.label}</span>
    </div>
  );
};

export default BookingStatusBadge;
