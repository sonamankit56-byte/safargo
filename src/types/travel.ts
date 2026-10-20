// SafarGo Travel Super App Types (Bus, Hotel, Cab, Agent)

export type TravelService = 'bus' | 'hotel' | 'cab' | 'trips' | 'agent' | 'offers' | 'account' | 'flights' | 'tiffin' | 'recharge';

export const FIXED_AGENT_COMMISSION = 19.34;

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  dob: string;
  emergencyContact: string;
  walletBalance: number;
  promoCash: number;
  goldMember: boolean;
}

export interface SavedCoPassenger {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
}

export interface AgentUser {
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  shopName: string;
  businessType: string;
  city: string;
  address: string;
  pincode: string;
  panNumber: string;
  aadhaarNumber: string;
  gstin?: string;
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
  settlementUpiId: string;
  isApproved: boolean;
  isSuspended?: boolean;
  suspendReason?: string;
  appliedDate?: string;
  approvedDate?: string;
  role?: 'agent' | 'admin';
  aadhaarDocUrl?: string;
  panDocUrl?: string;
  profilePhoto?: string;
  isPhotoLocked?: boolean;
  password?: string;
  approvalToken?: string;
}

export interface BusSeat {
  id: string;            // e.g. "L1", "U5"
  deck: 'lower' | 'upper';
  row: number;
  col: number;
  seatNumber: string;    // e.g. "1A", "U4"
  type: 'sleeper' | 'seater';
  isWindow: boolean;
  status: 'available' | 'booked' | 'ladies_reserved';
  fare: number;
}

export interface StopPoint {
  id: string;
  name: string;
  time: string;
  address: string;
  landmark: string;
}

export interface BusItem {
  id: string;
  operatorName: string;
  busType: string;
  sourceCity: string;
  destinationCity: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  fare: number;
  originalFare: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  isPrimo: boolean;
  hasLiveTracking: boolean;
  availableSeats: number;
  amenities: string[];
  boardingPoints: StopPoint[];
  droppingPoints: StopPoint[];
  seats: BusSeat[];
  liveRouteWaypoints?: {
    id: string;
    stopName: string;
    time: string;
    status: 'passed' | 'current' | 'upcoming';
    landmark: string;
    distanceKm: number;
    haltDurationMinutes?: number;
  }[];
  liveTelemetry?: {
    currentSpeedKmH: number;
    currentLocationName: string;
    nextStopName: string;
    nextStopEtaMinutes: number;
    trafficStatus: 'smooth' | 'moderate' | 'heavy';
    totalDistanceKm: number;
    coveredDistanceKm: number;
  };
}

export interface Passenger {
  id: string;
  seatNumber: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
}

export interface HotelRoom {
  id: string;
  name: string;
  pricePerNight: number;
  originalPrice: number;
  maxGuests: number;
  bedType: string;
  features: string[];
  isAvailable: boolean;
}

export interface HotelItem {
  id: string;
  name: string;
  city: string;
  area: string;
  starCategory: number;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  originalPrice: number;
  images: string[];
  amenities: string[];
  description: string;
  coupleFriendly: boolean;
  freeBreakfast: boolean;
  rooms: HotelRoom[];
}

export interface CabItem {
  id: string;
  category: 'Hatchback' | 'Sedan' | 'SUV' | 'Innova Crysta';
  carModel: string;
  passengerCapacity: number;
  luggageCapacity: number;
  estimatedFare: number;
  perKmRate: number;
  freeCancellationMinutes: number;
  features: string[];
  image: string;
}

export interface TravelBooking {
  id: string;
  bookingType: 'bus' | 'hotel' | 'cab';
  pnr: string;
  bookingDate: string;
  travelDate: string;
  status: 'confirmed' | 'boarding_soon' | 'completed' | 'cancelled' | 'pending';
  totalAmount: number;
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'pay_at_bus' | 'youpi_pg';
  passengerDetails: {
    fullName: string;
    mobile: string;
    email: string;
  };
  busDetails?: {
    bus: BusItem;
    selectedSeats: string[];
    boardingPoint: StopPoint;
    droppingPoint: StopPoint;
    passengers: Passenger[];
  };
  hotelDetails?: {
    hotel: HotelItem;
    roomType: string;
    checkIn: string;
    checkOut: string;
    roomsCount: number;
    guestsCount: number;
  };
  cabDetails?: {
    cab: CabItem;
    pickupLocation: string;
    dropLocation: string;
    pickupTime: string;
  };
  isAgentBooking: boolean;
  agentCommissionAmount: number;
  utr?: string;
  agentId?: string;
  agentEmail?: string;
  verifiedByAdmin?: boolean;
  verifiedAt?: string;
  rejectionReason?: string;
  youpiPaymentId?: string;
  youpiStatus?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED';
  youpiCheckoutUrl?: string;
  whatsAppStatus?: 'sent' | 'failed' | 'pending';
  whatsAppSentAt?: string;
}

export interface WalletTopUpRequest {
  id: string;
  agentId: string;
  agentName: string;
  shopName: string;
  mobile: string;
  amount: number;
  utr: string;
  date: string;
  status: 'verified' | 'pending_audit' | 'fraud_suspended' | 'rejected';
  rejectionReason?: string;
  isFlaggedFake?: boolean;
}

export interface AdminQrConfig {
  merchantUpiId: string;
  merchantName: string;
  qrCodeImageUrl?: string;
}

export interface SupportTicket {
  id: string;
  bookingPnr?: string;
  category: 'bus_booking' | 'hotel_booking' | 'payment_wallet' | 'cancellation_refund' | 'agent_commission' | 'other';
  subject: string;
  description: string;
  status: 'pending' | 'resolved' | 'closed';
  createdAt: string;
  lastUpdated: string;
  resolutionNote?: string;
  userMobile: string;
  userName?: string;
}

export interface AgentReferral {
  id: string;
  referrerAgentId: string;
  referredName: string;
  referredShop: string;
  referredMobile: string;
  date: string;
  isVerified: boolean;
  verificationRewardPaid: boolean;
  completedBookings: number;
  completionRewardPaid: boolean;
  totalEarned: number;
}

export interface PromoOffer {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  minBookingAmount: number;
  serviceType: 'bus' | 'hotel' | 'all';
  validTill: string;
  status: 'active' | 'expired';
  usageCount: number;
  createdAt?: string;
}

export interface YoupiGatewayConfig {
  enabled: boolean;
  apiUrl: string;          // default 'http://localhost:6100' or 'http://localhost:7000'
  merchantId: string;      // default 'SFG-MERCHANT-001'
  merchantUpiVpa: string;  // default 'safargo@okicici'
  merchantName: string;    // default 'SafarGo Travel Services'
  autoConfirmSandbox: boolean; // default true (simulation/fallback mode)
}

export interface OpenWaGatewayConfig {
  enabled: boolean;
  apiUrl: string;          // default 'http://localhost:2785/api'
  sessionId: string;       // default 'safargo-session'
  apiKey: string;          // optional API key
  fallbackToWhatsAppWeb: boolean; // default true
}

export interface SmsGatewayConfig {
  enabled: boolean;
  provider: 'fast2sms' | 'twofactor' | 'firebase' | 'openwa_whatsapp' | 'auto';
  fast2smsApiKey: string;
  twofactorApiKey: string;
  senderId: string;       // default 'SFARGO'
  autoDeliverViaWhatsApp: boolean; // default true
}


