import { useState, useRef, useEffect } from "react";
import { Send, Loader2, X, Minimize2, Maximize2 } from "lucide-react";
import ChatMessage from "./ChatMessage";
import ProviderSuggestion from "./ProviderSuggestion";
import chatService from "../../api/chatService";
import toast from "react-hot-toast";

const ChatWidget = ({ isOpen, onClose, isMinimized, onToggleMinimize }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [suggestedProviders, setSuggestedProviders] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Send welcome message
      setMessages([
        {
          message:
            "Hi! I'm HomeHero AI Assistant. 👋\n\nI can help you find service providers. Try asking:\n• 'I need a plumber in Panaji'\n• 'Find electrician under ₹500'\n• 'Urgent carpenter needed'",
          sender: "bot",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, suggestedProviders]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");

    // Add user message immediately
    const newUserMessage = {
      message: userMessage,
      sender: "user",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    setLoading(true);
    setSuggestedProviders([]);

    try {
      const response = await chatService.sendMessage(userMessage, sessionId);

      // Update session ID
      if (!sessionId) {
        setSessionId(response.session_id);
      }

      // Add bot message
      const botMessage = {
        message: response.message,
        sender: "bot",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMessage]);

      // Set suggested providers if any
      if (
        response.suggested_providers &&
        response.suggested_providers.length > 0
      ) {
        setSuggestedProviders(response.suggested_providers);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to send message");

      // Add error message
      const errorMessage = {
        message:
          "I'm having trouble processing that. Please try again or rephrase your request.",
        sender: "bot",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 ${
        isMinimized ? "w-80" : "w-96"
      } max-w-[calc(100vw-2rem)] transition-all`}
    >
      <div className="bg-dark-card border border-dark-border rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-primary-600 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">
                HomeHero Assistant
              </h3>
              <p className="text-white/80 text-xs">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleMinimize}
              className="text-white/80 hover:text-white transition-colors"
            >
              {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
            </button>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        {!isMinimized && (
          <>
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-dark-bg"
              style={{ maxHeight: "400px" }}
            >
              {messages.map((msg, index) => (
                <ChatMessage
                  key={index}
                  message={msg.message}
                  sender={msg.sender}
                  timestamp={msg.timestamp}
                />
              ))}

              {/* Show suggested providers */}
              {suggestedProviders.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-dark-muted font-medium">
                    Suggested Providers:
                  </p>
                  {suggestedProviders.map((provider, index) => (
                    <ProviderSuggestion key={index} provider={provider} />
                  ))}
                </div>
              )}

              {/* Loading indicator */}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                    <Loader2 size={18} className="text-white animate-spin" />
                  </div>
                  <div className="bg-dark-card border border-dark-border px-4 py-2 rounded-2xl">
                    <p className="text-sm text-dark-muted">Thinking...</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-dark-border bg-dark-card"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me anything..."
                  disabled={loading}
                  className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-dark-text placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim()}
                  className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatWidget;
