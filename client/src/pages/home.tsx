import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import PayPalButton from "@/components/PayPalButton";
import { 
  Facebook, 
  Users, 
  UserPlus, 
  ThumbsUp, 
  Heart, 
  Play,
  ArrowLeft,
  Shield,
  Clock,
  Star,
  Menu,
  Minus,
  Plus,
  Wallet,
  DollarSign,
  LogIn,
  LogOut,
  User
} from "lucide-react";

interface Service {
  serviceId: string;
  name: string;
  rate: string;
  originalRate: string;
  minOrder: number;
  maxOrder: number;
}

interface Order {
  id: string;
  orderId: string;
  serviceName: string;
  quantity: number;
  amount: string;
  status: string;
  createdAt: string;
}

const SERVICE_ICONS = {
  "1977": Facebook,
  "1775": Users,
  "55": UserPlus,
  "221": ThumbsUp,
  "1779": Heart,
  "254": Play
};

const SERVICE_COLORS = {
  "1977": "bg-blue-100 text-blue-600",
  "1775": "bg-purple-100 text-purple-600",
  "55": "bg-green-100 text-green-600",
  "221": "bg-red-100 text-red-600",
  "1779": "bg-pink-100 text-pink-600",
  "254": "bg-indigo-100 text-indigo-600"
};

const SERVICE_BADGES = {
  "1977": { text: "Fast Delivery", color: "bg-green-100 text-green-600" },
  "1775": { text: "Premium Quality", color: "bg-green-100 text-green-600" },
  "55": { text: "Instant Start", color: "bg-blue-100 text-blue-600" },
  "221": { text: "Most Popular", color: "bg-orange-100 text-orange-600" },
  "1779": { text: "Trending", color: "bg-purple-100 text-purple-600" },
  "254": { text: "Video Boost", color: "bg-teal-100 text-teal-600" }
};

