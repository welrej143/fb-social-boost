import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Users, DollarSign, ShoppingCart, TrendingUp, Edit2, Save, X, Ticket, MessageSquare, Calendar } from "lucide-react";
import type { User, Order } from "@shared/schema";

interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: string;
  totalProfit: string;
  totalCost: string;
  pendingOrders: number;
}

export default function Admin() {
  const { toast } = useToast();
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [newBalance, setNewBalance] = useState("");
  const [replyingTicket, setReplyingTicket] = useState<string | null>(null);
  const [ticketReply, setTicketReply] = useState("");
  const [ticketStatus, setTicketStatus] = useState("");

  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  // Fetch all users
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  // Fetch all orders
  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  // Fetch all tickets
  const { data: tickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ["/api/admin/tickets"],
  });

  // Update user balance mutation
  const updateBalanceMutation = useMutation({
    mutationFn: async ({ userId, balance }: { userId: number; balance: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/balance`, {
        method: "PATCH",
        body: JSON.stringify({ balance }),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error('Failed to update balance');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setEditingUser(null);
      setNewBalance("");
      toast({
        title: "Balance Updated",
        description: "User balance has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user balance.",
        variant: "destructive",
      });
    },
  });

  // Update ticket status mutation
  const updateTicketStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      const response = await fetch(`/api/admin/tickets/${ticketId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update ticket status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets"] });
      toast({ title: "Success", description: "Ticket status updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update ticket status", variant: "destructive" });
    },
  });

  // Reply to ticket mutation
  const replyToTicketMutation = useMutation({
    mutationFn: async ({ ticketId, adminReply, status }: { ticketId: string; adminReply: string; status?: string }) => {
      const response = await fetch(`/api/admin/tickets/${ticketId}/reply`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminReply, status }),
      });
      if (!response.ok) throw new Error("Failed to reply to ticket");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets"] });
      setReplyingTicket(null);
      setTicketReply("");
      setTicketStatus("");
      toast({ title: "Success", description: "Reply sent successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send reply", variant: "destructive" });
    },
  });

  const handleEditBalance = (userId: number, currentBalance: string) => {
    setEditingUser(userId);
    setNewBalance(currentBalance);
  };

  const handleSaveBalance = (userId: number) => {
    updateBalanceMutation.mutate({ userId, balance: newBalance });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setNewBalance("");
  };

  const handleReplyToTicket = (ticketId: string, currentStatus: string) => {
    setReplyingTicket(ticketId);
    setTicketStatus(currentStatus);
  };

  const handleSendReply = (ticketId: string) => {
    if (!ticketReply.trim()) {
      toast({ title: "Error", description: "Please enter a reply message", variant: "destructive" });
      return;
    }
    replyToTicketMutation.mutate({ ticketId, adminReply: ticketReply, status: ticketStatus });
  };

  const handleCancelReply = () => {
    setReplyingTicket(null);
    setTicketReply("");
    setTicketStatus("");
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

  if (statsLoading || usersLoading || ordersLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage users, orders, and support tickets
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${stats?.totalRevenue || "0.00"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${stats?.totalProfit || "0.00"}</div>
            <div className="text-xs text-gray-500">80% margin</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Users Management</CardTitle>
              <CardDescription>
                View and manage user accounts and balances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users?.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{user.username}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-sm">
                        Balance: ${user.balance}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingUser === user.id ? (
                        <>
                          <Input
                            type="number"
                            step="0.01"
                            value={newBalance}
                            onChange={(e) => setNewBalance(e.target.value)}
                            className="w-24"
                            placeholder="0.00"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSaveBalance(user.id)}
                            disabled={updateBalanceMutation.isPending}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditBalance(user.id, user.balance)}
                        >
                          <Edit2 className="h-4 w-4 mr-1" />
                          Edit Balance
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {(!users || users.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No users found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Orders Management</CardTitle>
              <CardDescription>
                View and monitor all orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders?.map((order) => (
                  <div key={order.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">Order #{order.orderId}</div>
                      <Badge 
                        className={
                          order.status === "Completed" ? "bg-green-100 text-green-800" :
                          order.status === "Processing" ? "bg-blue-100 text-blue-800" :
                          order.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                          "bg-gray-100 text-gray-800"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Service: {order.serviceName}</div>
                      <div>Quantity: {order.quantity}</div>
                      <div>Amount: ${order.amount}</div>
                      <div>Date: {new Date(order.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
                
                {(!orders || orders.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No orders found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Ticket className="w-5 h-5 mr-2" />
                Support Tickets Management
              </CardTitle>
              <CardDescription>
                View, reply to, and manage customer support tickets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ticketsLoading ? (
                <div className="text-center py-8 text-gray-500">Loading tickets...</div>
              ) : !tickets || tickets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No support tickets found</div>
              ) : (
                <div className="space-y-6">
                  {tickets.map((ticket: any) => (
                    <div key={ticket.id} className="border rounded-lg p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{ticket.subject}</h3>
                            <Badge className={getStatusColor(ticket.status)}>
                              {ticket.status}
                            </Badge>
                            <Badge className={getPriorityColor(ticket.priority)}>
                              {ticket.priority}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-4">
                              <span>#{ticket.ticketId}</span>
                              <span>From: {ticket.name} ({ticket.email})</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(ticket.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="bg-gray-50 border rounded p-3 mb-4">
                            <p className="text-sm">{ticket.message}</p>
                          </div>

                          {ticket.adminReply && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                              <p className="text-sm font-medium text-blue-800 mb-1">Your Reply:</p>
                              <p className="text-sm text-blue-700">{ticket.adminReply}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Select
                          value={ticket.status}
                          onValueChange={(value) => updateTicketStatusMutation.mutate({ ticketId: ticket.ticketId, status: value })}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Open">Open</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Resolved">Resolved</SelectItem>
                            <SelectItem value="Closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReplyToTicket(ticket.ticketId, ticket.status)}
                          disabled={replyingTicket === ticket.ticketId}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Reply
                        </Button>
                      </div>

                      {replyingTicket === ticket.ticketId && (
                        <div className="border-t pt-4 space-y-4">
                          <div>
                            <Label htmlFor="reply">Admin Reply</Label>
                            <Textarea
                              id="reply"
                              value={ticketReply}
                              onChange={(e) => setTicketReply(e.target.value)}
                              placeholder="Type your reply to the customer..."
                              rows={4}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="status">Update Status</Label>
                            <Select value={ticketStatus} onValueChange={setTicketStatus}>
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Open">Open</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Resolved">Resolved</SelectItem>
                                <SelectItem value="Closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleSendReply(ticket.ticketId)}
                              disabled={replyToTicketMutation.isPending}
                            >
                              {replyToTicketMutation.isPending ? 'Sending...' : 'Send Reply'}
                            </Button>
                            <Button variant="outline" onClick={handleCancelReply}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}