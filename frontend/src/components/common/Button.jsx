import { Loader2 } from "lucide-react";

const Button = ({
  children,
  variant = "primary",
  loading = false,
  disabled = false,
  type = "button",
  icon: Icon,
  fullWidth = false,
  ...props
}) => {
  const baseClass =
    "font-medium py-2.5 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-primary-600 hover:bg-primary-700 text-white",
    secondary:
      "bg-dark-card hover:bg-dark-hover text-dark-text border border-dark-border",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white",
    ghost: "hover:bg-dark-hover text-dark-text",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseClass} ${variants[variant]} ${
        fullWidth ? "w-full" : ""
      }`}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={20} />
      ) : Icon ? (
        <Icon size={20} />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
