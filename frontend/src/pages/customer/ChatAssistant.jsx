import { useState, useEffect, useRef } from "react";
import { Send, Loader2, Bot, Sparkles } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ChatMessage from "../../components/chat/ChatMessage";
import ProviderSuggestion from "../../components/chat/ProviderSuggestion";
import chatService from "../../api/chatService";
import toast from "react-hot-toast";

const ChatAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [suggestedProviders, setSuggestedProviders] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Send welcome message
    setMessages([
      {
        message:
          "Hi! I'm your HomeHero AI Assistant. 🤖✨\n\nI'm here to help you find the perfect service provider in Goa!\n\nYou can ask me things like:\n• 'I need a plumber in Panaji'\n• 'Find an electrician under ₹500'\n• 'Urgent carpenter needed in Margao'\n• 'Show me top-rated cleaners'\n\nWhat service do you need today?",
        sender: "bot",
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

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

      // Set suggested providers
      if (
        response.suggested_providers &&
        response.suggested_providers.length > 0
      ) {
        setSuggestedProviders(response.suggested_providers);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to send message");

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

  const quickPrompts = [
    "I need a plumber",
    "Find electrician in Panaji",
    "Urgent carpenter needed",
    "Show cleaners under ₹500",
  ];

  const handleQuickPrompt = (prompt) => {
    setInputMessage(prompt);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-purple-600 rounded-full flex items-center justify-center">
              <Bot size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
                AI Chat Assistant
                <Sparkles size={20} className="text-yellow-500" />
              </h1>
              <p className="text-dark-muted">
                Find service providers using natural language
              </p>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="card p-0 overflow-hidden">
          {/* Messages Area */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-dark-bg">
            {messages.map((msg, index) => (
              <ChatMessage
                key={index}
                message={msg.message}
                sender={msg.sender}
                timestamp={msg.timestamp}
              />
            ))}

            {/* Suggested Providers */}
            {suggestedProviders.length > 0 && (
              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                    <Bot size={18} className="text-white" />
                  </div>
                  <p className="text-sm font-medium text-dark-text">
                    Here are the providers I found for you:
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-10">
                  {suggestedProviders.map((provider, index) => (
                    <ProviderSuggestion key={index} provider={provider} />
                  ))}
                </div>
              </div>
            )}

            {/* Loading */}
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

          {/* Quick Prompts */}
          {messages.length === 1 && (
            <div className="px-6 py-3 border-t border-dark-border bg-dark-card">
              <p className="text-xs text-dark-muted mb-2">Quick prompts:</p>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="px-3 py-1.5 bg-primary-500/10 hover:bg-primary-500/20 text-primary-500 rounded-full text-xs font-medium transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <form
            onSubmit={handleSendMessage}
            className="p-6 border-t border-dark-border bg-dark-card"
          >
            <div className="flex gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message... (e.g., 'I need a plumber in Panaji')"
                disabled={loading}
                className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-dark-text placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="card bg-blue-500/5 border-blue-500/20">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <Sparkles className="text-blue-500" size={18} />
            Tips for better results
          </h3>
          <ul className="text-sm text-dark-muted space-y-1 list-disc list-inside">
            <li>
              Be specific about the service you need (e.g., "plumber" instead of
              "fix water")
            </li>
            <li>
              Mention your location in Goa (Panaji, Margao, Calangute, etc.)
            </li>
            <li>Include your budget if you have one (e.g., "under ₹500")</li>
            <li>Mention urgency if needed (e.g., "urgent" or "today")</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChatAssistant;
