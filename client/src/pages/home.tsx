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
import GCashPayment from "@/components/GCashPayment";
import LiveChat from "@/components/LiveChat";
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
  User,
  Timer,
  Zap,
  Gift,
  TrendingUp,
  Flame
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
  const [quantity, setQuantity] = useState(1000);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showGCash, setShowGCash] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState(5);
  const [userBalance, setUserBalance] = useState("0.00");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => {
    // Get saved timer from localStorage or default to 24 hours
    const saved = localStorage.getItem('flashSaleTimer');
    if (saved) {
      const savedData = JSON.parse(saved);
      const now = Date.now();
      const elapsed = Math.floor((now - savedData.startTime) / 1000);
      const remaining = Math.max(0, savedData.duration - elapsed);
      return remaining > 0 ? remaining : 24 * 60 * 60; // Reset if expired
    }
    return 24 * 60 * 60; // 24 hours in seconds
  });
  const [showSpecialOffer, setShowSpecialOffer] = useState(true);
  const [isFirstTimeDeposit, setIsFirstTimeDeposit] = useState(true);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Update user balance when user data changes
  useEffect(() => {
    if (user?.balance) {
      setUserBalance(user.balance);
    }
  }, [user]);

  // Countdown timer effect with localStorage persistence
  useEffect(() => {
    // Save initial timer state to localStorage
    const saveTimerState = (timeRemaining: number) => {
      localStorage.setItem('flashSaleTimer', JSON.stringify({
        startTime: Date.now(),
        duration: timeRemaining
      }));
    };

    // Save initial state
    saveTimerState(timeLeft);

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime <= 1 ? 24 * 60 * 60 : prevTime - 1; // Reset to 24 hours when timer reaches 0
        
        // Update localStorage every minute to avoid too frequent writes
        if (newTime % 60 === 0) {
          saveTimerState(newTime);
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time for display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(orderData),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        // Throw the actual error message from the API
        throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
      }
      return responseData;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Order Successful!",
          description: `Order submitted to SMM API! New balance: $${data.newBalance}. SMM Order ID: ${data.order.smmOrderId}`,
        });
        // Refresh user data and orders
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
        handleBackToServices();
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

  // Wallet payment mutation
  const walletPaymentMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await fetch(`/api/orders/${orderId}/pay-wallet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Payment Successful!",
          description: `Order submitted to SMM API. New balance: $${data.newBalance}`,
        });
        // Refresh user data and orders
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
        handleBackToServices();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process wallet payment",
        variant: "destructive",
      });
    },
  });

  const handleWalletPayment = () => {
    if (currentOrderId) {
      walletPaymentMutation.mutate(currentOrderId);
    }
  };

  // Footer navigation handlers
  const handleServiceSelection = (serviceId: string) => {
    const service = services.find(s => s.serviceId === serviceId);
    if (service) {
      handleServiceSelect(service);
    } else {
      toast({
        title: "Service Not Available",
        description: "This service is currently not available. Please try another service.",
        variant: "destructive",
      });
    }
  };

  const handleOrderStatus = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login first to check your order status",
        variant: "destructive",
      });
      return;
    }
    setShowOrders(true);
    setShowWallet(false);
  };

  const handleFooterClick = (type: string) => {
    const messages = {
      help: {
        title: "Help Center",
        description: "For assistance, please email us at socialboostertool01@gmail.com or visit our support center"
      },
      ticket: {
        title: "Contact Support",
        description: "Need help? Email us at socialboostertool01@gmail.com with your issue and we'll respond within 24 hours"
      },
      security: {
        title: "Safe & Secure",
        description: "We use industry-standard security measures to protect your data and ensure safe transactions"
      },
      privacy: {
        title: "Privacy Policy",
        description: "We respect your privacy and protect your personal information. Your data is never shared with third parties"
      },
      terms: {
        title: "Terms of Service",
        description: "By using our services, you agree to our terms. All orders are processed securely through verified APIs"
      },
      refund: {
        title: "Refund Policy",
        description: "We offer refunds for incomplete orders. Contact support within 24 hours if you experience any issues"
      }
    };

    const message = messages[type as keyof typeof messages];
    if (message) {
      toast({
        title: message.title,
        description: message.description,
      });
    }
  };

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
    setShowGCash(false);
    setSelectedService(null);
    setFacebookLink("");
    setQuantity(1000);
    setCurrentOrderId(null);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1000, quantity + (delta * 1000)));
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

    const basePrice = parseFloat(selectedService.rate) * quantity / 1000;
    const discount = getDiscount(quantity);
    const totalAmount = (basePrice - (basePrice * discount)).toFixed(2);

    createOrderMutation.mutate({
      orderId: `ORDER_${Date.now()}`,
      serviceId: selectedService.serviceId,
      serviceName: selectedService.name,
      link: facebookLink,
      quantity: quantity,
      amount: totalAmount,
      status: "Pending Payment",
      userId: parseInt(user?.id || "0")
    });
  };

  // Calculate discount based on quantity
  const getDiscount = (qty: number) => {
    if (qty >= 20000) return 0.50; // 50% discount
    if (qty >= 10000) return 0.30; // 30% discount
    if (qty >= 5000) return 0.20;  // 20% discount
    return 0; // No discount for 1,000-4,000
  };

  const basePrice = selectedService ? parseFloat(selectedService.rate) * quantity / 1000 : 0;
  const discount = getDiscount(quantity);
  const discountAmount = basePrice * discount;
  const totalPrice = (basePrice - discountAmount).toFixed(2);

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
              <span className="text-xl font-bold text-gray-900">FB Social Boost</span>
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
                <Button
                  onClick={() => window.location.href = '/account'}
                  className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700"
                >
                  <User className="w-4 h-4" />
                  <span>My Account</span>
                </Button>
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
            <button 
              className="md:hidden text-gray-600 hover:text-blue-600 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-3 space-y-3">
              <button 
                onClick={() => { 
                  setShowOrders(false); 
                  setShowWallet(false); 
                  handleBackToServices(); 
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left text-gray-600 hover:text-blue-600 transition-colors py-2"
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
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left text-gray-600 hover:text-blue-600 transition-colors py-2"
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
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 w-full text-left text-gray-600 hover:text-blue-600 transition-colors py-2"
              >
                <Wallet className="w-4 h-4" />
                <span>Wallet</span>
              </button>
              {isAuthenticated && (
                <div className="bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm font-medium">
                  Balance: ${userBalance}
                </div>
              )}
              
              {isAuthenticated ? (
                <Button
                  onClick={() => {
                    window.location.href = '/account';
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700"
                >
                  <User className="w-4 h-4" />
                  <span>My Account</span>
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    window.location.href = '/login';
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Special Discount Banner */}
      {showSpecialOffer && (
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white py-3 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-transparent to-orange-500/20 animate-pulse"></div>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between relative z-10">
            <div className="flex items-center space-x-3 mb-2 md:mb-0">
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 animate-bounce text-yellow-300" />
                <span className="font-bold text-lg">🔥 FLASH SALE</span>
                <Flame className="w-5 h-5 animate-bounce text-yellow-300" />
              </div>
              <span className="text-sm md:text-base font-medium">
                Get UP TO 50% OFF on all services!
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Timer className="w-4 h-4" />
                <span className="text-sm font-medium">Ends in:</span>
                <div className="bg-white/20 px-3 py-1 rounded-lg font-mono font-bold text-yellow-300">
                  {formatTime(timeLeft)}
                </div>
              </div>
              <button 
                onClick={() => setShowSpecialOffer(false)}
                className="text-white/80 hover:text-white text-xl"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* First Time Deposit Offer */}
      {isFirstTimeDeposit && showWallet && (
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white py-4 px-4 border-b">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Gift className="w-6 h-6 text-yellow-300" />
              <span className="text-xl font-bold">🎉 FIRST DEPOSIT BONUS!</span>
              <Gift className="w-6 h-6 text-yellow-300" />
            </div>
            <p className="text-lg font-semibold mb-2">
              Get 25% bonus on your very first deposit!
            </p>
            <p className="text-sm text-green-100">
              Limited time offer • One-time bonus for new users only • Available once per account!
            </p>
          </div>
        </div>
      )}

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
                                  {service.rate === 'N/A' ? (
                                    <span className="font-semibold text-red-500">N/A</span>
                                  ) : (
                                    <div className="flex items-center space-x-2">
                                      {/* Original Price (Crossed Out) */}
                                      <span className="text-sm text-gray-400 line-through">
                                        ${(parseFloat(service.rate) * 3).toFixed(2)}
                                      </span>
                                      {/* Current Price */}
                                      <span className="font-bold text-green-600 text-lg">
                                        ${service.rate}
                                      </span>
                                      {/* Discount Badge */}
                                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                                        50% OFF
                                      </span>
                                    </div>
                                  )}
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
                            Quantity <span className="text-red-500">*</span>
                          </Label>
                          <div className="flex items-center space-x-4 mt-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => handleQuantityChange(-1)}
                              disabled={quantity <= 1000}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <div className="flex-1 text-center font-semibold text-lg bg-gray-50 border rounded-md py-2">
                              {quantity.toLocaleString()}
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => handleQuantityChange(1)}
                              disabled={quantity >= 50000}
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
                              <span className="font-medium">{quantity.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Rate per 1,000:</span>
                              <span className="font-medium">${selectedService?.rate}</span>
                            </div>
                            {discount > 0 && (
                              <>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Subtotal:</span>
                                  <span className="font-medium">${basePrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-green-600">Discount ({(discount * 100)}%):</span>
                                  <span className="text-green-600">-${discountAmount.toFixed(2)}</span>
                                </div>
                              </>
                            )}
                            <Separator />
                            <div className="flex justify-between text-lg font-bold">
                              <span className="text-gray-900">Total Price:</span>
                              <span className="text-blue-600">${totalPrice}</span>
                            </div>
                            {discount > 0 && (
                              <div className="text-xs text-green-600 font-medium text-center">
                                🎉 {(discount * 100)}% discount applied!
                              </div>
                            )}
                            {/* Show discount tiers */}
                            <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                              <div className="font-medium text-blue-800 mb-1">💰 Volume Discounts:</div>
                              <div className="space-y-1 text-blue-700">
                                <div className={quantity >= 1000 && quantity < 5000 ? "font-bold" : ""}>
                                  1,000-4,999: Regular price
                                </div>
                                <div className={quantity >= 5000 && quantity < 10000 ? "font-bold" : ""}>
                                  5,000-9,999: 10% off
                                </div>
                                <div className={quantity >= 10000 && quantity < 20000 ? "font-bold" : ""}>
                                  10,000-19,999: 15% off
                                </div>
                                <div className={quantity >= 20000 ? "font-bold" : ""}>
                                  20,000+: 20% off
                                </div>
                              </div>
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
                              className="w-full bg-green-600 hover:bg-green-700"
                              disabled={createOrderMutation.isPending}
                            >
                              {createOrderMutation.isPending ? "Processing Order..." : "Submit Order & Pay with Wallet"}
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

          {/* Customer Reviews Section */}
          <section className="bg-gray-50 py-16">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
                <p className="text-gray-600">Real results from real customers</p>
              </div>
            
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex space-x-6 pb-4" style={{ width: 'max-content' }}>
                {[
                  {
                    name: "Sarah Mitchell",
                    service: "Facebook Page Likes",
                    rating: 5,
                    review: "Boosted my bakery page from 300 to 5,000 likes in just 3 days! The engagement quality is fantastic and my sales have increased by 40%. Definitely worth every penny.",
                    verified: true
                  },
                  {
                    name: "Marcus Rodriguez", 
                    service: "Facebook Video Views",
                    rating: 5,
                    review: "My fitness coaching videos went from 50 views to over 10,000! The views look completely natural and I've gained so many new clients. Fast delivery too.",
                    verified: true
                  },
                  {
                    name: "Jennifer Chen",
                    service: "Facebook Post Likes", 
                    rating: 4,
                    review: "Great service for promoting my art posts. The likes come in gradually which looks organic. Customer support was very helpful when I had questions.",
                    verified: true
                  },
                  {
                    name: "David Thompson",
                    service: "Facebook Page Followers",
                    rating: 5,
                    review: "My restaurant page grew from 800 to 15,000 followers in a week. The followers are active and many have become actual customers. Amazing ROI!",
                    verified: true
                  },
                  {
                    name: "Lisa Park",
                    service: "Facebook Profile Followers", 
                    rating: 5,
                    review: "Helped establish my credibility as a real estate agent. Went from 200 to 5,000 followers and now potential clients take me much more seriously.",
                    verified: true
                  },
                  {
                    name: "Alex Kumar",
                    service: "Facebook Post Reactions",
                    rating: 4,
                    review: "Perfect for testing which content performs best. The reactions feel natural and helped me understand my audience better. Will definitely use again.",
                    verified: true
                  }
                ].map((review, index) => (
                  <Card key={index} className="flex-shrink-0 w-80 bg-gradient-to-br from-blue-500 to-blue-700 border-none shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-3 backdrop-blur-sm">
                          <span className="text-white font-semibold text-lg">
                            {review.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{review.name}</h4>
                          <p className="text-sm text-blue-100">{review.service}</p>
                        </div>
                        {review.verified && (
                          <div className="ml-auto">
                            <span className="bg-green-400 text-green-900 text-xs px-2 py-1 rounded-full font-medium">
                              Verified
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex mb-3">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-300' : 'text-blue-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      
                      <p className="text-blue-50 text-sm leading-relaxed">{review.review}</p>
                    </CardContent>
                  </Card>
                ))}
                </div>
              </div>
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

            {/* Special First-Time Deposit Offer */}
            {isFirstTimeDeposit && (
              <Card className="mb-8 border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-red-500 text-white px-4 py-1 text-sm font-bold transform rotate-12 translate-x-4 -translate-y-1">
                  🔥 ONE-TIME ONLY
                </div>
                <CardHeader className="relative">
                  <div className="flex items-center space-x-3 mb-2">
                    <Gift className="w-8 h-8 text-green-600 animate-bounce" />
                    <CardTitle className="text-2xl text-green-700">🎉 FIRST DEPOSIT BONUS!</CardTitle>
                  </div>
                  <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded">
                    <div className="flex items-center">
                      <TrendingUp className="w-6 h-6 text-yellow-600 mr-3" />
                      <div>
                        <p className="text-lg font-bold text-yellow-800">Get 25% BONUS on your first deposit!</p>
                        <p className="text-sm text-yellow-700">Deposit any amount and get an instant 25% bonus added to your wallet!</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 mt-3 text-sm">
                    <div className="flex items-center space-x-1 text-green-600">
                      <Clock className="w-4 h-4" />
                      <span className="font-semibold">Expires in: {formatTime(timeLeft)}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-orange-600">
                      <Zap className="w-4 h-4" />
                      <span className="font-semibold">Limited time only!</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border-2 border-dashed border-green-300">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-800 mb-2">Bonus Examples:</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-blue-600 font-semibold">$5</span>
                          <span>+</span>
                          <span className="text-green-600 font-bold">$1.25</span>
                          <span>=</span>
                          <span className="text-purple-600 font-bold">$6.25</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-blue-600 font-semibold">$10</span>
                          <span>+</span>
                          <span className="text-green-600 font-bold">$2.50</span>
                          <span>=</span>
                          <span className="text-purple-600 font-bold">$12.50</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-blue-600 font-semibold">$25</span>
                          <span>+</span>
                          <span className="text-green-600 font-bold">$6.25</span>
                          <span>=</span>
                          <span className="text-purple-600 font-bold">$31.25</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-blue-600 font-semibold">$50</span>
                          <span>+</span>
                          <span className="text-green-600 font-bold">$12.50</span>
                          <span>=</span>
                          <span className="text-purple-600 font-bold">$62.50</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-bold animate-pulse"
                    onClick={() => {
                      // Scroll to deposit section instead of hiding the bonus
                      document.querySelector('.grid.grid-cols-2.md\\:grid-cols-4')?.scrollIntoView({ 
                        behavior: 'smooth' 
                      });
                    }}
                  >
                    🎁 CLAIM MY 25% BONUS NOW! 🎁
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Regular Deposit Section */}
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
                    {[5, 10, 25, 50].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        onClick={() => setDepositAmount(amount)}
                        className={`h-12 flex flex-col justify-center ${
                          depositAmount === amount 
                            ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                            : isFirstTimeDeposit 
                              ? 'ring-2 ring-green-500 bg-green-100 border-green-500' 
                              : ''
                        }`}
                      >
                        <span className={depositAmount === amount ? "text-white font-semibold" : ""}>${amount}</span>
                        <span className="text-xs text-gray-500">₱{(amount * 60).toLocaleString()}</span>
                        {isFirstTimeDeposit && (
                          <span className="text-xs bg-red-500 text-white px-1 rounded mt-1">
                            +${(amount * 0.25).toFixed(2)}
                          </span>
                        )}
                      </Button>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2 mt-4">
                    <Label htmlFor="custom-amount">Custom amount:</Label>
                    <Input
                      id="custom-amount"
                      type="number"
                      min="5"
                      max="1000"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Math.max(5, parseInt(e.target.value) || 5))}
                      className="w-24"
                    />
                  </div>
                </div>

                {/* GCash Deposit Button */}
                <div className="space-y-4">
                  {!showGCash ? (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Deposit ${depositAmount} (₱{(depositAmount * 60).toLocaleString()}) via GCash</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Manual payment processing through GCash. Contact us on WhatsApp to complete your deposit. Exchange rate: 1 USD = 60 PHP
                      </p>
                      <Button 
                        onClick={() => setShowGCash(true)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Proceed with GCash Payment
                      </Button>
                    </div>
                  ) : (
                    <GCashPayment 
                      amountUSD={depositAmount.toString()}
                      onCancel={() => setShowGCash(false)}
                    />
                  )}
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
                          <h4 className="font-semibold text-gray-900">
                            Order #{order.orderId}
                          </h4>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Facebook className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold">FB Social Boost</span>
              </div>
              <p className="text-gray-400 text-sm">
                Professional Facebook growth services with guaranteed results and instant delivery.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/support" className="hover:text-white transition-colors">Contact Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/refund" className="hover:text-white transition-colors">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 FB Social Boost. All rights reserved.</p>
          </div>
        </div>
      </footer>


    </div>
  );
}
