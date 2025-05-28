import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  MessageCircle, 
  X, 
  Send, 
  Minimize2, 
  Maximize2,
  User,
  Headphones
} from "lucide-react";

interface ChatMessage {
  id: number;
  sessionId: string;
  senderId: number | null;
  senderName: string;
  senderType: 'user' | 'admin';
  message: string;
  isRead: number;
  createdAt: string;
}

interface ChatSession {
  id: number;
  sessionId: string;
  userId: number | null;
  userEmail: string | null;
  userName: string | null;
  status: string;
  lastMessageAt: string;
  createdAt: string;
}

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [hasStartedChat, setHasStartedChat] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

  // Initialize session ID only
  useEffect(() => {
    if (!sessionId) {
      const newSessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
    }
  }, [sessionId]);

  // Set user info if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setUserName(user.firstName || user.username || "User");
      setUserEmail(user.email || "");
    }
  }, [isAuthenticated, user]);

  // Fetch messages for current session
  const { data: messages = [], refetch: refetchMessages } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/messages", sessionId],
    enabled: !!sessionId && hasStartedChat,
    refetchInterval: 2000, // Poll every 2 seconds for new messages
  });

  // Start chat session mutation
  const startChatMutation = useMutation({
    mutationFn: async (data: { name: string; email: string }) => {
      console.log("Starting chat with data:", data);
      try {
        const response = await fetch("/api/chat/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            sessionId,
            userName: data.name,
            userEmail: data.email,
            userId: user?.id || null,
          }),
        });
        
        console.log("Chat session response:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Chat session error:", errorText);
          throw new Error(`Failed to start chat: ${response.status}`);
        }
        
        const result = await response.json();
        console.log("Chat session created:", result);
        return result;
      } catch (error) {
        console.error("Chat mutation error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      setHasStartedChat(true);
      toast({
        title: "Chat Started",
        description: "You're now connected to our support team!",
      });
    },
    onError: (error) => {
      console.error("Chat start failed:", error);
      toast({
        title: "Connection Failed",
        description: "Unable to start chat. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const response = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          sessionId,
          senderId: user?.id || null,
          senderName: userName,
          senderType: "user",
          message: messageText,
        }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onSuccess: () => {
      setMessage("");
      refetchMessages();
      scrollToBottom();
    },
    onError: () => {
      toast({
        title: "Message Failed",
        description: "Unable to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStartChat = () => {
    if (!userName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to start the chat.",
        variant: "destructive",
      });
      return;
    }
    startChatMutation.mutate({ name: userName, email: userEmail });
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (hasStartedChat) {
        handleSendMessage();
      } else {
        handleStartChat();
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <>
      {/* Chat Widget Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg animate-bounce"
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </Button>
          <div className="absolute -top-2 -right-2">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col">
          {/* Chat Header */}
          <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Headphones className="w-5 h-5" />
              <div>
                <h3 className="font-semibold">Live Support</h3>
                <p className="text-xs text-blue-100">We're here to help!</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-blue-700 p-1"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-blue-700 p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Chat Content */}
              <div className="flex-1 flex flex-col">
                {!hasStartedChat ? (
                  /* Start Chat Form */
                  <div className="p-4 space-y-4">
                    <div className="text-center">
                      <h4 className="font-semibold text-gray-900 mb-2">Start a conversation</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Get instant help from our support team
                      </p>
                    </div>
                    <div className="space-y-3">
                      <Input
                        placeholder="Your name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        onKeyPress={handleKeyPress}
                      />
                      <Input
                        placeholder="Your email (optional)"
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        onKeyPress={handleKeyPress}
                      />
                      <Button
                        onClick={handleStartChat}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={startChatMutation.isPending}
                      >
                        {startChatMutation.isPending ? "Starting..." : "Start Chat"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Messages Area */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
                      {messages.length === 0 ? (
                        <div className="text-center text-gray-500 text-sm mt-8">
                          <Headphones className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p>Chat started! Send a message below.</p>
                        </div>
                      ) : (
                        messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                                msg.senderType === 'user'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-gray-200 text-gray-900'
                              }`}
                            >
                              <div className="flex items-center space-x-1 mb-1">
                                {msg.senderType === 'admin' && (
                                  <Badge className="bg-green-100 text-green-600 text-xs">Admin</Badge>
                                )}
                                <span className="text-xs opacity-75">
                                  {new Date(msg.createdAt).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </div>
                              <p>{msg.message}</p>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-gray-200">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Type your message..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!message.trim() || sendMessageMutation.isPending}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}