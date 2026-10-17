export type DeckType = 'lower' | 'upper';
export type SeatType = 'seater' | 'sleeper';
export type SeatStatus = 'available' | 'booked' | 'female_reserved' | 'selected';

export interface Seat {
  id: string;
  number: string;
  deck: DeckType;
  type: SeatType;
  price: number;
  status: 'available' | 'booked' | 'female_reserved';
  row: number;
  col: number;
}

export interface Amenity {
  id: string;
  name: string;
  icon: string;
}

export interface BoardingPoint {
  id: string;
  location: string;
  landmark: string;
  time: string;
}

export interface DroppingPoint {
  id: string;
  location: string;
  landmark: string;
  time: string;
}

export interface BusOperator {
  id: string;
  name: string;
  rating: number;
  totalRatings: number;
  isPrimo: boolean;
  busType: string; // e.g. "Volvo Multi-Axle A/C Sleeper (2+1)"
}

export interface Bus {
  id: string;
  operator: BusOperator;
  fromCity: string;
  toCity: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  basePrice: number;
  seatsAvailable: number;
  singleSeatsAvailable: number;
  isAC: boolean;
  isSleeper: boolean;
  isSeater: boolean;
  amenities: string[];
  boardingPoints: BoardingPoint[];
  droppingPoints: DroppingPoint[];
  seats: Seat[];
}

export interface Passenger {
  name: string;
  age: number;
  gender: 'male' | 'female';
  seatNumber: string;
}

export interface Booking {
  pnr: string;
  busId: string;
  bus: Bus;
  journeyDate: string;
  selectedSeats: Seat[];
  passengers: Passenger[];
  contactEmail: string;
  contactPhone: string;
  boardingPoint: BoardingPoint;
  droppingPoint: DroppingPoint;
  baseAmount: number;
  gstAmount: number;
  discountAmount: number;
  totalAmount: number;
  couponCode?: string;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface FilterState {
  busTypes: {
    ac: boolean;
    nonAc: boolean;
    sleeper: boolean;
    seater: boolean;
  };
  departureSlots: {
    earlyMorning: boolean; // Before 6 AM
    morning: boolean;      // 6 AM - 12 PM
    afternoon: boolean;    // 12 PM - 6 PM
    night: boolean;        // After 6 PM
  };
  primoOnly: boolean;
  singleSeatsOnly: boolean;
  maxPrice: number;
  selectedOperators: string[];
  sortBy: 'price_asc' | 'price_desc' | 'rating_desc' | 'departure_asc' | 'duration_asc';
}

export interface City {
  name: string;
  state: string;
  popular?: boolean;
}

export interface AgentProfile {
  agentId: string;
  fullName: string;
  agencyName: string;
  phone: string;
  email: string;
  city: string;
  upiId: string;
  totalBookingsCount: number;
  commissionPerBooking: number; // 19.34
  totalEarnings: number;
  unpaidEarnings: number;
  nextPayoutDate: string;
  registeredAt: string;
}
