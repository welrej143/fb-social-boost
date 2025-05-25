import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Users, CreditCard, AlertTriangle } from "lucide-react";

export default function Terms() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-600">Last updated: December 2024</p>
        </div>

        {/* Key Terms */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                User Agreement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">By using our services, you agree to these terms and confirm you own the Facebook accounts being promoted.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                Payment Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">All payments are processed securely. Orders begin processing immediately upon payment confirmation.</p>
            </CardContent>
          </Card>
        </div>

        {/* Terms Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Service Agreement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Service Description</h3>
              <p className="text-gray-600">FB Social Boost provides Facebook growth services including likes, followers, views, and reactions through our partner network. All services are delivered using high-quality, authentic-looking engagement.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Account Ownership</h3>
              <p className="text-gray-600">You must own or have explicit permission to promote the Facebook accounts, pages, or content you submit for our services. You are responsible for ensuring compliance with Facebook's terms of service.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Service Delivery</h3>
              <p className="text-gray-600">Orders typically begin within 15 minutes and complete within 1-24 hours. Delivery times may vary based on service type and order volume. We guarantee completion of paid orders.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Payment and Billing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Payment Processing</h3>
              <p className="text-gray-600">We accept PayPal payments and wallet top-ups. All transactions are processed securely and charges appear as "FB Social Boost" on your statement.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Wallet Credits</h3>
              <p className="text-gray-600">Wallet credits are non-refundable once added to your account but can be used for any of our services. Credits do not expire.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Order Processing</h3>
              <p className="text-gray-600">Orders are processed immediately upon payment confirmation. Once an order has started processing, it cannot be cancelled or modified.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>User Responsibilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Account Security</h3>
              <p className="text-gray-600">You are responsible for maintaining the security of your account credentials and for all activities that occur under your account.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Prohibited Use</h3>
              <p className="text-gray-600">Our services may not be used for illegal content, harassment, spam, or any activity that violates Facebook's community standards or applicable laws.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Content Compliance</h3>
              <p className="text-gray-600">All Facebook content promoted through our services must comply with Facebook's terms of service and community guidelines.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
              Limitations and Disclaimers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Service Availability</h3>
              <p className="text-gray-600">While we strive for 100% uptime, our services may occasionally be unavailable due to maintenance or technical issues. We are not liable for temporary service interruptions.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Third-Party Platform Changes</h3>
              <p className="text-gray-600">Facebook may change their algorithms or terms of service, which could affect service delivery. We adapt our methods accordingly but cannot guarantee immunity from platform changes.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Results Disclaimer</h3>
              <p className="text-gray-600">While we deliver the exact quantity of engagement ordered, we cannot guarantee specific business outcomes or organic growth beyond our services.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Questions about these Terms of Service? Contact our support team:
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 font-medium">Email Support</p>
              <p className="text-blue-600">support@fbsocialboost.com</p>
              <p className="text-blue-600 text-sm mt-1">Response within 24 hours</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}