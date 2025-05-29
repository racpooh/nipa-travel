'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/libs/api';
import { BookingForm } from '@/types';
import { FlightGenerator } from '@/libs/flight-generator';
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
  Cloud,
  RefreshCw
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

function CreateBookingContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [weatherPrediction, setWeatherPrediction] = useState<any>(null);
  const [showWeatherConfirmation, setShowWeatherConfirmation] = useState(false);
  const [pendingBookingData, setPendingBookingData] = useState<any>(null);
  const [autoGenerate, setAutoGenerate] = useState(true);

  const [formData, setFormData] = useState<BookingForm>({
    departure_location: '',
    destination_location: '',
    departure_latitude: 0,
    departure_longitude: 0,
    destination_latitude: 0,
    destination_longitude: 0,
    flight_number: '',
    departure_date: '',
    departure_time: '',
    arrival_date: '',
    arrival_time: '',
    seat_number: '',
    gate_number: '',
    ticket_price: 0
  });

  // Auto-generate when key fields change
  useEffect(() => {
    if (autoGenerate && 
        formData.departure_location && 
        formData.destination_location && 
        formData.departure_date && 
        formData.departure_time) {
      
      const generated = FlightGenerator.generateFlightDetails(
        formData.departure_location,
        formData.destination_location,
        formData.departure_date,
        formData.departure_time
      );

      setFormData(prev => ({
        ...prev,
        ...generated
      }));
    }
  }, [formData.departure_location, formData.destination_location, formData.departure_date, formData.departure_time, autoGenerate]);

  const handleAutoGenerate = () => {
    if (!formData.departure_location || !formData.destination_location || !formData.departure_date || !formData.departure_time) {
      setError('Please select departure location, destination, date, and time first');
      return;
    }

    const generated = FlightGenerator.generateFlightDetails(
      formData.departure_location,
      formData.destination_location,
      formData.departure_date,
      formData.departure_time
    );

    setFormData(prev => ({
      ...prev,
      ...generated
    }));

    // Clear error if generation was successful
    if (error) setError('');
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

  const validateForm = (): string | null => {
    if (!formData.departure_location) return 'Departure location is required';
    if (!formData.destination_location) return 'Destination location is required';
    if (!formData.flight_number) return 'Flight number is required';
    if (!formData.departure_date) return 'Departure date is required';
    if (!formData.departure_time) return 'Departure time is required';
    if (!formData.destination_latitude || !formData.destination_longitude) {
      return 'Please select a valid destination city for weather forecasting';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.createBooking(formData);
      
      if (response.success) {
        // Check if weather confirmation is needed
        if (response.data.requires_weather_confirmation) {
          setWeatherPrediction(response.data.weather_prediction);
          setPendingBookingData(response.data.booking);
          setShowWeatherConfirmation(true);
          setIsLoading(false);
        } else {
          // Booking created successfully, redirect to dashboard
          router.push('/dashboard');
        }
      } else {
        setError(response.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Create booking error:', error);
      setError('Failed to create booking. Please try again.');
    } finally {
      if (!showWeatherConfirmation) {
        setIsLoading(false);
      }
    }
  };

  const handleWeatherConfirmation = async (confirmed: boolean) => {
    try {
      setIsLoading(true);
      
      if (confirmed) {
        // Confirm booking despite weather
        await apiClient.confirmBookingWithWeather({
          booking_id: pendingBookingData.id,
          weather_confirmed: true,
          weather_forecast: weatherPrediction.prediction
        });
        router.push('/dashboard');
      } else {
        // Cancel booking due to weather
        await apiClient.deleteBooking(pendingBookingData.id);
        setShowWeatherConfirmation(false);
        setPendingBookingData(null);
        setWeatherPrediction(null);
        setError('Booking cancelled due to weather concerns');
      }
    } catch (error) {
      console.error('Weather confirmation error:', error);
      setError('Failed to process weather confirmation');
    } finally {
      setIsLoading(false);
    }
  };

  // Weather Confirmation Modal
  if (showWeatherConfirmation && weatherPrediction) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-6">
          <div className="text-center mb-6">
            <Cloud className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Weather Alert!</h2>
            <p className="text-gray-600">We've detected potentially challenging weather conditions</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="font-medium text-yellow-800">
                Weather Forecast: {weatherPrediction.prediction}
              </span>
            </div>
            <p className="text-sm text-yellow-700 mb-2">
              Confidence: {weatherPrediction.confidence}%
            </p>
            <p className="text-sm text-gray-700">
              {weatherPrediction.recommendation}
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => handleWeatherConfirmation(true)}
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Continue Booking'}
            </button>
            <button
              onClick={() => handleWeatherConfirmation(false)}
              disabled={isLoading}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Cancel Booking
            </button>
          </div>
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
        <h1 className="text-3xl font-bold text-gray-900">Create New Booking</h1>
        <p className="mt-2 text-gray-600">Fill in your flight details to create a new booking</p>
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

          {/* Route Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Departure Location *
              </label>
              <select
                name="departure_location"
                value={formData.departure_location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
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
                Destination Location *
              </label>
              <select
                name="destination_location"
                value={formData.destination_location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Departure Date *
              </label>
              <input
                type="date"
                name="departure_date"
                value={formData.departure_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                Departure Time *
              </label>
              <input
                type="time"
                name="departure_time"
                value={formData.departure_time}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Auto-Generation Toggle */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoGenerate"
                  checked={autoGenerate}
                  onChange={(e) => setAutoGenerate(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autoGenerate" className="ml-2 text-sm font-medium text-blue-800">
                  Auto-generate realistic flight details
                </label>
              </div>
              <button
                type="button"
                onClick={handleAutoGenerate}
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors flex items-center"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Generate Now
              </button>
            </div>
            <p className="text-sm text-blue-600">
              Automatically generates flight number, ticket price, seat number, gate number, and arrival time based on real Thailand flight patterns.
            </p>
          </div>

          {/* Flight Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Plane className="inline h-4 w-4 mr-1" />
                Flight Number {autoGenerate && <span className="text-blue-600 text-xs">(Auto)</span>} *
              </label>
              <input
                type="text"
                name="flight_number"
                value={formData.flight_number}
                onChange={handleChange}
                placeholder="e.g., TG1234"
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${autoGenerate ? 'bg-blue-50' : ''}`}
                readOnly={autoGenerate}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CreditCard className="inline h-4 w-4 mr-1" />
                Ticket Price (฿) {autoGenerate && <span className="text-blue-600 text-xs">(Auto)</span>}
              </label>
              <input
                type="number"
                name="ticket_price"
                value={formData.ticket_price || ''}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${autoGenerate ? 'bg-blue-50' : ''}`}
                readOnly={autoGenerate}
              />
            </div>
          </div>

          {/* Arrival Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Arrival Date {autoGenerate && <span className="text-blue-600 text-xs">(Auto)</span>}
              </label>
              <input
                type="date"
                name="arrival_date"
                value={formData.arrival_date}
                onChange={handleChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${autoGenerate ? 'bg-blue-50' : ''}`}
                readOnly={autoGenerate}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                Arrival Time {autoGenerate && <span className="text-blue-600 text-xs">(Auto)</span>}
              </label>
              <input
                type="time"
                name="arrival_time"
                value={formData.arrival_time}
                onChange={handleChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${autoGenerate ? 'bg-blue-50' : ''}`}
                readOnly={autoGenerate}
              />
            </div>
          </div>

          {/* Seat and Gate Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Seat Number {autoGenerate && <span className="text-blue-600 text-xs">(Auto)</span>}
              </label>
              <input
                type="text"
                name="seat_number"
                value={formData.seat_number}
                onChange={handleChange}
                placeholder="e.g., 12A"
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${autoGenerate ? 'bg-blue-50' : ''}`}
                readOnly={autoGenerate}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Gate Number {autoGenerate && <span className="text-blue-600 text-xs">(Auto)</span>}
              </label>
              <input
                type="text"
                name="gate_number"
                value={formData.gate_number}
                onChange={handleChange}
                placeholder="e.g., B7"
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${autoGenerate ? 'bg-blue-50' : ''}`}
                readOnly={autoGenerate}
              />
            </div>
          </div>

          {/* AI Weather Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <Cloud className="h-5 w-5 text-green-500 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-800">AI Weather Forecasting</p>
                <p className="text-sm text-green-600">
                  Our AI will automatically predict the weather for your destination and alert you if conditions may affect your travel plans.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/dashboard"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <Plane className="mr-2 h-4 w-4" />
                  Create Booking
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateBookingPage() {
  return (
    <ProtectedRoute>
      <CreateBookingContent />
    </ProtectedRoute>
  );
}