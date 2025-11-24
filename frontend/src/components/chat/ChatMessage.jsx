import { User, Bot } from "lucide-react";
import { format } from "date-fns";

const ChatMessage = ({ message, sender, timestamp }) => {
  const isBot = sender === "bot";

  return (
    <div className={`flex gap-3 ${isBot ? "" : "flex-row-reverse"}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isBot ? "bg-primary-600" : "bg-green-600"
        }`}
      >
        {isBot ? (
          <Bot size={18} className="text-white" />
        ) : (
          <User size={18} className="text-white" />
        )}
      </div>

      {/* Message Bubble */}
      <div
        className={`flex flex-col max-w-[75%] ${
          isBot ? "items-start" : "items-end"
        }`}
      >
        <div
          className={`px-4 py-2 rounded-2xl ${
            isBot
              ? "bg-dark-card border border-dark-border"
              : "bg-primary-600 text-white"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message}</p>
        </div>
        {timestamp && (
          <span className="text-xs text-dark-muted mt-1">
            {format(new Date(timestamp), "hh:mm a")}
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
