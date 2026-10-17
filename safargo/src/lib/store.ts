import { 
  UserProfile, 
  AgentDetails, 
  GoAgentConfig, 
  RouteItem, 
  BusService, 
  Booking, 
  CommissionRecord, 
  SalaryRecord, 
  ReferralRecord, 
  Offer, 
  PaymentTransaction, 
  RefundRequest, 
  SupportTicket, 
  FarmerProfile, 
  CropListing, 
  BuyerInquiry, 
  TransportRequest, 
  AuditLog, 
  UserRole,
  Passenger
} from './types';
import { supabase } from './supabase';

const STORAGE_KEY = 'safargo_platform_store_v1';

// Default Go Agent Business Rules
export const DEFAULT_GO_AGENT_CONFIG: GoAgentConfig = {
  monthlyTarget: 150,
  fixedMonthlySalary: 5000,
  commissionPerBooking: 19.34,
  referralReward: 100,
  referralTargetBookings: 5,
};

// Seed Configured Routes (Including real live network)
export const SEED_ROUTES: RouteItem[] = [
  { id: 'route-live-1', originCity: 'Ashok Nagar', destinationCity: 'Indore', distanceKm: 340, isActive: true, popularRank: 1 },
  { id: 'route-live-2', originCity: 'Indore', destinationCity: 'Ashok Nagar', distanceKm: 340, isActive: true, popularRank: 2 },
  { id: 'route-1', originCity: 'Delhi', destinationCity: 'Jaipur', distanceKm: 280, isActive: true, popularRank: 3 },
  { id: 'route-2', originCity: 'Jaipur', destinationCity: 'Delhi', distanceKm: 280, isActive: true, popularRank: 4 },
  { id: 'route-3', originCity: 'Lucknow', destinationCity: 'Varanasi', distanceKm: 310, isActive: true, popularRank: 5 },
  { id: 'route-4', originCity: 'Indore', destinationCity: 'Bhopal', distanceKm: 195, isActive: true, popularRank: 6 },
  { id: 'route-5', originCity: 'Patna', destinationCity: 'Gaya', distanceKm: 110, isActive: true, popularRank: 7 },
  { id: 'route-6', originCity: 'Ahmedabad', destinationCity: 'Surat', distanceKm: 265, isActive: true, popularRank: 8 },
  { id: 'route-7', originCity: 'Pune', destinationCity: 'Mumbai', distanceKm: 150, isActive: true, popularRank: 9 },
];

