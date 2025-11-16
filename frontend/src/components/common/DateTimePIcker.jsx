import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

const DateTimePicker = ({ value, onChange, label, error, minDate }) => {
  // Get min date (default to today)
  const getMinDate = () => {
    const date = minDate || new Date();
    return format(date, "yyyy-MM-dd");
  };

  // Get min time if selected date is today
  const getMinTime = () => {
    if (!value) return "00:00";

    const selectedDate = new Date(value);
    const today = new Date();

    // If selected date is today, min time is current time + 2 hours
    if (selectedDate.toDateString() === today.toDateString()) {
      const minTime = new Date(today.getTime() + 2 * 60 * 60 * 1000);
      return format(minTime, "HH:mm");
    }

    return "00:00";
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    if (value) {
      // Keep existing time if already set
      const existingTime = value.split("T")[1] || "10:00:00";
      onChange(`${date}T${existingTime}`);
    } else {
      onChange(`${date}T10:00:00`);
    }
  };

  const handleTimeChange = (e) => {
    const time = e.target.value;
    if (value) {
      const existingDate = value.split("T")[0];
      onChange(`${existingDate}T${time}:00`);
    }
  };

  const dateValue = value ? value.split("T")[0] : "";
  const timeValue = value ? value.split("T")[1]?.substring(0, 5) : "";

  return (
    <div className="space-y-2">
      {label && <label className="label">{label}</label>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date Input */}
        <div className="relative">
          <Calendar
            className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted"
            size={18}
          />
          <input
            type="date"
            value={dateValue}
            onChange={handleDateChange}
            min={getMinDate()}
            className={`input-field pl-10 ${error ? "border-red-500" : ""}`}
            required
          />
        </div>

        {/* Time Input */}
        <div className="relative">
          <Clock
            className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted"
            size={18}
          />
          <input
            type="time"
            value={timeValue}
            onChange={handleTimeChange}
            min={getMinTime()}
            className={`input-field pl-10 ${error ? "border-red-500" : ""}`}
            required
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <p className="text-xs text-dark-muted">
        Please select a date and time at least 2 hours from now
      </p>
    </div>
  );
};

export default DateTimePicker;
