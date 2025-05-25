import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, MessageCircle, Clock, Shield } from "lucide-react";

export default function Help() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Help Center</h1>
          <p className="text-gray-600">Find answers to common questions and get support</p>
        </div>

        {/* Quick Actions */}
        <div className="max-w-md mx-auto mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
                Need Support?
              </CardTitle>
              <CardDescription>
                Get help with your orders or account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.href = '/support'} className="w-full">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="w-5 h-5 mr-2" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How long does it take to deliver orders?</h3>
              <p className="text-gray-600">Most orders start processing within 15 minutes and complete within 1-24 hours depending on the service and quantity.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Are your services safe for my Facebook account?</h3>
              <p className="text-gray-600">Yes, we use high-quality, real-looking engagement that complies with Facebook's terms of service. All our services are safe and secure.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">We accept PayPal payments and wallet top-ups. All transactions are secure and encrypted.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I get a refund if I'm not satisfied?</h3>
              <p className="text-gray-600">We offer refunds for incomplete orders. Please contact support within 24 hours if you experience any issues.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What if my order doesn't start or complete?</h3>
              <p className="text-gray-600">If your order doesn't start within 24 hours or doesn't complete properly, contact our support team for immediate assistance.</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              Still Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Our support team is here to help you with any questions or issues. We typically respond within 24 hours.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 font-medium">Email Support</p>
              <p className="text-blue-600">support@fbsocialboost.com</p>
              <p className="text-blue-600 text-sm mt-1">Response time: Within 24 hours</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}