// Seed Verified Bus Services
export const SEED_SERVICES: BusService[] = [
  {
    id: 'srv-kamla-101',
    routeId: 'route-live-1',
    operatorName: 'Kamla Bus Travels',
    operatorContact: '+91-7489674391',
    busType: 'AC Sleeper',
    departureTime: '21:00',
    arrivalTime: '06:00',
    durationText: '9h 00m',
    baseFare: 400,
    boardingPoints: [
      { id: 'bp-kn-1', name: 'Bangla Chauraha', time: '21:00', landmark: 'Main Stand Ashok Nagar' },
      { id: 'bp-kn-2', name: 'Station Road Ashok Nagar', time: '21:20', landmark: 'Railway Crossing' },
    ],
    droppingPoints: [
      { id: 'dp-ind-1', name: 'Sarwate Bus Stand Indore', time: '05:45', landmark: 'Platform 3' },
      { id: 'dp-ind-2', name: 'Vijay Nagar Square Indore', time: '06:15', landmark: 'Main Flyover' },
    ],
    amenities: ['Charging Point', 'Air Conditioning', 'Luggage Compartment', 'Water Bottle'],
    cancellationPolicy: 'Operator policy: 20% deduction before 6 hours of journey.',
    seatingCapacity: 40,
    bookingMethod: 'manual_assisted',
    lastVerifiedTime: 'Today at 09:00 AM',
    isActive: true,
  },
  {
    id: 'srv-101',
    routeId: 'route-1',
    operatorName: 'SafarGo Royal Travels',
    operatorContact: '+91-9876543201',
    busType: 'AC Sleeper',
    departureTime: '21:30',
    arrivalTime: '03:30',
    durationText: '6h 00m',
    baseFare: 650,
    boardingPoints: [
      { id: 'bp-1', name: 'ISBT Kashmiri Gate', time: '21:30', landmark: 'Metro Gate No. 2' },
      { id: 'bp-2', name: 'Dhaula Kuan', time: '22:15', landmark: 'Foot Over Bridge' },
      { id: 'bp-3', name: 'IFFCO Chowk Gurgaon', time: '22:45', landmark: 'Opposite Police Station' },
    ],
    droppingPoints: [
      { id: 'dp-1', name: 'Sindhi Camp', time: '03:00', landmark: 'Central Bus Stand' },
      { id: 'dp-2', name: 'Narayan Singh Circle', time: '03:30', landmark: 'Main Circle' },
    ],
    amenities: ['Charging Point', 'Blankets', 'Reading Light', 'Emergency Contact', 'CCTV'],
    cancellationPolicy: 'Cancellation prior to 12 hours of departure: 15% deduction. Within 12 hours: 50% deduction. Within 2 hours: No refund.',
    seatingCapacity: 36,
    bookingMethod: 'manual_assisted',
    lastVerifiedTime: 'Today at 08:00 AM',
    isActive: true,
  },
  {
    id: 'srv-102',
    routeId: 'route-1',
    operatorName: 'Rajdhani Express Roadways',
    operatorContact: '+91-9876543202',
    busType: 'BharatBenz AC',
    departureTime: '06:00',
    arrivalTime: '11:45',
    durationText: '5h 45m',
    baseFare: 550,
    boardingPoints: [
      { id: 'bp-4', name: 'Sarai Kale Khan ISBT', time: '06:00', landmark: 'Platform 4' },
      { id: 'bp-5', name: 'Mahipalpur Flyover', time: '06:40', landmark: 'Aerocity Metro Exit' },
    ],
    droppingPoints: [
      { id: 'dp-3', name: 'Transport Nagar Jaipur', time: '11:15', landmark: 'Under Flyover' },
      { id: 'dp-4', name: 'Sindhi Camp', time: '11:45', landmark: 'Platform 7' },
    ],
    amenities: ['Water Bottle', 'USB Charger', 'Air Conditioning', 'Fire Extinguisher'],
    cancellationPolicy: 'Manual booking verification required. Full refund on operator refusal.',
    seatingCapacity: 45,
    bookingMethod: 'manual_assisted',
    lastVerifiedTime: 'Today at 09:30 AM',
    isActive: true,
  },
  {
    id: 'srv-103',
    routeId: 'route-3',
    operatorName: 'Awadh Heritage Lines',
    operatorContact: '+91-9876543203',
    busType: 'AC Seater',
    departureTime: '14:00',
    arrivalTime: '20:30',
    durationText: '6h 30m',
    baseFare: 480,
    boardingPoints: [
      { id: 'bp-6', name: 'Alambagh Bus Terminal', time: '14:00', landmark: 'Counter 12' },
      { id: 'bp-7', name: 'Polytechnic Chauraha', time: '14:35', landmark: 'Near Metro Pillar 50' },
    ],
    droppingPoints: [
      { id: 'dp-5', name: 'Cantt Bus Station Varanasi', time: '20:00', landmark: 'Main Gate' },
      { id: 'dp-6', name: 'Lanka BHU Gate', time: '20:30', landmark: 'Sir Sunderlal Hospital' },
    ],
    amenities: ['Charging Point', 'Music', 'Pushback Seats'],
    cancellationPolicy: 'Assisted booking operator terms apply. Verified refund within 48 hours of cancellation.',
    seatingCapacity: 40,
    bookingMethod: 'manual_assisted',
    lastVerifiedTime: 'Yesterday at 05:00 PM',
    isActive: true,
  },
  {
    id: 'srv-104',
    routeId: 'route-4',
    operatorName: 'Malwa Super Connect',
    operatorContact: '+91-9876543204',
    busType: 'Volvo Multi-Axle',
    departureTime: '08:00',
    arrivalTime: '11:30',
    durationText: '3h 30m',
    baseFare: 380,
    boardingPoints: [
      { id: 'bp-8', name: 'Indore Sarwate Bus Stand', time: '08:00', landmark: 'Gate 1' },
      { id: 'bp-9', name: 'Vijay Nagar Square', time: '08:30', landmark: 'Near Brilliant Convention' },
    ],
    droppingPoints: [
      { id: 'dp-7', name: 'Bhopal ISBT', time: '11:15', landmark: 'Hoshangabad Road' },
      { id: 'dp-8', name: 'Nadra Bus Stand', time: '11:30', landmark: 'Old Bhopal Station' },
    ],
    amenities: ['Wi-Fi', 'Bottled Water', 'Reading Light', 'Charging Plug'],
    cancellationPolicy: 'Operator policy: 20% deduction before 6 hours.',
    seatingCapacity: 48,
    bookingMethod: 'manual_assisted',
    lastVerifiedTime: 'Today at 07:15 AM',
    isActive: true,
  },
  {
    id: 'srv-105',
    routeId: 'route-5',
    operatorName: 'Magadh Star Express',
    operatorContact: '+91-9876543205',
    busType: 'Non-AC Seater',
    departureTime: '10:00',
    arrivalTime: '13:00',
    durationText: '3h 00m',
    baseFare: 220,
    boardingPoints: [
      { id: 'bp-10', name: 'Patna Mithapur Bus Stand', time: '10:00', landmark: 'Platform 3' },
    ],
    droppingPoints: [
      { id: 'dp-9', name: 'Gaya Bus Stand', time: '13:00', landmark: 'Gandhi Maidan' },
    ],
    amenities: ['Luggage Storage', 'Emergency Exit'],
    cancellationPolicy: 'Manual booking assistance. Cancel request review within 1 hour.',
    seatingCapacity: 50,
    bookingMethod: 'manual_assisted',
    lastVerifiedTime: 'Today at 06:45 AM',
    isActive: true,
  },
];

// Seed Offers & Coupons
export const SEED_OFFERS: Offer[] = [
  {
    id: 'offer-1',
    code: 'SAFARPEHLA',
    title: 'First Booking Special',
    description: 'Get 10% instant discount up to ₹100 on your first booking with SafarGo.',
    discountType: 'percentage',
    discountValue: 10,
    minBookingAmount: 400,
    maxDiscount: 100,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    isActive: true,
    eligibleChannels: ['customer_self', 'agent_assisted', 'partner'],
    usageLimitPerUser: 1,
  },
  {
    id: 'offer-2',
    code: 'GOAGENT50',
    title: 'Agent Assisted Benefit',
    description: 'Save flat ₹50 on bookings placed via verified SafarGo agents.',
    discountType: 'fixed',
    discountValue: 50,
    minBookingAmount: 500,
    maxDiscount: 50,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    isActive: true,
    eligibleChannels: ['agent_assisted'],
    usageLimitPerUser: 3,
  },
];

