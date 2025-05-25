import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Mail, MessageCircle, Clock, Ticket, Calendar } from "lucide-react";

interface TicketData {
  name: string;
  email: string;
  subject: string;
  message: string;
  priority: string;
  userId: number;
}

interface Ticket {
  id: number;
  ticketId: string;
  userId: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  adminReply?: string;
  createdAt: string;
  updatedAt?: string;
}

export default function Support() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Add loading state for auth
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-48 mb-6 mx-auto"></div>
              <div className="h-4 bg-gray-300 rounded w-64 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const [formData, setFormData] = useState({
    name: '',
    email: user?.email || '',
    subject: '',
    message: '',
    priority: 'Medium'
  });

  const [showForm, setShowForm] = useState(false);

  // Fetch user's tickets
  const { data: tickets = [], isLoading: ticketsLoading, error: ticketsError } = useQuery({
    queryKey: ['/api/tickets/user', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      try {
        const response = await fetch(`/api/tickets/user/${user.id}`);
        if (!response.ok) return [];
        return await response.json();
      } catch {
        return [];
      }
    },
    enabled: !!user?.id,
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: TicketData) => {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Ticket Created",
        description: "Your support ticket has been created successfully.",
      });
      setFormData({
        name: '',
        email: user?.email || '',
        subject: '',
        message: '',
        priority: 'Medium'
      });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['/api/tickets/user', user?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create ticket",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to create a support ticket.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createTicketMutation.mutate({
      ...formData,
      userId: user.id
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-orange-100 text-orange-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Support Center</h1>
          <p className="text-gray-600">Get help with your Facebook growth services</p>
        </div>

        {user ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Create Ticket Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
                    Create Support Ticket
                  </CardTitle>
                  <CardDescription>
                    Get personalized help from our support team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!showForm ? (
                    <Button onClick={() => setShowForm(true)} className="w-full">
                      Create New Ticket
                    </Button>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="subject">Subject *</Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder="Brief description of your issue"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                          placeholder="Please describe your issue in detail..."
                          rows={4}
                          required
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          type="submit" 
                          disabled={createTicketMutation.isPending}
                          className="flex-1"
                        >
                          {createTicketMutation.isPending ? 'Creating...' : 'Submit Ticket'}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* FAQ Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">How long do orders take to complete?</h3>
                    <p className="text-gray-600">
                      Most orders are processed within 1-24 hours. Larger orders may take up to 72 hours for completion.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                    <p className="text-gray-600">
                      We accept PayPal payments and wallet balance payments for your convenience.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Are your services safe for my Facebook account?</h3>
                    <p className="text-gray-600">
                      Yes, all our services are delivered through safe and organic methods that comply with Facebook's terms of service.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Can I get a refund if I'm not satisfied?</h3>
                    <p className="text-gray-600">
                      We offer refunds in accordance with our refund policy. Please contact support for assistance.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* My Tickets Section */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Ticket className="w-5 h-5 mr-2 text-green-600" />
                    My Support Tickets
                  </CardTitle>
                  <CardDescription>
                    View and track your support requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {ticketsLoading ? (
                    <p className="text-gray-600">Loading tickets...</p>
                  ) : tickets.length === 0 ? (
                    <p className="text-gray-600">No support tickets found.</p>
                  ) : (
                    <div className="space-y-4">
                      {tickets.map((ticket: Ticket) => (
                        <div key={ticket.id} className="border rounded-lg p-4 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold">{ticket.subject}</h3>
                              <p className="text-sm text-gray-600">#{ticket.ticketId}</p>
                            </div>
                            <div className="flex gap-2">
                              <Badge className={getPriorityColor(ticket.priority)}>
                                {ticket.priority}
                              </Badge>
                              <Badge className={getStatusColor(ticket.status)}>
                                {ticket.status}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center gap-1 mb-1">
                              <Calendar className="w-4 h-4" />
                              Created: {new Date(ticket.createdAt).toLocaleDateString()}
                            </div>
                            <p className="line-clamp-2">{ticket.message}</p>
                          </div>
                          
                          {ticket.adminReply && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-2">
                              <p className="text-sm font-medium text-blue-800 mb-1">Admin Reply:</p>
                              <p className="text-sm text-blue-700">{ticket.adminReply}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-orange-600" />
                    Support Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div>
                      <p className="font-medium">Monday - Friday</p>
                      <p className="text-gray-600">9:00 AM - 6:00 PM EST</p>
                    </div>
                    <div>
                      <p className="font-medium">Saturday - Sunday</p>
                      <p className="text-gray-600">10:00 AM - 4:00 PM EST</p>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">support@fbsocialboost.com</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Login Required</CardTitle>
              <CardDescription>
                Please log in to create support tickets and view your ticket history.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.href = '/login'} className="w-full">
                Go to Login
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}