import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DollarSign, Clock, CheckCircle, AlertCircle } from "lucide-react";

export default function Refund() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Refund Policy</h1>
          <p className="text-gray-600">Last updated: December 2024</p>
        </div>

        {/* Quick Reference */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                24-Hour Window
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Contact support within 24 hours of your order for refund eligibility.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Guaranteed Refunds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Full refunds for orders that don't start or complete as promised.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <DollarSign className="w-5 h-5 mr-2 text-purple-600" />
                Processing Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Approved refunds are processed within 3-5 business days.</p>
            </CardContent>
          </Card>
        </div>

        {/* Refund Eligibility */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              When You're Eligible for a Refund
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Order Never Started</h3>
              <p className="text-gray-600">If your order doesn't begin processing within 24 hours of payment confirmation, you're eligible for a full refund.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Incomplete Delivery</h3>
              <p className="text-gray-600">If your order starts but doesn't complete the promised quantity within the expected timeframe, we'll either complete the order or provide a partial refund.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Technical Issues</h3>
              <p className="text-gray-600">If technical problems on our end prevent proper service delivery, you'll receive a full refund or service credit.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Invalid Target</h3>
              <p className="text-gray-600">If the Facebook URL you provided is invalid or inaccessible, preventing service delivery, you're eligible for a full refund.</p>
            </div>
          </CardContent>
        </Card>

        {/* Non-Refundable Situations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
              Non-Refundable Situations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Completed Orders</h3>
              <p className="text-gray-600">Orders that have been successfully completed as specified are not eligible for refunds.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Changed Mind</h3>
              <p className="text-gray-600">Refunds are not provided for orders you no longer want after they've started processing.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Platform Changes</h3>
              <p className="text-gray-600">We cannot refund orders affected by changes to Facebook's algorithms or policies beyond our control.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Wallet Credits</h3>
              <p className="text-gray-600">Funds added to your wallet are non-refundable but can be used for any future orders on our platform.</p>
            </div>
          </CardContent>
        </Card>

        {/* Refund Process */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How to Request a Refund</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Step 1: Contact Support</h3>
              <p className="text-gray-600">Email our support team at support@fbsocialboost.com within 24 hours of your order. Include your order ID and reason for the refund request.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Step 2: Review Process</h3>
              <p className="text-gray-600">Our team will review your order status and determine eligibility based on our refund policy. This typically takes 1-2 business days.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Step 3: Refund Processing</h3>
              <p className="text-gray-600">If approved, refunds are processed back to your original payment method within 3-5 business days. You'll receive a confirmation email.</p>
            </div>
          </CardContent>
        </Card>

        {/* Alternative Solutions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Alternative Solutions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Service Credits</h3>
              <p className="text-gray-600">Instead of a refund, we may offer service credits equal to the order value for future use on our platform.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Order Retry</h3>
              <p className="text-gray-600">For failed orders, we often can retry the service at no additional cost before considering a refund.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Partial Completion</h3>
              <p className="text-gray-600">If an order partially completes, you'll only be charged for the delivered portion, with the remainder refunded.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Questions about refunds or need to request one? Our support team is here to help:
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 font-medium">Email Support</p>
              <p className="text-blue-600">support@fbsocialboost.com</p>
              <p className="text-blue-600 text-sm mt-1">Include your order ID for faster processing</p>
            </div>
            <div className="mt-4">
              <Button onClick={() => window.location.href = '/support'} className="w-full md:w-auto">
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}