// Seed Profiles for Persona Switcher & Real Roles
export const SEED_PROFILES: UserProfile[] = [
  {
    id: 'usr-admin',
    email: 'admin@safargo.in',
    fullName: 'Ramesh Sharma (Admin Ops)',
    phone: '+91-9876543210',
    role: 'admin',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'usr-go-agent',
    email: 'goagent.vikram@safargo.in',
    fullName: 'Vikram Singh (Special Go Agent)',
    phone: '+91-9823456789',
    role: 'go_agent',
    status: 'active',
    createdAt: '2026-01-10T00:00:00.000Z',
  },
  {
    id: 'usr-regular-agent',
    email: 'agent.suresh@safargo.in',
    fullName: 'Suresh Kumar (Kendra Agent)',
    phone: '+91-9834567890',
    role: 'agent',
    status: 'active',
    createdAt: '2026-01-15T00:00:00.000Z',
  },
  {
    id: 'usr-operator',
    email: 'operator@royaltravels.com',
    fullName: 'Mahesh Verma (Royal Travels Operator)',
    phone: '+91-9845678901',
    role: 'operator',
    status: 'active',
    createdAt: '2026-01-12T00:00:00.000Z',
  },
  {
    id: 'usr-customer',
    email: 'priya.patel@gmail.com',
    fullName: 'Priya Patel (Customer)',
    phone: '+91-9856789012',
    role: 'customer',
    status: 'active',
    createdAt: '2026-02-01T00:00:00.000Z',
  },
  {
    id: 'usr-kisan',
    email: 'kisan.ramkishan@safargo.in',
    fullName: 'Ramkishan Yadav (Kisan Farmer)',
    phone: '+91-9867890123',
    role: 'farmer',
    status: 'active',
    createdAt: '2026-02-05T00:00:00.000Z',
  },
  {
    id: 'usr-buyer',
    email: 'buyer.agrotraders@safargo.in',
    fullName: 'Anil Agrawal (Agro Mandi Buyer)',
    phone: '+91-9878901234',
    role: 'buyer',
    status: 'active',
    createdAt: '2026-02-08T00:00:00.000Z',
  },
  {
    id: 'usr-transport',
    email: 'transporter.baljit@safargo.in',
    fullName: 'Baljit Singh (Kisan Transport Logistics)',
    phone: '+91-9889012345',
    role: 'transporter',
    status: 'active',
    createdAt: '2026-02-10T00:00:00.000Z',
  },
  {
    id: 'usr-partner',
    email: 'partner.sharma@safargo.in',
    fullName: 'Sharma Tour & Travel Partner',
    phone: '+91-9890123456',
    role: 'partner',
    status: 'active',
    createdAt: '2026-02-15T00:00:00.000Z',
  },
];

export const SEED_AGENTS: AgentDetails[] = [
  {
    id: 'agent-go-1',
    profileId: 'usr-go-agent',
    agentType: 'go_agent',
    referralCode: 'GO-VIKRAM',
    referredByCode: undefined,
    kycStatus: 'verified',
    verificationNotes: 'Aadhaar and PAN verified by Admin on 12 Jan 2026.',
    bankDetails: {
      accountNumber: '9182345678901',
      ifscCode: 'SBIN0001234',
      bankName: 'State Bank of India',
      accountHolderName: 'Vikram Singh',
      upiId: 'vikram@sbi',
    },
    totalEarnings: 2901.00,
    pendingEarnings: 154.72,
  },
  {
    id: 'agent-reg-1',
    profileId: 'usr-regular-agent',
    agentType: 'regular',
    referralCode: 'AG-SURESH',
    referredByCode: 'GO-VIKRAM',
    kycStatus: 'verified',
    verificationNotes: 'Commercial shop license verified.',
    bankDetails: {
      accountNumber: '501002345678',
      ifscCode: 'HDFC0000543',
      bankName: 'HDFC Bank',
      accountHolderName: 'Suresh Kumar',
      upiId: 'suresh@hdfcbank',
    },
    totalEarnings: 650.00,
    pendingEarnings: 40.00,
  },
];

