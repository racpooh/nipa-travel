// Flight data generator based on real Thailand aviation patterns

interface FlightRoute {
  departure: string;
  destination: string;
  basePrice: number;
  airlines: string[];
  duration: number; // in minutes
}

// Real Thailand flight routes with typical pricing
const THAILAND_ROUTES: FlightRoute[] = [
  // Bangkok routes
  { departure: 'Bangkok (BKK)', destination: 'Chiang Mai (CNX)', basePrice: 2500, airlines: ['TG', 'WE', 'FD'], duration: 80 },
  { departure: 'Bangkok (BKK)', destination: 'Phuket (HKT)', basePrice: 3200, airlines: ['TG', 'WE', 'PG'], duration: 85 },
  { departure: 'Bangkok (BKK)', destination: 'Krabi (KRB)', basePrice: 3500, airlines: ['TG', 'WE', 'AK'], duration: 90 },
  { departure: 'Bangkok (BKK)', destination: 'Koh Samui (USM)', basePrice: 4200, airlines: ['PG', 'WE'], duration: 75 },
  { departure: 'Bangkok (DMK)', destination: 'Chiang Mai (CNX)', basePrice: 2200, airlines: ['FD', 'WE', 'AK'], duration: 80 },
  { departure: 'Bangkok (DMK)', destination: 'Phuket (HKT)', basePrice: 2800, airlines: ['FD', 'WE', 'AK'], duration: 85 },
  
  // Reverse routes
  { departure: 'Chiang Mai (CNX)', destination: 'Bangkok (BKK)', basePrice: 2500, airlines: ['TG', 'WE', 'FD'], duration: 80 },
  { departure: 'Phuket (HKT)', destination: 'Bangkok (BKK)', basePrice: 3200, airlines: ['TG', 'WE', 'PG'], duration: 85 },
  { departure: 'Krabi (KRB)', destination: 'Bangkok (BKK)', basePrice: 3500, airlines: ['TG', 'WE', 'AK'], duration: 90 },
  { departure: 'Koh Samui (USM)', destination: 'Bangkok (BKK)', basePrice: 4200, airlines: ['PG', 'WE'], duration: 75 },
  
  // Inter-regional routes
  { departure: 'Chiang Mai (CNX)', destination: 'Phuket (HKT)', basePrice: 4800, airlines: ['TG', 'WE'], duration: 120 },
  { departure: 'Phuket (HKT)', destination: 'Chiang Mai (CNX)', basePrice: 4800, airlines: ['TG', 'WE'], duration: 120 },
  { departure: 'Phuket (HKT)', destination: 'Koh Samui (USM)', basePrice: 3800, airlines: ['PG'], duration: 45 },
  { departure: 'Koh Samui (USM)', destination: 'Phuket (HKT)', basePrice: 3800, airlines: ['PG'], duration: 45 }
];

// Airline codes and their flight number patterns
type AirlineCode = 'TG' | 'WE' | 'FD' | 'PG' | 'AK';
const AIRLINE_PATTERNS: Record<AirlineCode, { name: string; range: number[]; prefix: string }> = {
  'TG': { name: 'Thai Airways', range: [100, 999], prefix: 'TG' },      // TG100-TG999
  'WE': { name: 'Thai Smile', range: [200, 999], prefix: 'WE' },       // WE200-WE999
  'FD': { name: 'Thai AirAsia', range: [3000, 4999], prefix: 'FD' },   // FD3000-FD4999
  'PG': { name: 'Bangkok Airways', range: [100, 399], prefix: 'PG' },   // PG100-PG399
  'AK': { name: 'AirAsia', range: [800, 999], prefix: 'AK' }           // AK800-AK999
};

// Airport gate configurations
const AIRPORT_GATES: { [key: string]: string[] } = {
  'Bangkok (BKK)': ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4', 'D1', 'D2', 'D3', 'D4', 'E1', 'E2', 'F1', 'F2', 'G1', 'G2'],
  'Bangkok (DMK)': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  'Chiang Mai (CNX)': ['1', '2', '3', '4', '5', '6', '7', '8'],
  'Phuket (HKT)': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  'Krabi (KRB)': ['1', '2', '3', '4'],
  'Koh Samui (USM)': ['1', '2', '3', '4', '5', '6'],
  'Pattaya': ['1', '2', '3', '4'],
  'Hua Hin': ['1', '2', '3'],
  'Chiang Rai': ['1', '2', '3', '4']
};

// Aircraft seat configurations
const SEAT_CONFIGURATIONS = {
  // Small aircraft (ATR, regional jets)
  small: {
    rows: { min: 10, max: 20 },
    seatsPerRow: ['A', 'B', 'C', 'D'],
    probability: 0.2
  },
  // Medium aircraft (A320, 737)
  medium: {
    rows: { min: 15, max: 35 },
    seatsPerRow: ['A', 'B', 'C', 'D', 'E', 'F'],
    probability: 0.6
  },
  // Large aircraft (A330, 777)
  large: {
    rows: { min: 25, max: 50 },
    seatsPerRow: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'],
    probability: 0.2
  }
};

export class FlightGenerator {
  
