import { forwardRef } from "react";

const Input = forwardRef(
  ({ label, error, icon: Icon, type = "text", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="label">{label}</label>}

        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted">
              <Icon size={20} />
            </div>
          )}

          <input
            ref={ref}
            type={type}
            className={`input-field ${Icon ? "pl-10" : ""} ${
              error ? "border-red-500 focus:ring-red-500" : ""
            }`}
            {...props}
          />
        </div>

        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
