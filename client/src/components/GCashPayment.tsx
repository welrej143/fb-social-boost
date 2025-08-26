import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MessageCircle, 
  Clock, 
  Phone, 
  User, 
  AlertTriangle,
  Copy,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GCashPaymentProps {
  amountUSD: string;
  onCancel: () => void;
}

export default function GCashPayment({ amountUSD, onCancel }: GCashPaymentProps) {
  const { toast } = useToast();
  
  // Convert USD to PHP at fixed rate of 1 USD = 60 PHP
  const amountPHP = (parseFloat(amountUSD) * 60).toFixed(2);
  
  const gcashName = "JE***L N.";
  const gcashNumber = "09678361036";
  const whatsappNumber = "+639678361036";
  
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };
  
  const openWhatsApp = () => {
    const message = `Hi! I want to deposit ₱${amountPHP} to my account via GCash. Please confirm the payment details.`;
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <Card className="border-2 border-blue-200">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl text-blue-700 flex items-center justify-center gap-2">
            <Phone className="w-5 h-5" />
            GCash Payment
          </CardTitle>
          <div className="text-2xl font-bold text-green-600">
            ₱{amountPHP}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Exchange Rate Info */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-700 font-medium">
              Current Exchange Rate: 1 USD = 60 PHP
            </div>
          </div>
          
          {/* GCash Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">Send payment to:</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Name:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold">{gcashName}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(gcashName, "Name")}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Number:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold">{gcashNumber}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(gcashNumber, "GCash number")}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Manual Processing Notice */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-semibold text-amber-800">Manual Processing</h4>
                <p className="text-sm text-amber-700">
                  Your deposit will be processed manually within 2-24 hours after payment confirmation. 
                  Your account balance will be updated once we verify your GCash transfer.
                </p>
              </div>
            </div>
          </div>
          
          {/* Processing Time */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Processing time: 2-24 hours</span>
          </div>
          
          <Separator />
          
          {/* WhatsApp Contact */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">Contact us for payment confirmation:</h3>
            
            <Button 
              onClick={openWhatsApp}
              className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Contact via WhatsApp
              <ExternalLink className="w-4 h-4" />
            </Button>
            
            <div className="text-center">
              <Badge variant="outline" className="text-xs">
                {whatsappNumber}
              </Badge>
            </div>
          </div>
          
          <Separator />
          
          {/* Instructions */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-800 text-sm">Payment Instructions:</h4>
            <ol className="text-xs text-gray-600 space-y-1 pl-4">
              <li>1. Send ₱{amountPHP} to the GCash number above</li>
              <li>2. Take a screenshot of the successful transfer</li>
              <li>3. Contact us on WhatsApp with the screenshot</li>
              <li>4. Wait for confirmation and balance update</li>
            </ol>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={openWhatsApp}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Proceed to WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}