'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/libs/api';
import { Booking } from '@/types';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plane, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  CreditCard,
  Edit,
  Trash2,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow
} from 'lucide-react';
import ProtectedRoute from '@/components/protected-route';

function BookingDetailContent() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchBooking(Number(params.id));
    }
  }, [params.id]);

  const fetchBooking = async (id: number) => {
    try {
      setIsLoading(true);
      const response = await apiClient.getBookingById(id);
      
      if (response.success) {
        setBooking(response.data.booking ?? null);
      } else {
        setError(response.message || 'Booking not found');
      }
    } catch (error) {
      console.error('Fetch booking error:', error);
      setError('Failed to load booking details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBooking = async () => {
    if (!booking || !window.confirm('Are you sure you want to delete this booking?')) {
      return;
    }

    try {
      await apiClient.deleteBooking(booking.id);
      router.push('/dashboard');
    } catch (error) {
      console.error('Delete booking error:', error);
      alert('Failed to delete booking');
    }
  };

  const getWeatherIcon = (weather?: string) => {
    switch (weather) {
      case 'Sunny': return <Sun className="h-6 w-6 text-yellow-500" />;
      case 'Cloudy': return <Cloud className="h-6 w-6 text-gray-500" />;
      case 'Rainy': return <CloudRain className="h-6 w-6 text-blue-500" />;
      default: return <CloudSnow className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'Not specified';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <Plane className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The booking you\'re looking for doesn\'t exist.'}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
            <p className="mt-2 text-gray-600">Flight {booking.flight_number}</p>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusBadge(booking.booking_status)}
            <Link
              href={`/booking/${booking.id}/edit`}
              className="inline-flex items-center px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Link>
            <button
              onClick={handleDeleteBooking}
              className="inline-flex items-center px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Booking Details */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-blue-50 border-b">
          <div className="flex items-center">
            <Plane className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{booking.flight_number}</h2>
              <p className="text-gray-600">
                {booking.departure_location} → {booking.destination_location}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Flight Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Flight Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Route</p>
                    <p className="font-medium">{booking.departure_location} → {booking.destination_location}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Departure Date</p>
                    <p className="font-medium">{formatDate(booking.departure_date)}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-medium">
                      {formatTime(booking.departure_time)}
                      {booking.arrival_time && ` - ${formatTime(booking.arrival_time)}`}
                    </p>
                  </div>
                </div>

                {booking.ticket_price && (
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Ticket Price</p>
                      <p className="font-medium">฿{booking.ticket_price.toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Seat & Additional Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Details</h3>
              
              <div className="space-y-4">
                {booking.seat_number && (
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Seat Number</p>
                      <p className="font-medium">{booking.seat_number}</p>
                    </div>
                  </div>
                )}

                {booking.gate_number && (
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Gate Number</p>
                      <p className="font-medium">{booking.gate_number}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  {getWeatherIcon(booking.weather_forecast)}
                  <div className="ml-3">
                    <p className="text-sm text-gray-500">Weather Forecast</p>
                    <p className="font-medium">{booking.weather_forecast || 'Not available'}</p>
                  </div>
                </div>

                {booking.username && (
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Booked by</p>
                      <p className="font-medium">{booking.username}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <span className="font-medium">Created:</span> {new Date(booking.created_at).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span> {new Date(booking.updated_at).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingDetailPage() {
  return (
    <ProtectedRoute>
      <BookingDetailContent />
    </ProtectedRoute>
  );
}