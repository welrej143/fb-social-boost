import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Users, DollarSign, ShoppingCart, TrendingUp, Edit2, Save, X, MessageCircle } from "lucide-react";
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

  // Fetch PayPal click analytics
  const { data: paypalClicks, isLoading: clicksLoading } = useQuery({
    queryKey: ["/api/admin/paypal-clicks"],
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Processing': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (statsLoading || usersLoading || ordersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Manage your Facebook growth platform</p>
            </div>
            <Button 
              onClick={() => window.location.href = '/admin/chat'}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Live Chat Support</span>
            </Button>
          </div>
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
              <div className="text-2xl font-bold">${stats?.totalRevenue || '0.00'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${stats?.totalCost || '0.00'}</div>
              <p className="text-xs text-muted-foreground mt-1">SMM Valley costs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.totalProfit || '0.00'}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Users and Orders */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Users Management</TabsTrigger>
            <TabsTrigger value="orders">Orders Management</TabsTrigger>
            <TabsTrigger value="analytics">PayPal Analytics</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Users Management</CardTitle>
                <CardDescription>
                  Manage user accounts and balances
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users?.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          {editingUser === user.id ? (
                            <div className="flex items-center space-x-2">
                              <Label htmlFor={`balance-${user.id}`} className="text-sm">Balance:</Label>
                              <Input
                                id={`balance-${user.id}`}
                                type="number"
                                step="0.01"
                                value={newBalance}
                                onChange={(e) => setNewBalance(e.target.value)}
                                className="w-24"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSaveBalance(user.id)}
                                disabled={updateBalanceMutation.isPending}
                              >
                                <Save className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">Balance:</span>
                              <span className="font-medium">${user.balance}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditBalance(user.id, user.balance)}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {users?.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No users found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Orders Management</CardTitle>
                <CardDescription>
                  View and manage all platform orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders?.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-medium">Order #{order.orderId}</h3>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${order.amount}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Service:</span>
                          <p className="font-medium">{order.serviceName}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Quantity:</span>
                          <p className="font-medium">{order.quantity}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">User ID:</span>
                          <p className="font-medium">{order.userId}</p>
                        </div>
                      </div>
                      
                      {order.link && (
                        <div className="mt-2">
                          <span className="text-gray-600 text-sm">Target URL:</span>
                          <p className="text-sm break-all">{order.link}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {orders?.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No orders found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PayPal Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>PayPal Click Analytics</CardTitle>
                <CardDescription>
                  Track PayPal button clicks and user engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                {clicksLoading ? (
                  <div className="text-center py-8">Loading click data...</div>
                ) : (
                  <div className="space-y-4">
                    {/* Analytics Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {paypalClicks?.length || 0}
                            </div>
                            <p className="text-sm text-muted-foreground">Total Clicks</p>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {paypalClicks?.filter((click: any) => click.userId).length || 0}
                            </div>
                            <p className="text-sm text-muted-foreground">Logged-in Users</p>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              ${paypalClicks?.reduce((sum: number, click: any) => 
                                sum + parseFloat(click.depositAmount || 0), 0).toFixed(2) || '0.00'}
                            </div>
                            <p className="text-sm text-muted-foreground">Total Intent Value</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Click Details */}
                    <div className="space-y-3">
                      {paypalClicks?.map((click: any) => (
                        <div key={click.id} className="border rounded-lg p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <Badge variant={click.userId ? "default" : "secondary"}>
                                {click.userId ? "Logged In" : "Anonymous"}
                              </Badge>
                              <span className="font-medium">${click.depositAmount}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">
                                {new Date(click.clickedAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">User:</span>
                              <p className="font-medium">
                                {click.userEmail || `User ID: ${click.userId}` || "Anonymous"}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">Session:</span>
                              <p className="font-medium text-xs break-all">
                                {click.sessionId?.substring(0, 20)}...
                              </p>
                            </div>
                          </div>
                          
                          {click.ipAddress && (
                            <div>
                              <span className="text-gray-600 text-sm">IP Address:</span>
                              <p className="text-sm">{click.ipAddress}</p>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {paypalClicks?.length === 0 && (
                        <p className="text-center text-gray-500 py-8">No PayPal clicks recorded yet</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}