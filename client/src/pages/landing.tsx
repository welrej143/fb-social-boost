import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Users, TrendingUp, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Facebook Boost Pro</h1>
          </div>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Sign In
          </Button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Boost Your Facebook Presence
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Professional Facebook engagement services to grow your page likes, followers, post engagement, and video views. 
            Safe, reliable, and fast delivery.
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
          >
            Get Started Now
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Facebook Page Likes</CardTitle>
              <CardDescription>
                Grow your page with real, engaged followers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />High quality likes</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Fast delivery</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Safe & secure</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Post Engagement</CardTitle>
              <CardDescription>
                Boost your posts with likes and reactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Instant engagement</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Natural looking</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Affordable prices</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Video Views</CardTitle>
              <CardDescription>
                Increase visibility with authentic video views
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Real video views</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />24/7 support</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Money back guarantee</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Services Preview */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Our Facebook Services
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Facebook Page Likes", description: "Grow your page audience" },
              { name: "Facebook Page Followers", description: "Increase follower count" },
              { name: "Profile Followers", description: "Boost personal profile" },
              { name: "Post Likes", description: "Enhance post engagement" },
              { name: "Post Reactions", description: "Get hearts, wows, and more" },
              { name: "Video Views", description: "Increase video visibility" }
            ].map((service, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-gray-900 mb-2">{service.name}</h4>
                <p className="text-gray-600 text-sm">{service.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-blue-600 text-white rounded-lg p-12">
          <h3 className="text-3xl font-bold mb-4">Ready to Boost Your Facebook?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of satisfied customers who trust our services
          </p>
          <Button 
            size="lg"
            variant="secondary"
            onClick={() => window.location.href = '/api/login'}
            className="text-lg px-8 py-3"
          >
            Sign In to Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}