// Initial bookings showing the manual assistance workflow states
export const SEED_BOOKINGS: Booking[] = [
  {
    id: 'bk-001',
    bookingRef: 'SFG-2026-847291',
    userId: 'usr-customer',
    bookingChannel: 'customer_self',
    customerName: 'Priya Patel',
    customerPhone: '+91-9856789012',
    customerEmail: 'priya.patel@gmail.com',
    serviceId: 'srv-101',
    routeId: 'route-1',
    originCity: 'Delhi',
    destinationCity: 'Jaipur',
    operatorName: 'SafarGo Royal Travels',
    busType: 'AC Sleeper',
    journeyDate: '2026-10-25',
    departureTime: '21:30',
    arrivalTime: '03:30',
    boardingPoint: 'ISBT Kashmiri Gate (21:30)',
    droppingPoint: 'Sindhi Camp (03:00)',
    passengers: [
      { fullName: 'Priya Patel', age: 28, gender: 'female', seatPreference: 'Lower Single Sleeper' },
    ],
    passengersCount: 1,
    totalFare: 650,
    discountAmount: 65,
    couponCode: 'SAFARPEHLA',
    finalAmount: 585,
    status: 'confirmed',
    operatorResponse: 'accepted',
    operatorPnr: 'RYL-JP-9941', // Genuine operator PNR entered by operator/admin
    internalNotes: 'Operator verified seat 4L available and confirmed.',
    assistanceStartedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    assistanceTargetMinutes: 15,
    isDelayed: false,
    confirmedAt: new Date(Date.now() - 3600000 * 1.8).toISOString(),
    confirmedBy: 'usr-admin',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1.8).toISOString(),
  },
  {
    id: 'bk-002',
    bookingRef: 'SFG-2026-918234',
    userId: 'usr-customer',
    bookingChannel: 'agent_assisted',
    agentId: 'agent-go-1',
    customerName: 'Rohit Verma',
    customerPhone: '+91-9811223344',
    serviceId: 'srv-102',
    routeId: 'route-1',
    originCity: 'Delhi',
    destinationCity: 'Jaipur',
    operatorName: 'Rajdhani Express Roadways',
    busType: 'BharatBenz AC',
    journeyDate: '2026-10-26',
    departureTime: '06:00',
    arrivalTime: '11:45',
    boardingPoint: 'Sarai Kale Khan ISBT (06:00)',
    droppingPoint: 'Sindhi Camp (11:45)',
    passengers: [
      { fullName: 'Rohit Verma', age: 34, gender: 'male', seatPreference: 'Window Seat' },
      { fullName: 'Sunita Verma', age: 31, gender: 'female', seatPreference: 'Aisle Seat' },
    ],
    passengersCount: 2,
    totalFare: 1100,
    discountAmount: 50,
    couponCode: 'GOAGENT50',
    finalAmount: 1050,
    status: 'pending', // Pending manual review
    operatorResponse: 'pending',
    assistanceStartedAt: new Date(Date.now() - 1000 * 60 * 6).toISOString(), // 6 minutes ago
    assistanceTargetMinutes: 15,
    isDelayed: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
  },
  {
    id: 'bk-003',
    bookingRef: 'SFG-2026-554432',
    userId: undefined,
    bookingChannel: 'agent_assisted',
    agentId: 'agent-go-1',
    customerName: 'Manoj Tiwari',
    customerPhone: '+91-9877665544',
    serviceId: 'srv-104',
    routeId: 'route-4',
    originCity: 'Indore',
    destinationCity: 'Bhopal',
    operatorName: 'Malwa Super Connect',
    busType: 'Volvo Multi-Axle',
    journeyDate: '2026-10-24',
    departureTime: '08:00',
    arrivalTime: '11:30',
    boardingPoint: 'Indore Sarwate Bus Stand (08:00)',
    droppingPoint: 'Bhopal ISBT (11:15)',
    passengers: [
      { fullName: 'Manoj Tiwari', age: 45, gender: 'male', seatPreference: 'Front row preferred' },
    ],
    passengersCount: 1,
    totalFare: 380,
    discountAmount: 0,
    finalAmount: 380,
    status: 'pending',
    operatorResponse: 'pending',
    assistanceStartedAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(), // 22 minutes ago -> Delayed!
    assistanceTargetMinutes: 15,
    isDelayed: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
  }
];

// Seed Commission Ledger
export const SEED_COMMISSIONS: CommissionRecord[] = [
  {
    id: 'com-001',
    agentId: 'agent-go-1',
    bookingId: 'bk-001',
    bookingRef: 'SFG-2026-847291',
    amount: 19.34,
    status: 'eligible',
    description: 'Confirmed booking commission for SFG-2026-847291',
    createdAt: new Date(Date.now() - 3600000 * 1.8).toISOString(),
  }
];

// Seed Salary Records for Go Agent
export const SEED_SALARY: SalaryRecord[] = [
  {
    id: 'sal-2026-09',
    agentId: 'agent-go-1',
    monthYear: '2026-09',
    fixedSalary: 5000,
    targetBookings: 150,
    achievedBookings: 152,
    status: 'paid',
    notes: 'Exceeded target with 152 bookings. Fixed salary credited.',
    approvedBy: 'usr-admin',
    paidAt: '2026-10-02T10:00:00.000Z',
  },
  {
    id: 'sal-2026-10',
    agentId: 'agent-go-1',
    monthYear: '2026-10',
    fixedSalary: 5000,
    targetBookings: 150,
    achievedBookings: 84,
    status: 'in_progress',
    notes: 'Current month progress: 84 of 150 bookings completed.',
  }
];

// Seed Referrals
export const SEED_REFERRALS: ReferralRecord[] = [
  {
    id: 'ref-001',
    referrerId: 'agent-go-1',
    referrerCode: 'GO-VIKRAM',
    refereeId: 'agent-reg-1',
    refereeName: 'Suresh Kumar',
    refereeType: 'agent',
    completedBookingsCount: 5,
    requiredBookingsCount: 5,
    rewardAmount: 100,
    status: 'eligible', // 5 bookings reached! Awaiting admin approval
    createdAt: '2026-01-20T12:00:00.000Z',
  }
];

// Seed Agricultural Data
export const SEED_FARMERS: FarmerProfile[] = [
  {
    id: 'farm-001',
    profileId: 'usr-kisan',
    farmerName: 'Ramkishan Yadav',
    phone: '+91-9867890123',
    village: 'Pipariya',
    district: 'Hoshangabad',
    state: 'Madhya Pradesh',
    landAreaAcres: 12.5,
    isVerified: true,
  }
];