  // Generate realistic flight number
  static generateFlightNumber(departure: string, destination: string): string {
    const route = THAILAND_ROUTES.find(r => 
      r.departure === departure && r.destination === destination
    );
    
    if (!route) {
      const airlines: AirlineCode[] = ['TG', 'WE', 'FD'];
      const airline = airlines[Math.floor(Math.random() * airlines.length)];
      const pattern = AIRLINE_PATTERNS[airline];
      const number = Math.floor(Math.random() * (pattern.range[1] - pattern.range[0] + 1)) + pattern.range[0];
      return `${pattern.prefix}${number}`;
      return `${pattern.prefix}${number}`;
    }
    // Select random airline from route's airlines
    const airline = route.airlines[Math.floor(Math.random() * route.airlines.length)] as AirlineCode;
    const pattern = AIRLINE_PATTERNS[airline];
    const number = Math.floor(Math.random() * (pattern.range[1] - pattern.range[0] + 1)) + pattern.range[0];
    
    return `${pattern.prefix}${number}`;
    return `${pattern.prefix}${number}`;
  }
  
  // Generate realistic ticket price
  static generateTicketPrice(departure: string, destination: string, departureDate: string): number {
    const route = THAILAND_ROUTES.find(r => 
      r.departure === departure && r.destination === destination
    );
    
    let basePrice = route?.basePrice || 2500; // Default price
    
    // Price variations based on factors
    const date = new Date(departureDate);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = this.isThaiHoliday(date);
    
    // Weekend premium
    if (isWeekend) {
      basePrice *= 1.15;
    }
    
    // Holiday premium
    if (isHoliday) {
      basePrice *= 1.25;
    }
    
    // Time of year adjustment
    const month = date.getMonth() + 1;
    if (month >= 11 && month <= 2) {
      // High season (cool season)
      basePrice *= 1.2;
    } else if (month >= 6 && month <= 10) {
      // Low season (rainy season)
      basePrice *= 0.9;
    }
    
    // Random variation (±15%)
    const variation = (Math.random() - 0.5) * 0.3;
    basePrice *= (1 + variation);
    
    // Round to nearest 50
    return Math.round(basePrice / 50) * 50;
  }
  
  // Generate realistic seat number
  static generateSeatNumber(): string {
    const configs = Object.values(SEAT_CONFIGURATIONS);
    let selectedConfig;
    
    // Select aircraft type based on probability
    const rand = Math.random();
    let cumulative = 0;
    
    for (const config of configs) {
      cumulative += config.probability;
      if (rand <= cumulative) {
        selectedConfig = config;
        break;
      }
    }
    
    if (!selectedConfig) {
      selectedConfig = SEAT_CONFIGURATIONS.medium; // fallback
    }
    
    // Generate seat number
    const row = Math.floor(Math.random() * (selectedConfig.rows.max - selectedConfig.rows.min + 1)) + selectedConfig.rows.min;
    const seatLetter = selectedConfig.seatsPerRow[Math.floor(Math.random() * selectedConfig.seatsPerRow.length)];
    
    return `${row}${seatLetter}`;
  }
  
  // Generate realistic gate number
  static generateGateNumber(airport: string): string {
    const gates = AIRPORT_GATES[airport] || ['1', '2', '3', '4', '5'];
    return gates[Math.floor(Math.random() * gates.length)];
  }
  
  // Calculate arrival time based on departure time and route
  static calculateArrivalTime(departure: string, destination: string, departureTime: string, departureDate: string): { arrivalDate: string; arrivalTime: string } {
    const route = THAILAND_ROUTES.find(r => 
      r.departure === departure && r.destination === destination
    );
    
    const flightDuration = route?.duration || 90; // Default 90 minutes
    
    // Parse departure datetime
    const depDateTime = new Date(`${departureDate}T${departureTime}`);
    
    // Add flight duration
    const arrDateTime = new Date(depDateTime.getTime() + flightDuration * 60000);
    
    return {
      arrivalDate: arrDateTime.toISOString().split('T')[0], // YYYY-MM-DD
      arrivalTime: arrDateTime.toTimeString().slice(0, 5)   // HH:MM
    };
  }
  
  // Check if date is a Thai holiday (simplified)
  private static isThaiHoliday(date: Date): boolean {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Major Thai holidays (simplified)
    const holidays = [
      { month: 1, day: 1 },   // New Year
      { month: 4, day: 13 },  // Songkran
      { month: 4, day: 14 },  // Songkran
      { month: 4, day: 15 },  // Songkran
      { month: 5, day: 1 },   // Labour Day
      { month: 12, day: 5 },  // King's Birthday
      { month: 12, day: 10 }, // Constitution Day
      { month: 12, day: 31 }  // New Year's Eve
    ];
    
    return holidays.some(holiday => holiday.month === month && holiday.day === day);
  }
  
  // Generate complete flight details
  static generateFlightDetails(departure: string, destination: string, departureDate: string, departureTime: string) {
    const flightNumber = this.generateFlightNumber(departure, destination);
    const ticketPrice = this.generateTicketPrice(departure, destination, departureDate);
    const seatNumber = this.generateSeatNumber();
    const gateNumber = this.generateGateNumber(departure);
    const { arrivalDate, arrivalTime } = this.calculateArrivalTime(departure, destination, departureTime, departureDate);
    
    return {
      flight_number: flightNumber,
      ticket_price: ticketPrice,
      seat_number: seatNumber,
      gate_number: gateNumber,
      arrival_date: arrivalDate,
      arrival_time: arrivalTime
    };
  }
}