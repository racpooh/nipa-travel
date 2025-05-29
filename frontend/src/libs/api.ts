import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  AuthResponse, 
  BookingResponse, 
  WeatherResponse, 
  LoginForm, 
  RegisterForm, 
  BookingForm,
  ApiResponse 
} from '@/types';

class ApiClient {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.removeToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Token management
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  private removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  }

  // Auth API methods
  async login(credentials: LoginForm): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/api/auth/login', credentials);
    if (response.data.success && response.data.data.token) {
      this.setToken(response.data.data.token);
      localStorage.setItem('user_data', JSON.stringify(response.data.data.user));
    }
    return response.data;
  }

  async register(userData: RegisterForm): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/api/auth/register', userData);
    if (response.data.success && response.data.data.token) {
      this.setToken(response.data.data.token);
      localStorage.setItem('user_data', JSON.stringify(response.data.data.user));
    }
    return response.data;
  }

  async logout(): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> = await this.api.post('/api/auth/logout');
      this.removeToken();
      return response.data;
    } catch (error) {
      this.removeToken();
      throw error;
    }
  }

  async getProfile(): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.get('/api/auth/profile');
    return response.data;
  }

  // Booking API methods
  async createBooking(bookingData: BookingForm): Promise<BookingResponse> {
    const response: AxiosResponse<BookingResponse> = await this.api.post('/api/bookings', bookingData);
    return response.data;
  }

  async getUserBookings(): Promise<BookingResponse> {
    const response: AxiosResponse<BookingResponse> = await this.api.get('/api/bookings');
    return response.data;
  }

  async getAllBookings(): Promise<BookingResponse> {
    const response: AxiosResponse<BookingResponse> = await this.api.get('/api/bookings/all');
    return response.data;
  }

  async getBookingById(id: number): Promise<BookingResponse> {
    const response: AxiosResponse<BookingResponse> = await this.api.get(`/api/bookings/${id}`);
    return response.data;
  }

  async updateBooking(id: number, updates: Partial<BookingForm>): Promise<BookingResponse> {
    const response: AxiosResponse<BookingResponse> = await this.api.put(`/api/bookings/${id}`, updates);
    return response.data;
  }

  async deleteBooking(id: number): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.delete(`/api/bookings/${id}`);
    return response.data;
  }

  // Weather API methods
  async getWeatherForecast(params: {
    destination?: string;
    latitude?: number;
    longitude?: number;
    departure_date: string;
  }): Promise<WeatherResponse> {
    const response: AxiosResponse<WeatherResponse> = await this.api.get('/api/weather/forecast', { params });
    return response.data;
  }

  async confirmBookingWithWeather(data: {
    booking_id: number;
    weather_confirmed: boolean;
    weather_forecast?: string;
  }): Promise<BookingResponse> {
    const response: AxiosResponse<BookingResponse> = await this.api.post('/api/weather/confirm-booking', data);
    return response.data;
  }

  async getCityCoordinates(city: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.get(`/api/weather/city/${city}`);
    return response.data;
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser() {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;