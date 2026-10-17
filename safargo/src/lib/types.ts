export type SubdomainId =
  | 'www'
  | 'book'
  | 'agent'
  | 'go'
  | 'admin'
  | 'operator'
  | 'kisan'
  | 'buyer'
  | 'transport'
  | 'pay'
  | 'help'
  | 'partner';

export type UserRole =
  | 'customer'
  | 'agent'
  | 'go_agent'
  | 'admin'
  | 'operator'
  | 'farmer'
  | 'buyer'
  | 'transporter'
  | 'partner'
  | 'support';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  status: 'active' | 'pending_verification' | 'suspended';
  createdAt: string;
  avatarUrl?: string;
}

export interface AgentDetails {
  id: string;
  profileId: string;
  agentType: 'regular' | 'go_agent';
  referralCode: string;
  referredByCode?: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
  verificationNotes?: string;
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    accountHolderName: string;
    upiId?: string;
  };
  totalEarnings: number;
  pendingEarnings: number;
}

export interface GoAgentConfig {
  monthlyTarget: number; // 150
  fixedMonthlySalary: number; // 5000
  commissionPerBooking: number; // 19.34
  referralReward: number; // 100
  referralTargetBookings: number; // 5
}

export interface RouteItem {
  id: string;
  originCity: string;
  destinationCity: string;
  distanceKm: number;
  isActive: boolean;
  popularRank?: number;
}

export interface BoardingDroppingPoint {
  id: string;
  name: string;
  landmark?: string;
  time: string;
}

export interface BusService {
  id: string;
  routeId: string;
  operatorName: string;
  operatorContact?: string;
  busType: 'AC Sleeper' | 'Non-AC Sleeper' | 'AC Seater' | 'Non-AC Seater' | 'Volvo Multi-Axle' | 'BharatBenz AC';
  departureTime: string;
  arrivalTime: string;
  durationText: string;
  baseFare: number;
  boardingPoints: BoardingDroppingPoint[];
  droppingPoints: BoardingDroppingPoint[];
  amenities: string[];
  cancellationPolicy: string;
  seatingCapacity: number;
  bookingMethod: 'manual_assisted' | 'api_connected';
  lastVerifiedTime: string;
  isActive: boolean;
}

export type BookingStatus =
  | 'pending'
  | 'awaiting_operator'
  | 'confirmed'
  | 'rejected'
  | 'cancellation_requested'
  | 'cancelled'
  | 'refund_pending'
  | 'refunded';

export interface Passenger {
  fullName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  seatPreference?: string;
}

export interface Booking {
  id: string;
  bookingRef: string; // SFG-2026-XXXX
  userId?: string;
  bookingChannel: 'customer_self' | 'agent_assisted' | 'partner';
  agentId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceId: string;
  routeId: string;
  originCity: string;
  destinationCity: string;
  operatorName: string;
  busType: string;
  journeyDate: string;
  departureTime: string;
  arrivalTime: string;
  boardingPoint: string;
  droppingPoint: string;
  passengers: Passenger[];
  passengersCount: number;
  totalFare: number;
  discountAmount: number;
  couponCode?: string;
  finalAmount: number;
  status: BookingStatus;
  operatorResponse?: 'accepted' | 'rejected' | 'pending';
  operatorPnr?: string; // Genuine operator PNR if confirmed
  internalNotes?: string;
  rejectionReason?: string;
  assistanceStartedAt: string; // ISO string
  assistanceTargetMinutes: number; // 15
  isDelayed: boolean;
  confirmedAt?: string;
  confirmedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommissionRecord {
  id: string;
  agentId: string;
  bookingId: string;
  bookingRef: string;
  amount: number;
  status: 'pending' | 'eligible' | 'paid' | 'reversed';
  description: string;
  createdAt: string;
  paidAt?: string;
}

export interface SalaryRecord {
  id: string;
  agentId: string;
  monthYear: string; // "2026-10"
  fixedSalary: number; // 5000
  targetBookings: number; // 150
  achievedBookings: number;
  status: 'in_progress' | 'approved' | 'paid' | 'not_eligible';
  notes?: string;
  approvedBy?: string;
  paidAt?: string;
}

export interface ReferralRecord {
  id: string;
  referrerId: string; // Agent who referred
  referrerCode: string;
  refereeId: string;
  refereeName: string;
  refereeType: 'agent' | 'go_agent' | 'partner';
  completedBookingsCount: number;
  requiredBookingsCount: number; // 5
  rewardAmount: number; // 100
  status: 'pending' | 'eligible' | 'approved' | 'paid';
  createdAt: string;
  approvedAt?: string;
}

export interface Offer {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minBookingAmount: number;
  maxDiscount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  eligibleChannels: ('customer_self' | 'agent_assisted' | 'partner')[];
  usageLimitPerUser: number;
}

export interface PaymentTransaction {
  id: string;
  bookingId: string;
  bookingRef: string;
  transactionRef: string;
  provider: 'razorpay' | 'manual_verification' | 'upi';
  amount: number;
  currency: string;
  status: 'pending' | 'successful' | 'failed' | 'refunded';
  signature?: string;
  idempotentKey: string;
  customerPhone: string;
  createdAt: string;
  paidAt?: string;
}

export interface RefundRequest {
  id: string;
  bookingId: string;
  bookingRef: string;
  requestedBy: string;
  reason: string;
  calculatedRefund: number;
  deductionAmount: number;
  status: 'requested' | 'under_review' | 'approved' | 'rejected' | 'processed' | 'failed';
  refundRef?: string;
  adminNotes?: string;
  createdAt: string;
  processedAt?: string;
}

export interface SupportTicket {
  id: string;
  ticketRef: string; // TKT-XXXX
  userId?: string;
  customerName: string;
  customerPhone: string;
  bookingRef?: string;
  category: 'booking' | 'payment' | 'cancellation' | 'agent' | 'general' | 'agriculture';
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  resolutionNotes?: string;
}

// Agricultural Services
export interface FarmerProfile {
  id: string;
  profileId: string;
  farmerName: string;
  phone: string;
  village: string;
  district: string;
  state: string;
  landAreaAcres: number;
  isVerified: boolean;
}

export interface CropListing {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  cropName: string;
  variety: string;
  quantityQuintals: number;
  expectedPricePerQuintal: number;
  harvestDate: string;
  location: string;
  status: 'available' | 'negotiating' | 'sold' | 'withdrawn';
  pickupRequirements: string;
  createdAt: string;
}

export interface BuyerInquiry {
  id: string;
  cropListingId: string;
  cropName: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  offeredPricePerQuintal: number;
  requiredQuantityQuintals: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
}

export interface TransportRequest {
  id: string;
  requesterType: 'farmer' | 'buyer';
  requesterName: string;
  requesterPhone: string;
  cropType: string;
  weightQuintals: number;
  pickupLocation: string;
  deliveryLocation: string;
  preferredDate: string;
  transporterId?: string;
  transporterName?: string;
  vehicleNumber?: string;
  status: 'requested' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled';
  fareAgreed?: number;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}