export const SEED_CROP_LISTINGS: CropListing[] = [
  {
    id: 'crop-101',
    farmerId: 'farm-001',
    farmerName: 'Ramkishan Yadav',
    farmerPhone: '+91-9867890123',
    cropName: 'Wheat (Sharbati)',
    variety: 'C-306 Sharbati Golden',
    quantityQuintals: 150,
    expectedPricePerQuintal: 2850,
    harvestDate: '2026-10-15',
    location: 'Pipariya Mandi Yard, MP',
    status: 'available',
    pickupRequirements: 'Farmgate pickup or Mandi delivery. Moisture < 11%.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'crop-102',
    farmerId: 'farm-001',
    farmerName: 'Ramkishan Yadav',
    farmerPhone: '+91-9867890123',
    cropName: 'Mustard (Sarson)',
    variety: 'Pusa Bold High Oil',
    quantityQuintals: 80,
    expectedPricePerQuintal: 5400,
    harvestDate: '2026-10-20',
    location: 'Hoshangabad Rural',
    status: 'available',
    pickupRequirements: 'Tractor accessible warehouse near national highway.',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  }
];

export const SEED_BUYER_INQUIRIES: BuyerInquiry[] = [
  {
    id: 'inq-001',
    cropListingId: 'crop-101',
    cropName: 'Wheat (Sharbati)',
    buyerId: 'usr-buyer',
    buyerName: 'Anil Agrawal (Agro Mandi)',
    buyerPhone: '+91-9878901234',
    offeredPricePerQuintal: 2800,
    requiredQuantityQuintals: 100,
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  }
];

export const SEED_TRANSPORT_REQUESTS: TransportRequest[] = [
  {
    id: 'trp-001',
    requesterType: 'farmer',
    requesterName: 'Ramkishan Yadav',
    requesterPhone: '+91-9867890123',
    cropType: 'Wheat (Sharbati)',
    weightQuintals: 100,
    pickupLocation: 'Pipariya, MP',
    deliveryLocation: 'Indore APMC Mandi, MP',
    preferredDate: '2026-10-28',
    transporterId: 'usr-transport',
    transporterName: 'Baljit Singh Logistics',
    vehicleNumber: 'MP-09-AB-1234',
    status: 'assigned',
    fareAgreed: 14500,
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  }
];

export const SEED_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-001',
    ticketRef: 'TKT-2026-1082',
    userId: 'usr-customer',
    customerName: 'Priya Patel',
    customerPhone: '+91-9856789012',
    bookingRef: 'SFG-2026-847291',
    category: 'booking',
    subject: 'Boarding Point Landmark Query',
    description: 'Please confirm whether ISBT Kashmiri Gate bus departs from Platform 1 or Metro Gate 2.',
    status: 'resolved',
    priority: 'medium',
    resolutionNotes: 'Operator verified bus will halt near Metro Gate No. 2.',
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
  }
];

export const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    userId: 'usr-admin',
    userName: 'Ramesh Sharma',
    userRole: 'admin',
    action: 'CONFIRM_BOOKING',
    entityType: 'booking',
    entityId: 'bk-001',
    details: 'Verified with Royal Travels. Confirmed booking with operator PNR RYL-JP-9941.',
    timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString(),
  }
];

export interface SafarGoStoreState {
  currentUser: UserProfile;
  profiles: UserProfile[];
  agents: AgentDetails[];
  goAgentConfig: GoAgentConfig;
  routes: RouteItem[];
  services: BusService[];
  bookings: Booking[];
  commissions: CommissionRecord[];
  salaryRecords: SalaryRecord[];
  referrals: ReferralRecord[];
  offers: Offer[];
  paymentTransactions: PaymentTransaction[];
  refundRequests: RefundRequest[];
  farmers: FarmerProfile[];
  cropListings: CropListing[];
  buyerInquiries: BuyerInquiry[];
  transportRequests: TransportRequest[];
  supportTickets: SupportTicket[];
  auditLogs: AuditLog[];
}

export class SafarGoStore {
  private state: SafarGoStoreState;
  private listeners: (() => void)[] = [];

  constructor() {
    this.state = this.loadState();
    this.syncFromSupabase();
  }

