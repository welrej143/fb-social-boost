import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Clock } from "lucide-react";

export default function Support() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Support Center</h1>
          <p className="text-gray-600">Get help with your Facebook growth services</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Us Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
                Contact Us
              </CardTitle>
              <CardDescription>
                Get in touch with our support team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-blue-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Email Support</h3>
                    <p className="text-gray-600">socialboostertool01@gmail.com</p>
                    <p className="text-sm text-gray-500">Response within 24 hours</p>
                  </div>
                </div>
                

                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Before contacting support:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Check our FAQ section below</li>
                    <li>• Include your order ID if applicable</li>
                    <li>• Describe the issue in detail</li>
                    <li>• Mention any error messages you've seen</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ and Contact Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">How long do orders take to complete?</h3>
                  <p className="text-gray-600">
                    Most orders are processed within 1-24 hours. Larger orders may take up to 72 hours for completion.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                  <p className="text-gray-600">
                    We accept PayPal payments and wallet balance payments for your convenience.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Are your services safe for my Facebook account?</h3>
                  <p className="text-gray-600">
                    Yes, all our services are delivered through safe and organic methods that comply with Facebook's terms of service.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Can I get a refund if I'm not satisfied?</h3>
                  <p className="text-gray-600">
                    We offer refunds in accordance with our refund policy. Please contact support for assistance.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-orange-600" />
                  Support Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Monday - Friday</h3>
                    <p className="text-gray-600">9:00 AM - 6:00 PM EST</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900">Saturday - Sunday</h3>
                    <p className="text-gray-600">10:00 AM - 4:00 PM EST</p>
                  </div>
                  
                  <div className="flex items-center mt-6 p-3 bg-blue-50 rounded-lg">
                    <MessageCircle className="w-5 h-5 text-blue-600 mr-2" />
                    <p className="text-sm text-gray-600">
                      <strong>socialboostertool01@gmail.com</strong>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}