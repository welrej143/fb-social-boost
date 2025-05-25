import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Facebook, LogIn, UserPlus } from "lucide-react";

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      return apiRequest("/api/login", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Welcome back!",
        description: "Successfully logged in to your account",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      window.location.href = "/";
    },
    onError: () => {
      toast({
        title: "Login Failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; firstName?: string; lastName?: string }) => {
      return apiRequest("/api/register", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Account Created!",
        description: "Welcome to FB Social Boost",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Small delay to ensure session is set
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (isRegistering) {
      registerMutation.mutate({ email, password, firstName, lastName });
    } else {
      loginMutation.mutate({ email, password });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Facebook className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">FB Social Boost</span>
          </div>
          <p className="text-gray-600">
            {isRegistering ? "Create your account" : "Sign in to your account"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {isRegistering ? (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Create Account</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </CardTitle>
            <CardDescription>
              {isRegistering 
                ? "Join thousands of users boosting their Facebook presence" 
                : "Welcome back to FB Social Boost"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegistering && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                    />
                  </div>
                </div>
              )}
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending || registerMutation.isPending}
              >
                {loginMutation.isPending || registerMutation.isPending ? (
                  "Please wait..."
                ) : isRegistering ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="link"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-blue-600"
              >
                {isRegistering 
                  ? "Already have an account? Sign in" 
                  : "Don't have an account? Create one"
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}