  public async syncFromSupabase() {
    try {
      if (typeof window === 'undefined') return;
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(25);

      if (data && data.length > 0) {
        const liveBookings: Booking[] = data.map((d: any) => ({
          id: d.id,
          bookingRef: d.booking_code || `SFG-2026-${String(d.id).slice(-6).toUpperCase()}`,
          userId: d.agent_id || 'usr-customer',
          bookingChannel: d.agent_id ? 'agent_assisted' : 'customer_self',
          agentId: d.agent_id || undefined,
          customerName: d.customer_name || 'Passenger',
          customerPhone: d.customer_mobile || '+91-9876543210',
          serviceId: 'srv-kamla-101',
          routeId: 'route-live-1',
          originCity: d.from_city || 'Ashok Nagar',
          destinationCity: d.to_city || 'Indore',
          operatorName: d.actual_operator || d.operator_preference || 'Kamla Bus Travels',
          busType: d.seat_category === 'ac_sleeper' ? 'AC Sleeper' : 'AC Seater',
          journeyDate: d.journey_date || '2026-10-25',
          departureTime: d.departure_time_pref || '21:00',
          arrivalTime: '06:00',
          boardingPoint: d.actual_boarding_point || d.boarding_point || 'Bangla Chauraha',
          droppingPoint: d.actual_drop_point || d.drop_point || 'Indore Sarwate Stand',
          passengers: Array.isArray(d.passenger_details)
            ? d.passenger_details.map((p: any) => ({
                fullName: p.name || 'Passenger',
                age: p.age || 28,
                gender: p.gender === 'F' ? 'female' : 'male',
                seatPreference: p.seat_number || 'Lower Berth',
              }))
            : [{ fullName: d.customer_name || 'Passenger', age: 28, gender: 'male' }],
          passengersCount: d.passenger_count || 1,
          totalFare: Number(d.total_estimated_amount || d.estimated_fare || 400),
          discountAmount: 0,
          finalAmount: Number(d.actual_fare || d.total_estimated_amount || 400),
          status: d.status === 'confirmed' ? 'confirmed' : 'pending',
          operatorResponse: d.status === 'confirmed' ? 'accepted' : 'pending',
          operatorPnr: d.ticket_pnr || undefined,
          assistanceStartedAt: d.created_at || new Date().toISOString(),
          assistanceTargetMinutes: 15,
          isDelayed: false,
          confirmedAt: d.confirmed_at || undefined,
          confirmedBy: d.confirmed_by || undefined,
          createdAt: d.created_at || new Date().toISOString(),
          updatedAt: d.updated_at || new Date().toISOString(),
        }));

        const existingRefs = new Set(this.state.bookings.map((b) => b.bookingRef));
        const newItems = liveBookings.filter((b) => !existingRefs.has(b.bookingRef));

        if (newItems.length > 0) {
          this.state.bookings = [...newItems, ...this.state.bookings];
          this.save();
        }
      }
    } catch {
      // Graceful fallback to local cache
    }
  }

