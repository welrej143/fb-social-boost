import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageCircle, 
  Send, 
  User, 
  Clock,
  CheckCircle,
  AlertCircle,
  Headphones,
  ArrowLeft,
  RefreshCw
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

export default function AdminChat() {
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [adminMessage, setAdminMessage] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch all chat sessions
  const { data: chatSessions = [], refetch: refetchSessions } = useQuery<ChatSession[]>({
    queryKey: ["/api/admin/chat/sessions"],
    refetchInterval: autoRefresh ? 5000 : false, // Refresh every 5 seconds
  });

  // Fetch messages for selected session
  const { data: messages = [], refetch: refetchMessages } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/messages", selectedSession?.sessionId],
    enabled: !!selectedSession,
    refetchInterval: autoRefresh ? 2000 : false, // Refresh every 2 seconds
  });

  // Send admin message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      if (!selectedSession) throw new Error("No session selected");
      
      const response = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          sessionId: selectedSession.sessionId,
          senderId: null,
          senderName: "Support Team",
          senderType: "admin",
          message: messageText,
        }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onSuccess: () => {
      setAdminMessage("");
      refetchMessages();
      refetchSessions();
      scrollToBottom();
      toast({
        title: "Message Sent",
        description: "Your reply has been sent to the customer.",
      });
    },
    onError: () => {
      toast({
        title: "Send Failed",
        description: "Unable to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!adminMessage.trim()) return;
    sendMessageMutation.mutate(adminMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get unread message count for each session
  const getUnreadCount = (session: ChatSession) => {
    if (!selectedSession || selectedSession.sessionId !== session.sessionId) {
      return 0; // We'd need to implement this properly with a separate query
    }
    return 0;
  };

  // Sort sessions by last message time
  const sortedSessions = [...chatSessions].sort((a, b) => 
    new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/admin'}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Admin</span>
              </Button>
              <div className="flex items-center space-x-2">
                <Headphones className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Live Chat Support</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="flex items-center space-x-1">
                <MessageCircle className="w-3 h-3" />
                <span>{chatSessions.length} Active Chats</span>
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  refetchSessions();
                  if (selectedSession) refetchMessages();
                }}
                className="flex items-center space-x-1"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </Button>
              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="flex items-center space-x-1"
              >
                <Clock className="w-4 h-4" />
                <span>{autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          {/* Chat Sessions List */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>Chat Sessions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {sortedSessions.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>No chat sessions yet</p>
                      <p className="text-sm">Customers will appear here when they start chatting</p>
                    </div>
                  ) : (
                    sortedSessions.map((session) => (
                      <div
                        key={session.sessionId}
                        onClick={() => setSelectedSession(session)}
                        className={`p-3 cursor-pointer border-b hover:bg-gray-50 transition-colors ${
                          selectedSession?.sessionId === session.sessionId ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-sm">
                              {session.userName || 'Anonymous User'}
                            </span>
                          </div>
                          <Badge 
                            variant={session.status === 'Active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {session.status}
                          </Badge>
                        </div>
                        {session.userEmail && (
                          <p className="text-xs text-gray-500 mb-1">{session.userEmail}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          Started: {new Date(session.createdAt).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Last message: {new Date(session.lastMessageAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Messages */}
          <div className="lg:col-span-2">
            {selectedSession ? (
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>{selectedSession.userName || 'Anonymous User'}</span>
                    </div>
                    <Badge variant={selectedSession.status === 'Active' ? 'default' : 'secondary'}>
                      {selectedSession.status}
                    </Badge>
                  </CardTitle>
                  {selectedSession.userEmail && (
                    <p className="text-sm text-gray-600">{selectedSession.userEmail}</p>
                  )}
                </CardHeader>
                
                {/* Messages Area */}
                <CardContent className="flex-1 flex flex-col p-0">
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 mt-8">
                        <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p>No messages in this conversation yet</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                              message.senderType === 'admin'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-gray-200 text-gray-900'
                            }`}
                          >
                            <div className="flex items-center space-x-1 mb-1">
                              {message.senderType === 'admin' && (
                                <Badge className="bg-green-100 text-green-600 text-xs">Admin</Badge>
                              )}
                              <span className="text-xs opacity-75">
                                {new Date(message.createdAt).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                            <p>{message.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Admin Reply Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Type your reply..."
                        value={adminMessage}
                        onChange={(e) => setAdminMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!adminMessage.trim() || sendMessageMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Press Enter to send • Replies appear instantly to customers
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">Select a Chat Session</h3>
                  <p>Choose a customer chat from the left to start replying</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}