// User types
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface AuthResponse {
  message: string;
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

// Booking types
export interface Booking {
  id: number;
  user_id: number;
  departure_location: string;
  destination_location: string;
  departure_latitude?: number;
  departure_longitude?: number;
  destination_latitude: number;
  destination_longitude: number;
  flight_number: string;
  departure_date: string;
  departure_time: string;
  arrival_date?: string;
  arrival_time?: string;
  seat_number?: string;
  gate_number?: string;
  ticket_price?: number;
  weather_forecast?: 'Sunny' | 'Cloudy' | 'Rainy' | 'Normal';
  weather_confirmed?: boolean;
  booking_status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  updated_at: string;
  username?: string;
}

export interface BookingForm {
  departure_location: string;
  destination_location: string;
  departure_latitude?: number;
  departure_longitude?: number;
  destination_latitude: number;
  destination_longitude: number;
  flight_number: string;
  departure_date: string;
  departure_time: string;
  arrival_date?: string;
  arrival_time?: string;
  seat_number?: string;
  gate_number?: string;
  ticket_price?: number;
  booking_status?: 'pending' | 'confirmed' | 'cancelled'; // Add this for admin
}

export interface BookingResponse {
  message: string;
  success: boolean;
  data: {
    booking?: Booking;
    bookings?: Booking[];
    total_bookings?: number;
    weather_prediction?: WeatherPrediction;
    requires_weather_confirmation?: boolean;
  };
}

// Weather types
export interface WeatherPrediction {
  prediction: 'Sunny' | 'Cloudy' | 'Rainy' | 'Normal';
  confidence: number;
  factors: {
    location: string;
    season: string;
    climate_zone: string;
    base_score: string;
    final_score: string;
  };
  recommendation: string;
  requires_confirmation: boolean;
}

export interface WeatherResponse {
  message: string;
  success: boolean;
  data: {
    location: {
      name: string;
      coordinates: {
        latitude: number;
        longitude: number;
      };
    };
    departure_date: string;
    forecast: WeatherPrediction;
    timestamp: string;
  };
}

// Form types
export interface LoginForm {
  username: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface BookingForm {
  departure_location: string;
  destination_location: string;
  departure_latitude?: number;
  departure_longitude?: number;
  destination_latitude: number;
  destination_longitude: number;
  flight_number: string;
  departure_date: string;
  departure_time: string;
  arrival_date?: string;
  arrival_time?: string;
  seat_number?: string;
  gate_number?: string;
  ticket_price?: number;
}

// API Response types
export interface ApiResponse<T = any> {
  message: string;
  success: boolean;
  data?: T;
  error?: string;
}