  private loadState(): SafarGoStoreState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          // Ensure seed lists are fallback merged if missing
          routes: parsed.routes || SEED_ROUTES,
          services: parsed.services || SEED_SERVICES,
          offers: parsed.offers || SEED_OFFERS,
          goAgentConfig: parsed.goAgentConfig || DEFAULT_GO_AGENT_CONFIG,
        };
      }
    } catch {
      // Fallback to fresh seed state
    }

    return {
      currentUser: SEED_PROFILES[0], // Default admin for review
      profiles: SEED_PROFILES,
      agents: SEED_AGENTS,
      goAgentConfig: DEFAULT_GO_AGENT_CONFIG,
      routes: SEED_ROUTES,
      services: SEED_SERVICES,
      bookings: SEED_BOOKINGS,
      commissions: SEED_COMMISSIONS,
      salaryRecords: SEED_SALARY,
      referrals: SEED_REFERRALS,
      offers: SEED_OFFERS,
      paymentTransactions: [],
      refundRequests: [],
      farmers: SEED_FARMERS,
      cropListings: SEED_CROP_LISTINGS,
      buyerInquiries: SEED_BUYER_INQUIRIES,
      transportRequests: SEED_TRANSPORT_REQUESTS,
      supportTickets: SEED_SUPPORT_TICKETS,
      auditLogs: SEED_AUDIT_LOGS,
    };
  }

  public save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // ignore quota errors
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public getState(): SafarGoStoreState {
    return this.state;
  }

  // --- Auth & Persona Switching ---
  public setCurrentUser(user: UserProfile) {
    this.state.currentUser = user;
    this.logAudit(user.id, user.fullName, user.role, 'SWITCH_PERSONA', 'auth', user.id, `Switched persona to ${user.role}`);
    this.save();
  }

  public setRole(role: UserRole) {
    const matching = this.state.profiles.find((p) => p.role === role);
    if (matching) {
      this.setCurrentUser(matching);
    } else {
      this.state.currentUser = {
        ...this.state.currentUser,
        role,
      };
      this.save();
    }
  }

  // --- Admin Settings ---
  public updateGoAgentConfig(config: Partial<GoAgentConfig>, updatedBy: string) {
    this.state.goAgentConfig = { ...this.state.goAgentConfig, ...config };
    this.logAudit(updatedBy, this.state.currentUser.fullName, 'admin', 'UPDATE_CONFIG', 'go_agent_settings', 'config', JSON.stringify(config));
    this.save();
  }

  // --- Booking Engine ---
  public createBooking(data: {
    bookingChannel: 'customer_self' | 'agent_assisted' | 'partner';
    agentId?: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    serviceId: string;
    boardingPoint: string;
    droppingPoint: string;
    journeyDate: string;
    passengers: Passenger[];
    couponCode?: string;
  }): { success: boolean; booking?: Booking; error?: string } {
    const service = this.state.services.find((s) => s.id === data.serviceId);
    if (!service) return { success: false, error: 'Selected bus service was not found.' };

    const route = this.state.routes.find((r) => r.id === service.routeId);
    if (!route) return { success: false, error: 'Selected route was not found.' };

    const passengersCount = data.passengers.length;
    if (passengersCount <= 0) return { success: false, error: 'At least one passenger must be specified.' };

    let totalFare = service.baseFare * passengersCount;
    let discountAmount = 0;

    // Apply coupon if provided
    if (data.couponCode) {
      const offer = this.state.offers.find(
        (o) => o.code.toUpperCase() === data.couponCode?.trim().toUpperCase() && o.isActive
      );
      if (offer && totalFare >= offer.minBookingAmount) {
        if (offer.eligibleChannels.includes(data.bookingChannel)) {
          if (offer.discountType === 'percentage') {
            discountAmount = Math.min((totalFare * offer.discountValue) / 100, offer.maxDiscount);
          } else {
            discountAmount = Math.min(offer.discountValue, offer.maxDiscount);
          }
        }
      }
    }

    const finalAmount = Math.max(0, totalFare - discountAmount);
    const bookingRef = `SFG-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      bookingRef,
      userId: this.state.currentUser.id,
      bookingChannel: data.bookingChannel,
      agentId: data.agentId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      serviceId: service.id,
      routeId: route.id,
      originCity: route.originCity,
      destinationCity: route.destinationCity,
      operatorName: service.operatorName,
      busType: service.busType,
      journeyDate: data.journeyDate,
      departureTime: service.departureTime,
      arrivalTime: service.arrivalTime,
      boardingPoint: data.boardingPoint,
      droppingPoint: data.droppingPoint,
      passengers: data.passengers,
      passengersCount,
      totalFare,
      discountAmount,
      couponCode: data.couponCode,
      finalAmount,
      status: 'pending', // Starts in pending manual review state
      operatorResponse: 'pending',
      assistanceStartedAt: new Date().toISOString(),
      assistanceTargetMinutes: 15,
      isDelayed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.bookings.unshift(newBooking);

    this.logAudit(
      this.state.currentUser.id,
      data.customerName,
      this.state.currentUser.role,
      'CREATE_BOOKING_REQUEST',
      'booking',
      newBooking.id,
      `Created booking request ${bookingRef} for ${route.originCity} -> ${route.destinationCity}`
    );

    this.save();
    return { success: true, booking: newBooking };
  }

  // --- Manual Booking Confirmation (Admin / Operator) ---
  public confirmBooking(params: {
    bookingId: string;
    operatorPnr: string;
    adminNotes?: string;
    confirmedBy: string;
  }): { success: boolean; error?: string } {
    const booking = this.state.bookings.find((b) => b.id === params.bookingId);
    if (!booking) return { success: false, error: 'Booking not found.' };

    if (!params.operatorPnr || params.operatorPnr.trim() === '') {
      return { success: false, error: 'Actual operator PNR is required to confirm a manual booking.' };
    }

    booking.status = 'confirmed';
    booking.operatorResponse = 'accepted';
    booking.operatorPnr = params.operatorPnr.trim();
    booking.internalNotes = params.adminNotes;
    booking.confirmedAt = new Date().toISOString();
    booking.confirmedBy = params.confirmedBy;
    booking.updatedAt = new Date().toISOString();

    // Commission Engine: Credit commission ONLY on genuine confirmation
    if (booking.agentId) {
      const agent = this.state.agents.find((a) => a.id === booking.agentId);
      if (agent) {
        // Prevent duplicate commission
        const exists = this.state.commissions.some((c) => c.bookingId === booking.id);
        if (!exists) {
          const commissionAmount = agent.agentType === 'go_agent' 
            ? this.state.goAgentConfig.commissionPerBooking 
            : 20.00;

          const commissionRec: CommissionRecord = {
            id: `com-${Date.now()}`,
            agentId: agent.id,
            bookingId: booking.id,
            bookingRef: booking.bookingRef,
            amount: commissionAmount,
            status: 'eligible',
            description: `Commission for confirmed booking ${booking.bookingRef}`,
            createdAt: new Date().toISOString(),
          };

          this.state.commissions.unshift(commissionRec);
          agent.pendingEarnings += commissionAmount;

          // Check referrals progress
          this.updateReferralProgress(agent.id);
        }
      }
    }

    this.logAudit(
      params.confirmedBy,
      this.state.currentUser.fullName,
      'admin',
      'CONFIRM_BOOKING',
      'booking',
      booking.id,
      `Confirmed booking ${booking.bookingRef} with operator PNR ${params.operatorPnr}`
    );

    this.save();
    return { success: true };
  }

  // --- Reject Booking ---
  public rejectBooking(params: {
    bookingId: string;
    rejectionReason: string;
    rejectedBy: string;
  }): { success: boolean; error?: string } {
    const booking = this.state.bookings.find((b) => b.id === params.bookingId);
    if (!booking) return { success: false, error: 'Booking not found.' };

    booking.status = 'rejected';
    booking.operatorResponse = 'rejected';
    booking.rejectionReason = params.rejectionReason;
    booking.updatedAt = new Date().toISOString();

    this.logAudit(
      params.rejectedBy,
      this.state.currentUser.fullName,
      'admin',
      'REJECT_BOOKING',
      'booking',
      booking.id,
      `Rejected booking ${booking.bookingRef}. Reason: ${params.rejectionReason}`
    );

    this.save();
    return { success: true };
  }

  // --- Cancellation & Refund Request ---
  public requestCancellation(params: {
    bookingId: string;
    reason: string;
    requestedBy: string;
  }): { success: boolean; error?: string } {
    const booking = this.state.bookings.find((b) => b.id === params.bookingId);
    if (!booking) return { success: false, error: 'Booking not found.' };

    if (['cancelled', 'refunded', 'cancellation_requested'].includes(booking.status)) {
      return { success: false, error: 'Booking is already cancelled or cancellation is under review.' };
    }

    booking.status = 'cancellation_requested';
    booking.updatedAt = new Date().toISOString();

    // Standard manual policy: 20% administrative deduction
    const deduction = booking.finalAmount * 0.20;
    const calculatedRefund = Math.max(0, booking.finalAmount - deduction);

    const refundReq: RefundRequest = {
      id: `refnd-${Date.now()}`,
      bookingId: booking.id,
      bookingRef: booking.bookingRef,
      requestedBy: params.requestedBy,
      reason: params.reason,
      calculatedRefund,
      deductionAmount: deduction,
      status: 'under_review',
      createdAt: new Date().toISOString(),
    };

    this.state.refundRequests.unshift(refundReq);

    this.logAudit(
      this.state.currentUser.id,
      params.requestedBy,
      this.state.currentUser.role,
      'REQUEST_CANCELLATION',
      'booking',
      booking.id,
      `Requested cancellation for ${booking.bookingRef}. Reason: ${params.reason}`
    );

    this.save();
    return { success: true };
  }

  // --- Process Refund (Admin) ---
  public processRefund(params: {
    refundRequestId: string;
    action: 'approve' | 'reject';
    adminNotes?: string;
    refundRef?: string;
  }): { success: boolean; error?: string } {
    const req = this.state.refundRequests.find((r) => r.id === params.refundRequestId);
    if (!req) return { success: false, error: 'Refund request not found.' };

    const booking = this.state.bookings.find((b) => b.id === req.bookingId);

    if (params.action === 'approve') {
      req.status = 'processed';
      req.refundRef = params.refundRef || `RFD-TXN-${Date.now()}`;
      req.adminNotes = params.adminNotes;
      req.processedAt = new Date().toISOString();

      if (booking) {
        booking.status = 'refunded';
        booking.updatedAt = new Date().toISOString();

        // Reverse agent commission if any was credited
        const com = this.state.commissions.find((c) => c.bookingId === booking.id);
        if (com && com.status === 'eligible') {
          com.status = 'reversed';
          const agent = this.state.agents.find((a) => a.id === com.agentId);
          if (agent) {
            agent.pendingEarnings = Math.max(0, agent.pendingEarnings - com.amount);
          }
        }
      }
    } else {
      req.status = 'rejected';
      req.adminNotes = params.adminNotes;
      if (booking) {
        booking.status = 'confirmed'; // Revert back
      }
    }

    this.logAudit(
      this.state.currentUser.id,
      this.state.currentUser.fullName,
      'admin',
      params.action === 'approve' ? 'PROCESS_REFUND' : 'REJECT_REFUND',
      'refund',
      req.id,
      `Processed refund request for ${req.bookingRef}`
    );

    this.save();
    return { success: true };
  }

  // --- Referral Engine ---
  private updateReferralProgress(refereeAgentId: string) {
    const referral = this.state.referrals.find((r) => r.refereeId === refereeAgentId);
    if (referral && referral.status === 'pending') {
      referral.completedBookingsCount += 1;
      if (referral.completedBookingsCount >= referral.requiredBookingsCount) {
        referral.status = 'eligible'; // Needs admin approval to payout
      }
    }
  }

  public approveReferralReward(referralId: string) {
    const ref = this.state.referrals.find((r) => r.id === referralId);
    if (!ref) return;

    ref.status = 'approved';
    ref.approvedAt = new Date().toISOString();

    const referrer = this.state.agents.find((a) => a.id === ref.referrerId);
    if (referrer) {
      referrer.pendingEarnings += ref.rewardAmount;
    }

    this.logAudit(
      this.state.currentUser.id,
      this.state.currentUser.fullName,
      'admin',
      'APPROVE_REFERRAL',
      'referral',
      referralId,
      `Approved referral reward ₹${ref.rewardAmount} for ${ref.referrerCode}`
    );

    this.save();
  }

  // --- Agricultural Marketplace ---
  public addCropListing(listing: Omit<CropListing, 'id' | 'createdAt'>) {
    const newListing: CropListing = {
      ...listing,
      id: `crop-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.state.cropListings.unshift(newListing);
    this.logAudit(
      this.state.currentUser.id,
      listing.farmerName,
      'farmer',
      'ADD_CROP_LISTING',
      'crop',
      newListing.id,
      `Added listing for ${listing.cropName} (${listing.quantityQuintals} Qtl)`
    );
    this.save();
  }

  public submitBuyerInquiry(inquiry: Omit<BuyerInquiry, 'id' | 'createdAt'>) {
    const newInquiry: BuyerInquiry = {
      ...inquiry,
      id: `inq-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.state.buyerInquiries.unshift(newInquiry);
    this.save();
  }

  public createTransportRequest(req: Omit<TransportRequest, 'id' | 'createdAt'>) {
    const newReq: TransportRequest = {
      ...req,
      id: `trp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.state.transportRequests.unshift(newReq);
    this.save();
  }

  // --- Support Tickets ---
  public createSupportTicket(ticket: Omit<SupportTicket, 'id' | 'ticketRef' | 'createdAt' | 'updatedAt'>) {
    const ticketRef = `TKT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket: SupportTicket = {
      ...ticket,
      id: `tkt-${Date.now()}`,
      ticketRef,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.supportTickets.unshift(newTicket);
    this.save();
    return newTicket;
  }

  // --- Audit Logging ---
  public logAudit(
    userId: string,
    userName: string,
    userRole: string,
    action: string,
    entityType: string,
    entityId: string,
    details: string
  ) {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      userName,
      userRole,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString(),
    };
    this.state.auditLogs.unshift(log);
    // Keep max 200 logs in memory
    if (this.state.auditLogs.length > 200) {
      this.state.auditLogs = this.state.auditLogs.slice(0, 200);
    }
  }

  // Reset to initial seed state
  public resetToSeed() {
    localStorage.removeItem(STORAGE_KEY);
    this.state = this.loadState();
    this.notify();
  }
}

// Singleton global instance
export const safarStore = new SafarGoStore();
