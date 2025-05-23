import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import PayPalButton from "@/components/PayPalButton";
import { 
  User, 
  Wallet, 
  LogOut, 
  Mail, 
  Calendar, 
  CreditCard,
  DollarSign,
  ArrowLeft,
  Plus
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Account() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [depositAmount, setDepositAmount] = useState("10.00");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/logout', 'POST');
    },
    onSuccess: () => {
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      window.location.href = "/";
    },
    onError: () => {
      toast({
        title: "Logout Failed", 
        description: "Failed to logout properly",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading account...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/" className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Services</span>
                </Link>
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">My Account</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Profile Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Email:</span>
                <span className="text-sm font-medium">{user?.email}</span>
              </div>
              
              {(user?.firstName || user?.lastName) && (
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Name:</span>
                  <span className="text-sm font-medium">
                    {user?.firstName} {user?.lastName}
                  </span>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Member since:</span>
                <span className="text-sm font-medium">
                  {new Date(user?.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <Separator />
              
              <Button
                variant="destructive"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="w-full flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
              </Button>
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  );
}