export default function Home() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [facebookLink, setFacebookLink] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showPayPal, setShowPayPal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState(10);
  const [userBalance, setUserBalance] = useState("0.00");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Fetch services
  const { data: services = [], isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  // Fetch orders
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: showOrders,
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setCurrentOrderId(data.order.id);
        setShowPayPal(true);
        toast({
          title: "Order Created",
          description: `Order ${data.order.id} created successfully. Please complete payment.`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to create order",
        variant: "destructive",
      });
    },
  });

  const handleServiceSelect = (service: Service) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login first to place an order for Facebook services",
        variant: "destructive",
      });
      return;
    }
    
    if (service.rate === "N/A") {
      toast({
        title: "Service Unavailable",
        description: "This service is currently unavailable. Please try another service.",
        variant: "destructive",
      });
      return;
    }
    setSelectedService(service);
    setShowOrderForm(true);
  };

  const handleBackToServices = () => {
    setShowOrderForm(false);
    setShowPayPal(false);
    setSelectedService(null);
    setFacebookLink("");
    setQuantity(1);
    setCurrentOrderId(null);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const isValidFacebookUrl = (url: string) => {
    const fbUrlPattern = /^https?:\/\/(www\.)?(facebook|fb)\.com\/.+/i;
    return fbUrlPattern.test(url);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService) return;
    
    if (!isValidFacebookUrl(facebookLink)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Facebook URL",
        variant: "destructive",
      });
      return;
    }

    const totalAmount = (parseFloat(selectedService.rate) * quantity).toFixed(2);

    createOrderMutation.mutate({
      orderId: `ORDER_${Date.now()}`,
      serviceId: selectedService.serviceId,
      serviceName: selectedService.name,
      link: facebookLink,
      quantity: quantity * 1000,
      amount: totalAmount,
      status: "Pending Payment"
    });
  };

  const totalPrice = selectedService ? (parseFloat(selectedService.rate) * quantity).toFixed(2) : "0.00";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Facebook className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">SocialBoost</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <button 
                onClick={() => { setShowOrders(false); setShowWallet(false); handleBackToServices(); }}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Services
              </button>
              <button 
                onClick={() => {
                  if (!isAuthenticated) {
                    toast({
                      title: "Login Required",
                      description: "Please login first to view your orders",
                      variant: "destructive",
                    });
                    return;
                  }
                  setShowOrders(true); 
                  setShowWallet(false);
                }}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                My Orders
              </button>
              <button 
                onClick={() => {
                  if (!isAuthenticated) {
                    toast({
                      title: "Login Required", 
                      description: "Please login first to access your wallet",
                      variant: "destructive",
                    });
                    return;
                  }
                  setShowWallet(true); 
                  setShowOrders(false);
                }}
                className="text-gray-600 hover:text-blue-600 transition-colors flex items-center space-x-1"
              >
                <Wallet className="w-4 h-4" />
                <span>Wallet</span>
              </button>
              {isAuthenticated && (
                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  Balance: ${userBalance}
                </div>
              )}
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">{user?.email || 'User'}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        await apiRequest('/api/logout', 'POST');
                        queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
                        window.location.reload();
                      } catch (error) {
                        console.error('Logout error:', error);
                      }
                    }}
                    className="flex items-center space-x-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => window.location.href = '/login'}
                  className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Button>
              )}
            </div>
            <button className="md:hidden text-gray-600">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {!showOrders && !showWallet ? (
        <>
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-blue-600 to-blue-500 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Boost Your Facebook Presence
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100">
                Professional Facebook growth services with instant delivery and guaranteed results
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-300" />
                  <span>Secure & Safe</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-green-300" />
                  <span>Instant Start</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-green-300" />
                  <span>High Quality</span>
                </div>
              </div>
            </div>
          </section>

          {/* Service Selection Section */}
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              {!showOrderForm ? (
                <>
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Service</h2>
                    <p className="text-lg text-gray-600">Select from our premium Facebook growth services</p>
                  </div>

                  {/* Service Cards Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {servicesLoading ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="animate-pulse">
                          <CardContent className="p-6">
                            <div className="h-20 bg-gray-200 rounded mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      services.map((service) => {
                        const IconComponent = SERVICE_ICONS[service.serviceId as keyof typeof SERVICE_ICONS];
                        const iconColorClass = SERVICE_COLORS[service.serviceId as keyof typeof SERVICE_COLORS];
                        const badge = SERVICE_BADGES[service.serviceId as keyof typeof SERVICE_BADGES];
                        
                        return (
                          <Card 
                            key={service.serviceId} 
                            className="hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => handleServiceSelect(service)}
                          >
                            <CardContent className="p-6">
                              <div className="flex items-center mb-4">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${iconColorClass}`}>
                                  <IconComponent className="w-6 h-6" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">{service.name.replace('Facebook ', '')}</h3>
                                  <p className="text-sm text-gray-500">Boost engagement</p>
                                </div>
                              </div>
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm text-gray-600">Rate per 1000:</span>
                                  <span className={`font-semibold ${service.rate === 'N/A' ? 'text-red-500' : 'text-blue-600'}`}>
                                    {service.rate === 'N/A' ? 'N/A' : `$${service.rate}`}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500">High-quality, real-looking engagement</div>
                              </div>
                              <div className="flex items-center justify-between">
                                <Badge className={badge.color}>{badge.text}</Badge>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </>
              ) : (
                /* Order Form */
                <Card className="max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle className="text-2xl">Complete Your Order</CardTitle>
                    <p className="text-gray-600">Configure your service and proceed to payment</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Selected Service Display */}
                    {selectedService && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">{selectedService.name}</h4>
                            <p className="text-sm text-gray-600">Facebook Growth Service</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">Rate per 1000</div>
                            <div className="font-bold text-blue-600">${selectedService.rate}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmitOrder} className="space-y-6">
                        {/* Facebook Link Input */}
                        <div>
                          <Label htmlFor="facebook-link">
                            Facebook Link <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="facebook-link"
                            type="url"
                            placeholder="https://facebook.com/your-page-or-post"
                            value={facebookLink}
                            onChange={(e) => setFacebookLink(e.target.value)}
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Enter the full Facebook URL for your page, profile, post, or video
                          </p>
                        </div>

                        {/* Quantity Selection */}
                        <div>
                          <Label htmlFor="quantity">
                            Quantity (in thousands) <span className="text-red-500">*</span>
                          </Label>
                          <div className="flex items-center space-x-4 mt-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => handleQuantityChange(-1)}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <Input
                              id="quantity"
                              type="number"
                              min="1"
                              value={quantity}
                              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                              className="text-center font-semibold"
                              required
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => handleQuantityChange(1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Each unit represents 1,000 likes/followers/views/reactions
                          </p>
                        </div>

                        {/* Price Calculation */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Quantity:</span>
                              <span className="font-medium">{(quantity * 1000).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Rate per 1,000:</span>
                              <span className="font-medium">${selectedService?.rate}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-lg font-bold">
                              <span className="text-gray-900">Total Price:</span>
                              <span className="text-blue-600">${totalPrice}</span>
                            </div>
                          </div>
                        </div>

                        {/* Wallet Payment Section */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Current Balance:</span>
                              <span className="font-medium text-green-600">${userBalance}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Order Total:</span>
                              <span className="font-medium">${totalPrice}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                              <span className="font-semibold">Remaining Balance:</span>
                              <span className={`font-semibold ${
                                parseFloat(userBalance) >= parseFloat(totalPrice) 
                                  ? 'text-green-600' 
                                  : 'text-red-500'
                              }`}>
                                ${(parseFloat(userBalance) - parseFloat(totalPrice)).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {parseFloat(userBalance) >= parseFloat(totalPrice) ? (
                          <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            disabled={createOrderMutation.isPending}
                          >
                            {createOrderMutation.isPending ? "Processing Order..." : "Pay with Wallet Balance"}
                          </Button>
                        ) : (
                          <div className="text-center space-y-4">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                              <p className="text-red-700 text-sm">
                                Insufficient balance. You need ${(parseFloat(totalPrice) - parseFloat(userBalance)).toFixed(2)} more.
                              </p>
                            </div>
                            <Button
                              type="button"
                              onClick={() => {
                                setShowWallet(true);
                                setShowOrderForm(false);
                              }}
                              className="w-full"
                            >
                              Add Funds to Wallet
                            </Button>
                          </div>
                        )}

                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleBackToServices}
                          className="w-full"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Cancel Order
                        </Button>
                      </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </section>
        </>
      ) : showWallet ? (
        /* Wallet Section */
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">My Wallet</h2>
              <p className="text-lg text-gray-600">Manage your account balance and deposits</p>
            </div>

            {/* Balance Card */}
            <Card className="mb-8">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Current Balance</h3>
                <p className="text-4xl font-bold text-green-600">${userBalance}</p>
                <p className="text-gray-500 mt-2">Available for orders</p>
              </CardContent>
            </Card>

            {/* Deposit Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">Add Funds to Wallet</CardTitle>
                <p className="text-gray-600">Deposit money to your wallet to place orders</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Deposit Amount Selection */}
                <div>
                  <Label htmlFor="deposit-amount">Select Deposit Amount</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                    {[10, 25, 50, 100].map((amount) => (
                      <Button
                        key={amount}
                        variant={depositAmount === amount ? "default" : "outline"}
                        onClick={() => setDepositAmount(amount)}
                        className="h-12"
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2 mt-4">
                    <Label htmlFor="custom-amount">Custom amount:</Label>
                    <Input
                      id="custom-amount"
                      type="number"
                      min="10"
                      max="1000"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Math.max(10, parseInt(e.target.value) || 10))}
                      className="w-24"
                    />
                  </div>
                </div>

                {/* PayPal Deposit Button */}
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Deposit ${depositAmount} via PayPal</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Secure payment processing through PayPal. Funds will be added to your wallet instantly.
                    </p>
                    <PayPalButton
                      key={depositAmount}
                      amount={depositAmount.toString()}
                      currency="USD"
                      intent="CAPTURE"
                    />
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setShowWallet(false)}
                  className="w-full"
                >
                  Back to Services
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      ) : (
        /* Order History Section */
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Order History</h2>
              <p className="text-lg text-gray-600">Track your Facebook growth services</p>
            </div>

            <div className="space-y-4">
              {orders.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">No orders found. Start by selecting a service!</p>
                    <Button 
                      onClick={() => setShowOrders(false)}
                      className="mt-4"
                    >
                      Browse Services
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => (
                  <Card key={order.orderId}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">Order #{order.orderId}</h4>
                          <p className="text-sm text-gray-500">{order.serviceName}</p>
                        </div>
                        <Badge 
                          className={
                            order.status === "Completed" ? "bg-green-100 text-green-800" :
                            order.status === "Processing" ? "bg-blue-100 text-blue-800" :
                            order.status === "Pending Payment" ? "bg-yellow-100 text-yellow-800" :
                            "bg-gray-100 text-gray-800"
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Quantity:</span>
                          <div className="font-medium">{order.quantity.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Total:</span>
                          <div className="font-medium">${order.amount}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Date:</span>
                          <div className="font-medium">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Facebook className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold">SocialBoost</span>
              </div>
              <p className="text-gray-400 text-sm">
                Professional Facebook growth services with guaranteed results and instant delivery.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Page Likes</li>
                <li>Page Followers</li>
                <li>Profile Followers</li>
                <li>Post Likes</li>
                <li>Post Reactions</li>
                <li>Video Views</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Live Chat</li>
                <li>Order Status</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Security</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Safe & Secure</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Refund Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 SocialBoost. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
