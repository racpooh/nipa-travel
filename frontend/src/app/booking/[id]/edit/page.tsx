'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/libs/api';
import { Booking, BookingForm } from '@/types';
import { useAuth } from '@/libs/auth-context';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plane, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  CreditCard,
  AlertCircle,
  Save
} from 'lucide-react';
import ProtectedRoute from '@/components/protected-route';

// Thailand cities with coordinates
const THAILAND_CITIES = [
  { name: 'Bangkok (BKK)', lat: 13.6900, lng: 100.7501 },
  { name: 'Bangkok (DMK)', lat: 13.9126, lng: 100.6067 },
  { name: 'Chiang Mai (CNX)', lat: 18.7669, lng: 98.962 },
  { name: 'Phuket (HKT)', lat: 8.1132, lng: 98.3162 },
  { name: 'Pattaya', lat: 12.9236, lng: 100.8825 },
  { name: 'Krabi (KRB)', lat: 8.0992, lng: 98.9862 },
  { name: 'Koh Samui (USM)', lat: 9.4980, lng: 99.9386 },
  { name: 'Hua Hin', lat: 12.5706, lng: 99.9587 },
  { name: 'Chiang Rai', lat: 19.9105, lng: 99.8406 }
];

function EditBookingContent() {
  const params = useParams();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<Partial<BookingForm>>({});

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
        const bookingData = response.data.booking;
        setBooking(bookingData ?? null);
        
        // Convert booking to form data format
        setFormData({
          departure_location: bookingData?.departure_location ?? '',
          destination_location: bookingData?.destination_location ?? '',
          departure_latitude: bookingData?.departure_latitude ?? 0,
          departure_longitude: bookingData?.departure_longitude ?? 0,
          destination_latitude: bookingData?.destination_latitude ?? 0,
          destination_longitude: bookingData?.destination_longitude ?? 0,
          flight_number: bookingData?.flight_number ?? '',
          departure_date: bookingData?.departure_date ?? '',
          departure_time: bookingData?.departure_time ?? '',
          arrival_date: bookingData?.arrival_date ?? '',
          arrival_time: bookingData?.arrival_time ?? '',
          seat_number: bookingData?.seat_number ?? '',
          gate_number: bookingData?.gate_number ?? '',
          ticket_price: bookingData?.ticket_price ?? 0
        });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle city selection with coordinates
    if (name === 'departure_location' || name === 'destination_location') {
      const selectedCity = THAILAND_CITIES.find(city => city.name === value);
      if (selectedCity) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          [`${name.split('_')[0]}_latitude`]: selectedCity.lat,
          [`${name.split('_')[0]}_longitude`]: selectedCity.lng
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'ticket_price' ? parseFloat(value) || 0 : value
      }));
    }

    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, booking_status: e.target.value as 'pending' | 'confirmed' | 'cancelled' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!booking) return;

    setIsSaving(true);
    setError('');

    try {
      // Prepare update data (only changed fields)
      const updateData: any = {};
      
      Object.keys(formData).forEach(key => {
        const formValue = formData[key as keyof typeof formData];
        const originalValue = booking[key as keyof Booking];
        
        if (formValue !== originalValue) {
          updateData[key] = formValue;
        }
      });

      if (Object.keys(updateData).length === 0) {
        setError('No changes detected');
        setIsSaving(false);
        return;
      }

      const response = await apiClient.updateBooking(booking.id, updateData);
      
      if (response.success) {
        router.push(`/booking/${booking.id}`);
      } else {
        setError(response.message || 'Failed to update booking');
      }
    } catch (error) {
      console.error('Update booking error:', error);
      setError('Failed to update booking. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <Plane className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
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
        <Link href={`/booking/${booking?.id}`} className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Booking Details
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Booking</h1>
        <p className="mt-2 text-gray-600">Update your flight details</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Flight Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Plane className="inline h-4 w-4 mr-1" />
                Flight Number
              </label>
              <input
                type="text"
                name="flight_number"
                value={formData.flight_number || ''}
                onChange={handleChange}
                placeholder="e.g., TG1234"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CreditCard className="inline h-4 w-4 mr-1" />
                Ticket Price (฿)
              </label>
              <input
                type="number"
                name="ticket_price"
                value={formData.ticket_price || ''}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Route Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Departure Location
              </label>
              <select
                name="departure_location"
                value={formData.departure_location || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select departure city</option>
                {THAILAND_CITIES.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Destination Location
              </label>
              <select
                name="destination_location"
                value={formData.destination_location || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select destination city</option>
                {THAILAND_CITIES.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Departure Date
              </label>
              <input
                type="date"
                name="departure_date"
                value={formData.departure_date || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                Departure Time
              </label>
              <input
                type="time"
                name="departure_time"
                value={formData.departure_time || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Arrival Date
              </label>
              <input
                type="date"
                name="arrival_date"
                value={formData.arrival_date || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                Arrival Time
              </label>
              <input
                type="time"
                name="arrival_time"
                value={formData.arrival_time || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Seat and Gate Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Seat Number
              </label>
              <input
                type="text"
                name="seat_number"
                value={formData.seat_number || ''}
                onChange={handleChange}
                placeholder="e.g., 12A"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Gate Number
              </label>
              <input
                type="text"
                name="gate_number"
                value={formData.gate_number || ''}
                onChange={handleChange}
                placeholder="e.g., B7"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Admin Only: Booking Status */}
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking Status (Admin Only)
              </label>
              <select
                name="booking_status"
                value={(formData as any).booking_status || booking?.booking_status || 'pending'}
                onChange={handleStatusChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Link
              href={`/booking/${booking?.id}`}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditBookingPage() {
  return (
    <ProtectedRoute>
      <EditBookingContent />
    </ProtectedRoute>
  );
}