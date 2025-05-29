'use client';

import { useAuth } from '@/libs/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Cloud, Users, Shield, ArrowRight, Star } from 'lucide-react';
import Footer from '@/components/footer';

export default function Welcome() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <section 
        className="relative min-h-screen flex items-center justify-center"
        style={{
          // Replace this with your image path
          backgroundImage: "url('/images/thailand-hero-bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Dark Overlay for Better Text Readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Discover Thailand
            <span className="block text-blue-300">with NIPA Trip</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
            Book your flights with AI-powered weather forecasting. 
            <span className="block mt-2">Never be surprised by the weather again!</span>
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link
              href="/register"
              className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 flex items-center justify-center"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300"
            >
              Sign In
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm opacity-90">
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-400 mr-1" />
              <span>Trusted by 10,000+ travelers</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-white rounded-full"></div>
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-green-400 mr-1" />
              <span>100% Secure Booking</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose NIPA Trip?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We combine smart technology with local expertise to give you the best travel experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group text-center p-8 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <div className="bg-blue-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <Cloud className="h-12 w-12 text-blue-600 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">AI Weather Forecasting</h3>
              <p className="text-gray-600 leading-relaxed">
                Get accurate weather predictions for your destination with our advanced AI-powered system 
                trained specifically for Thailand's climate patterns.
              </p>
            </div>
            
            <div className="group text-center p-8 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                <Users className="h-12 w-12 text-green-600 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Easy Booking Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Create, update, and manage your flight bookings with our intuitive interface. 
                Track all your trips in one convenient dashboard.
              </p>
            </div>
            
            <div className="group text-center p-8 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <div className="bg-purple-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 group-hover:bg-purple-200 transition-colors">
                <Shield className="h-12 w-12 text-purple-600 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Secure & Reliable</h3>
              <p className="text-gray-600 leading-relaxed">
                Your data is protected with industry-standard security measures. 
                Enjoy peace of mind with our reliable and trusted platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Travel Smarter with Weather Intelligence
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                NIPA Trip revolutionizes travel planning by integrating artificial intelligence 
                with weather forecasting. Our system analyzes Thailand's unique climate patterns 
                to help you make informed decisions about your travel dates.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Whether you're planning a beach vacation in Phuket or exploring the cultural 
                treasures of Chiang Mai, our AI ensures you're prepared for the weather conditions 
                you'll encounter.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-colors"
              >
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            <div className="lg:pl-8">
              <div 
                className="rounded-xl shadow-2xl h-96 bg-cover bg-center"
                style={{
                  // Replace with your about section image
                  backgroundImage: "url('/images/thailand-about-bg.jpg')"
                }}
              >
                {/* You can add content overlay here if needed */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Thailand Adventure?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of travelers who trust NIPA Trip for their Thailand journeys.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
          >
            Create Your Account
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}