import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Eye, Lock, UserCheck } from "lucide-react";

export default function Privacy() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: December 2024</p>
        </div>

        {/* Key Points */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Shield className="w-5 h-5 mr-2 text-green-600" />
                Data Protection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">We use industry-standard encryption to protect your personal information and payment details.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Eye className="w-5 h-5 mr-2 text-blue-600" />
                No Data Sharing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Your personal information is never shared with third parties without your explicit consent.</p>
            </CardContent>
          </Card>
        </div>

        {/* Privacy Policy Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Account Information</h3>
              <p className="text-gray-600">When you create an account, we collect your email address, name, and account preferences to provide our services.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Order Information</h3>
              <p className="text-gray-600">We collect Facebook URLs and service preferences to fulfill your orders. We do not store your Facebook login credentials.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Payment Information</h3>
              <p className="text-gray-600">Payment processing is handled securely through PayPal. We do not store your payment card details on our servers.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="w-5 h-5 mr-2" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Service Delivery</h3>
              <p className="text-gray-600">We use your information to process orders, deliver Facebook growth services, and provide customer support.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Account Management</h3>
              <p className="text-gray-600">Your information helps us manage your account, track order history, and maintain wallet balances.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Communication</h3>
              <p className="text-gray-600">We may send order updates, service notifications, and support responses to your registered email address.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="w-5 h-5 mr-2" />
              Your Rights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Access and Update</h3>
              <p className="text-gray-600">You can access and update your account information at any time through your account dashboard.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Data Deletion</h3>
              <p className="text-gray-600">You can request deletion of your account and associated data by contacting our support team.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Marketing Communications</h3>
              <p className="text-gray-600">You can opt out of marketing emails at any time using the unsubscribe link in our emails.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Data Security</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>• SSL encryption for all data transmission</li>
              <li>• Secure servers with regular security updates</li>
              <li>• Limited access to personal information on a need-to-know basis</li>
              <li>• Regular security audits and monitoring</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 font-medium">Email Support</p>
              <p className="text-blue-600">support@fbsocialboost.com</p>
              <p className="text-blue-600 text-sm mt-1">We'll respond within 24 hours</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}