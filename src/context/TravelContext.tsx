import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  TravelService, 
  BusItem, 
  BusSeat, 
  StopPoint, 
  Passenger, 
  HotelItem, 
  HotelRoom, 
  CabItem, 
  TravelBooking,
  UserProfile,
  SavedCoPassenger,
  FIXED_AGENT_COMMISSION,
  AgentUser,
  WalletTopUpRequest,
  AdminQrConfig,
  SupportTicket,
  AgentReferral,
  PromoOffer,
  YoupiGatewayConfig,
  OpenWaGatewayConfig
} from '../types/travel';
import { MOCK_BUSES, getBusesForRoute } from '../data/busData';
import { MOCK_HOTELS } from '../data/hotelData';
import { MOCK_CABS } from '../data/cabData';
import { sendOnboardingSubmittedEmail, sendAgentApprovalEmail, sendTicketApprovalEmail } from '../lib/emailService';
import { getYoupiConfig, saveYoupiConfig } from '../lib/youpiPg';
import { 
  getOpenWaConfig, 
  saveOpenWaConfig, 
  sendOpenWaMessage, 
  formatTicketWhatsAppMessage, 
  formatAgentApprovalWhatsAppMessage 
} from '../lib/whatsappService';
import { triggerWithdrawalNotification } from '../lib/smsService';
import {
  fetchAgentsFromDb,
  saveAgentToDb,
  updateAgentInDb,
  deleteAgentFromDb,
  fetchBookingsFromDb,
  saveBookingToDb,
  updateBookingInDb,
  fetchFleetBusesFromDb,
  saveFleetBusToDb,
  deleteFleetBusFromDb,
  fetchWalletTopUpsFromDb,
  saveWalletTopUpToDb,
  updateWalletTopUpInDb,
  fetchSupportTicketsFromDb,
  saveSupportTicketToDb,
  updateSupportTicketInDb,
  fetchReferralsFromDb,
  saveReferralToDb,
  fetchAppConfigFromDb,
  saveAppConfigToDb,
  fetchPromoCodesFromDb,
  savePromoCodeToDb,
  updatePromoCodeInDb,
  deletePromoCodeFromDb
} from '../lib/supabase';

interface TravelContextType {
  // Navigation & Active Service
  activeService: TravelService;
  setActiveService: (service: TravelService) => void;
  currentStep: 'search' | 'bus_list' | 'seat_select' | 'boarding_select' | 'passenger_form' | 'booking_success' | 'hotel_detail' | 'hotel_success';
  setCurrentStep: (step: 'search' | 'bus_list' | 'seat_select' | 'boarding_select' | 'passenger_form' | 'booking_success' | 'hotel_detail' | 'hotel_success') => void;

  // Bus Search & Filters
  fromCity: string;
  setFromCity: (city: string) => void;
  toCity: string;
  setToCity: (city: string) => void;
  journeyDate: string;
  setJourneyDate: (date: string) => void;
  swapCities: () => void;
  buses: BusItem[];
  filteredBuses: BusItem[];
  busFilter: 'all' | 'ac' | 'sleeper' | 'primo';
  setBusFilter: (filter: 'all' | 'ac' | 'sleeper' | 'primo') => void;

  // Selected Bus & Seat Layout
  selectedBus: BusItem | null;
  setSelectedBus: (bus: BusItem | null) => void;
  selectedSeats: BusSeat[];
  toggleSeatSelection: (seat: BusSeat) => void;
  clearSeatSelection: () => void;
  selectedBoardingPoint: StopPoint | null;
  setSelectedBoardingPoint: (point: StopPoint | null) => void;
  selectedDroppingPoint: StopPoint | null;
  setSelectedDroppingPoint: (point: StopPoint | null) => void;
  passengers: Passenger[];
  setPassengers: (p: Passenger[]) => void;

  // Hotel Search & Booking
  hotelCity: string;
  setHotelCity: (city: string) => void;
  checkInDate: string;
  setCheckInDate: (date: string) => void;
  checkOutDate: string;
  setCheckOutDate: (date: string) => void;
  guestsCount: number;
  setGuestsCount: (count: number) => void;
  hotels: HotelItem[];
  selectedHotel: HotelItem | null;
  setSelectedHotel: (hotel: HotelItem | null) => void;
  selectedRoom: HotelRoom | null;
  setSelectedRoom: (room: HotelRoom | null) => void;

  // Cabs
  cabs: CabItem[];
  selectedCab: CabItem | null;
  setSelectedCab: (cab: CabItem | null) => void;

  // Bookings & History
  bookings: TravelBooking[];
  latestBooking: TravelBooking | null;
  confirmBusBooking: (
    paymentMethod: 'upi' | 'card' | 'netbanking' | 'pay_at_bus' | 'youpi_pg', 
    contact: { fullName: string; mobile: string; email: string },
    utr?: string,
    youpiDetails?: { paymentId?: string; status?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED' }
  ) => TravelBooking;
  confirmHotelBooking: (paymentMethod: any, contact: any) => TravelBooking;
  cancelBooking: (pnr: string) => void;
  verifyBusBooking: (bookingId: string) => Promise<boolean>;
  rejectBusBooking: (bookingId: string, reason?: string, suspendAgentUser?: boolean) => void;

  // Agent Portal, Login & Onboarding
  isAgentMode: boolean;
  setIsAgentMode: (enabled: boolean) => void;
  isAgentLoggedIn: boolean;
  setIsAgentLoggedIn: (val: boolean) => void;
  isCustomerLoggedIn: boolean;
  setIsCustomerLoggedIn: (val: boolean) => void;
  customerLogin: (data: { name?: string; phone: string; email?: string }) => void;
  customerLogout: () => void;
  currentAgent: AgentUser | null;
  setCurrentAgent: (agent: AgentUser | null) => void;
  agentWalletBalance: number;
  agentPayoutHistory: { id: string; amount: number; date: string; utr: string; destination?: string }[];
  withdrawAgentEarnings: (amount: number, details: { type: 'upi' | 'bank'; destination: string }) => boolean;
  creditAgentWalletCommission: (amount: number, reason?: string) => void;
  agentLogin: (mobileOrEmail: string, pass?: string) => { success: boolean; reason?: 'pending' | 'invalid'; message?: string; agent?: AgentUser };
  agentRegister: (data: Omit<AgentUser, 'id' | 'isApproved'>) => Promise<AgentUser>;
  agentLogout: () => void;
  agentApplications: AgentUser[];
  approveAgent: (agentId: string) => Promise<boolean>;
  rejectAgent: (agentId: string) => void;
  suspendAgent: (agentId: string, reason?: string) => void;
  reactivateAgent: (agentId: string) => void;
  updateAgent: (agentId: string, patch: Partial<AgentUser>) => void;
  setAgentPassword: (emailOrId: string, newPass: string) => boolean;
  uploadAgentPhoto: (agentId: string, photoUrl: string) => boolean;
  deleteAgentAccount: (agentId: string) => boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  requireAuth: (callback?: () => void) => boolean;

  // Language & i18n
  language: 'hi' | 'en';
  toggleLanguage: () => void;
  t: (hiText: string, enText: string) => string;

  // User Profile & Account
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  savedPassengers: SavedCoPassenger[];
  addSavedPassenger: (p: Omit<SavedCoPassenger, 'id'>) => void;
  removeSavedPassenger: (id: string) => void;
  addWalletCash: (amount: number) => void;

  // Bus Management (Fleet Admin)
  addBus: (bus: Omit<BusItem, 'id'>) => BusItem;
  deleteBus: (busId: string) => void;
  updateBus: (busId: string, patch: Partial<BusItem>) => void;

  // Wallet Top-Up & Anti-Fraud Security System
  walletTopUpRequests: WalletTopUpRequest[];
  submitWalletTopUp: (amount: number, utr: string, agentOverride?: AgentUser) => { success: boolean; message: string; request?: WalletTopUpRequest };
  verifyTopUpRequest: (requestId: string) => void;
  suspendFraudTopUp: (requestId: string, reason: string) => void;
  adminQrConfig: AdminQrConfig;
  updateAdminQrConfig: (config: Partial<AdminQrConfig>) => void;

  // Support Tickets System
  supportTickets: SupportTicket[];
  createSupportTicket: (ticket: {
    bookingPnr?: string;
    category: SupportTicket['category'];
    subject: string;
    description: string;
  }) => SupportTicket;
  closeSupportTicket: (ticketId: string) => void;
  resolveSupportTicket: (ticketId: string, note?: string) => void;

  // Agent Referral & Earn Program
  agentReferrals: AgentReferral[];
  creditReferralBonus: (referralId: string, type: 'verification' | 'booking_five') => void;

  // Promo Codes & Offers Management
  promoOffers: PromoOffer[];
  addPromoOffer: (offer: Omit<PromoOffer, 'id' | 'usageCount' | 'createdAt'>) => PromoOffer;
  togglePromoOfferStatus: (offerId: string, status: 'active' | 'expired') => void;
  deletePromoOffer: (offerId: string) => void;
  applyPromoCode: (code: string, fare: number, service?: 'bus' | 'hotel') => { success: boolean; discount: number; message: string; offer?: PromoOffer };

  // Payment & WhatsApp Gateway Integration
  youpiConfig: YoupiGatewayConfig;
  updateYoupiConfig: (cfg: Partial<YoupiGatewayConfig>) => void;
  openWaConfig: OpenWaGatewayConfig;
  updateOpenWaConfig: (cfg: Partial<OpenWaGatewayConfig>) => void;
  sendBookingWhatsApp: (booking: TravelBooking, customPhone?: string) => Promise<{ success: boolean; method: 'openwa_api' | 'whatsapp_web'; message: string; directWebUrl?: string }>;
}

const DEFAULT_BOOKINGS: TravelBooking[] = [];

const TravelContext = createContext<TravelContextType | undefined>(undefined);

export const ADMIN_EMAILS = ['jia647155@gmail.com', 'jia647155@gmali.com'];

export const ADMIN_USER: AgentUser = {
  id: 'SFG-ADMIN-001',
  fullName: 'Jia SafarGo (Super Admin)',
  mobile: '9811000001',
  email: 'jia647155@gmail.com',
  shopName: 'SafarGo Central Head Office',
  businessType: 'admin',
  city: 'Indore',
  address: 'SafarGo HQ, Vijay Nagar, Indore',
  pincode: '452010',
  panNumber: 'ADMIN1234F',
  aadhaarNumber: '999988887777',
  accountHolder: 'SafarGo Super Admin',
  accountNumber: '999900001111',
  ifsc: 'SBIN0001234',
  bankName: 'State Bank of India (SBI)',
  settlementUpiId: 'jia647155@upi',
  isApproved: true,
  role: 'admin',
  appliedDate: '18 Oct 2026'
};

const DEFAULT_APPLICATIONS: AgentUser[] = [];

const DEFAULT_QR_CONFIG: AdminQrConfig = {
  merchantUpiId: 'safargo.pay@icici',
  merchantName: 'SafarGo Mobility Network Pvt Ltd',
  qrCodeImageUrl: ''
};

const DEFAULT_TOPUPS: WalletTopUpRequest[] = [];

const DEFAULT_SUPPORT_TICKETS: SupportTicket[] = [];

const DEFAULT_REFERRALS: AgentReferral[] = [];

const DEFAULT_PROMOS: PromoOffer[] = [
  {
    id: 'promo-1',
    code: 'SAFARFIRST',
    title: 'First Booking Special',
    description: 'Flat ₹150 off on first bus booking',
    discountType: 'fixed',
    discountValue: 150,
    minBookingAmount: 300,
    serviceType: 'bus',
    validTill: '31 Dec 2026',
    status: 'active',
    usageCount: 42,
    createdAt: '18 Oct 2026'
  },
  {
    id: 'promo-2',
    code: 'SAFARGO250',
    title: 'Festival Mega Discount',
    description: 'Save ₹250 on bookings above ₹999',
    discountType: 'fixed',
    discountValue: 250,
    minBookingAmount: 999,
    serviceType: 'all',
    validTill: '15 Nov 2026',
    status: 'active',
    usageCount: 18,
    createdAt: '18 Oct 2026'
  },
  {
    id: 'promo-3',
    code: 'HOTELSTAY50',
    title: 'Hotel Super Saver',
    description: '50% off on first luxury hotel stay up to ₹500',
    discountType: 'percentage',
    discountValue: 50,
    minBookingAmount: 1000,
    serviceType: 'hotel',
    validTill: '30 Nov 2026',
    status: 'active',
    usageCount: 9,
    createdAt: '18 Oct 2026'
  }
];

export const TravelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeService, setActiveServiceInternal] = useState<TravelService>('bus');
  const [currentStep, setCurrentStep] = useState<'search' | 'bus_list' | 'seat_select' | 'boarding_select' | 'passenger_form' | 'booking_success' | 'hotel_detail' | 'hotel_success'>('search');

  // Bus Search Inputs
  const [fromCity, setFromCity] = useState('Delhi');
  const [toCity, setToCity] = useState('Jaipur');
  const [journeyDate, setJourneyDate] = useState('Today, 18 Oct');
  const [busFilter, setBusFilter] = useState<'all' | 'ac' | 'sleeper' | 'primo'>('all');

  // Bus Fleet Management State
  const [busesList, setBusesList] = useState<BusItem[]>(() => {
    try {
      const saved = localStorage.getItem('safargo_custom_buses');
      return saved ? JSON.parse(saved) : MOCK_BUSES;
    } catch {
      return MOCK_BUSES;
    }
  });

  const addBus = (busData: Omit<BusItem, 'id'>): BusItem => {
    const newBus: BusItem = {
      ...busData,
      id: `bus-sfg-${Date.now()}`
    };
    const updated = [newBus, ...busesList];
    setBusesList(updated);
    localStorage.setItem('safargo_custom_buses', JSON.stringify(updated));
    saveFleetBusToDb(newBus).catch(err => console.warn('Supabase saveFleetBus error:', err));
    return newBus;
  };

  const deleteBus = (busId: string) => {
    const updated = busesList.filter(b => b.id !== busId);
    setBusesList(updated);
    localStorage.setItem('safargo_custom_buses', JSON.stringify(updated));
    deleteFleetBusFromDb(busId).catch(err => console.warn('Supabase deleteFleetBus error:', err));
  };

  const updateBus = (busId: string, patch: Partial<BusItem>) => {
    const updated = busesList.map(b => b.id === busId ? { ...b, ...patch } : b);
    setBusesList(updated);
    localStorage.setItem('safargo_custom_buses', JSON.stringify(updated));
    const modified = updated.find(b => b.id === busId);
    if (modified) {
      saveFleetBusToDb(modified).catch(err => console.warn('Supabase updateFleetBus error:', err));
    }
  };

  // QR Code Admin Config
  const [adminQrConfig, setAdminQrConfig] = useState<AdminQrConfig>(() => {
    try {
      const saved = localStorage.getItem('safargo_admin_qr_config');
      return saved ? JSON.parse(saved) : DEFAULT_QR_CONFIG;
    } catch {
      return DEFAULT_QR_CONFIG;
    }
  });

  const updateAdminQrConfig = (patch: Partial<AdminQrConfig>) => {
    setAdminQrConfig(prev => {
      const next = { ...prev, ...patch };
      localStorage.setItem('safargo_admin_qr_config', JSON.stringify(next));
      saveAppConfigToDb('admin_qr_config', next).catch(err => console.warn('Supabase saveAppConfig error:', err));
      return next;
    });
  };

  // Payment & WhatsApp Gateway Integration States
  const [youpiConfig, setYoupiConfigState] = useState<YoupiGatewayConfig>(() => getYoupiConfig());
  const [openWaConfig, setOpenWaConfigState] = useState<OpenWaGatewayConfig>(() => getOpenWaConfig());

  const updateYoupiConfig = (cfg: Partial<YoupiGatewayConfig>) => {
    const updated = saveYoupiConfig(cfg);
    setYoupiConfigState(updated);
  };

  const updateOpenWaConfig = (cfg: Partial<OpenWaGatewayConfig>) => {
    const updated = saveOpenWaConfig(cfg);
    setOpenWaConfigState(updated);
  };

  const sendBookingWhatsApp = async (
    booking: TravelBooking, 
    customPhone?: string
  ): Promise<{ success: boolean; method: 'openwa_api' | 'whatsapp_web'; message: string; directWebUrl?: string }> => {
    const targetPhone = customPhone || booking.passengerDetails.mobile;
    const msg = formatTicketWhatsAppMessage(booking);
    const result = await sendOpenWaMessage(targetPhone, msg);
    
    // Mark whatsAppStatus on booking
    const updated = bookings.map(b => {
      if (b.id === booking.id || b.pnr === booking.pnr) {
        return {
          ...b,
          whatsAppStatus: (result.success ? 'sent' : 'pending') as 'sent' | 'pending',
          whatsAppSentAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        };
      }
      return b;
    });
    setBookings(updated);
    try {
      localStorage.setItem('safargo_travel_bookings', JSON.stringify(updated));
    } catch {}

    return result;
  };

  // Wallet Top Up Requests & Anti-Fraud Security
  const [walletTopUpRequests, setWalletTopUpRequests] = useState<WalletTopUpRequest[]>(() => {
    try {
      const saved = localStorage.getItem('safargo_wallet_topups');
      return saved ? JSON.parse(saved) : DEFAULT_TOPUPS;
    } catch {
      return DEFAULT_TOPUPS;
    }
  });

  const submitWalletTopUp = (
    amount: number, 
    utr: string, 
    agentOverride?: AgentUser
  ): { success: boolean; message: string; request?: WalletTopUpRequest } => {
    const cleanUtr = utr.trim().toUpperCase();
    if (cleanUtr.length < 10) {
      return { 
        success: false, 
        message: 'कृपया वैध 12-अंकीय बैंक UTR / रेफरेंस नंबर दर्ज करें।' 
      };
    }

    // 1. Strict Duplicate Check across all submitted top-up requests
    const isDuplicate = walletTopUpRequests.some(r => r.utr === cleanUtr);
    if (isDuplicate) {
      return { 
        success: false, 
        message: '⚠️ यह UTR संख्या पहले ही उपयोग की जा चुकी है! एक ही UTR से दोबारा पैसे जोड़ना दंडनीय अपराध है। धोखाधड़ी के प्रयास पर आपकी आईडी सस्पेंड की जा सकती है।' 
      };
    }

    const activeUser = agentOverride || currentAgent || {
      id: 'SFG-USER-' + userProfile.phone.slice(-4),
      fullName: userProfile.name,
      shopName: 'SafarGo Personal Account',
      mobile: userProfile.phone
    };

    const newReq: WalletTopUpRequest = {
      id: `topup-${Date.now()}`,
      agentId: activeUser.id,
      agentName: activeUser.fullName,
      shopName: (activeUser as any).shopName || 'SafarGo Partner Kiosk',
      mobile: activeUser.mobile,
      amount,
      utr: cleanUtr,
      date: new Date().toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      status: 'pending_audit'
    };

    const updated = [newReq, ...walletTopUpRequests];
    setWalletTopUpRequests(updated);
    localStorage.setItem('safargo_wallet_topups', JSON.stringify(updated));
    saveWalletTopUpToDb(newReq).catch(err => console.warn('Supabase saveWalletTopUp error:', err));

    // Automatically credit wallet
    if (currentAgent) {
      const nextBal = Number((agentWalletBalance + amount).toFixed(2));
      setAgentWalletBalance(nextBal);
      localStorage.setItem('safargo_agent_wallet', JSON.stringify(nextBal));
    } else {
      addWalletCash(amount);
    }

    return {
      success: true,
      message: `₹${amount.toFixed(2)} सफलतापूर्वक आपके वॉलेट में जोड़ दिए गए हैं! UTR ${cleanUtr} ऑडिट हेतु सुरक्षित दर्ज है।`,
      request: newReq
    };
  };

  const verifyTopUpRequest = (requestId: string) => {
    const updated = walletTopUpRequests.map(r => r.id === requestId ? { ...r, status: 'verified' as const } : r);
    setWalletTopUpRequests(updated);
    localStorage.setItem('safargo_wallet_topups', JSON.stringify(updated));
    updateWalletTopUpInDb(requestId, { status: 'verified' }).catch(err => console.warn('Supabase verifyTopUp error:', err));
  };

  const suspendFraudTopUp = (requestId: string, reason: string) => {
    const req = walletTopUpRequests.find(r => r.id === requestId);
    if (!req) return;

    const defaultReason = reason || 'फर्जी UTR / भुगतान धोखाधड़ी (Fake UTR Wallet Fraud)';
    const updated = walletTopUpRequests.map(r => r.id === requestId ? { 
      ...r, 
      status: 'fraud_suspended' as const, 
      isFlaggedFake: true, 
      rejectionReason: defaultReason 
    } : r);

    setWalletTopUpRequests(updated);
    localStorage.setItem('safargo_wallet_topups', JSON.stringify(updated));
    updateWalletTopUpInDb(requestId, {
      status: 'fraud_suspended',
      isFlaggedFake: true,
      rejectionReason: defaultReason
    }).catch(err => console.warn('Supabase suspendFraudTopUp error:', err));

    // Deduct the fake credited amount from wallet
    if (currentAgent && currentAgent.id === req.agentId) {
      const nextBal = Math.max(0, Number((agentWalletBalance - req.amount).toFixed(2)));
      setAgentWalletBalance(nextBal);
      localStorage.setItem('safargo_agent_wallet', JSON.stringify(nextBal));
    } else {
      setUserProfile(prev => {
        const next = { ...prev, walletBalance: Math.max(0, prev.walletBalance - req.amount) };
        localStorage.setItem('safargo_user_profile', JSON.stringify(next));
        return next;
      });
    }

    // Suspend the fraudulent agent's account
    suspendAgent(req.agentId, defaultReason);
  };

  // Support Tickets System State & Methods
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    try {
      const saved = localStorage.getItem('safargo_support_tickets');
      return saved ? JSON.parse(saved) : DEFAULT_SUPPORT_TICKETS;
    } catch {
      return DEFAULT_SUPPORT_TICKETS;
    }
  });

  const createSupportTicket = (ticket: {
    bookingPnr?: string;
    category: SupportTicket['category'];
    subject: string;
    description: string;
  }): SupportTicket => {
    const activePhone = currentAgent?.mobile || userProfile.phone || '';
    const activeName = currentAgent?.fullName || userProfile.name || 'SafarGo User';
    const newTkt: SupportTicket = {
      id: `TKT-2026-${Math.floor(100 + Math.random() * 900)}`,
      bookingPnr: ticket.bookingPnr,
      category: ticket.category,
      subject: ticket.subject,
      description: ticket.description,
      status: 'pending',
      createdAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      lastUpdated: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      resolutionNote: 'सफ़रगो ग्राहक सहायता डेस्क द्वारा समीक्षा की जा रही है।',
      userMobile: activePhone,
      userName: activeName
    };
    const updated = [newTkt, ...supportTickets];
    setSupportTickets(updated);
    localStorage.setItem('safargo_support_tickets', JSON.stringify(updated));
    saveSupportTicketToDb(newTkt).catch(err => console.warn('Supabase saveSupportTicket error:', err));
    return newTkt;
  };

  const closeSupportTicket = (ticketId: string) => {
    const updated = supportTickets.map(t => t.id === ticketId ? { 
      ...t, 
      status: 'closed' as const, 
      lastUpdated: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
    } : t);
    setSupportTickets(updated);
    localStorage.setItem('safargo_support_tickets', JSON.stringify(updated));
    updateSupportTicketInDb(ticketId, {
      status: 'closed',
      lastUpdated: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    }).catch(err => console.warn('Supabase closeTicket error:', err));
  };

  const resolveSupportTicket = (ticketId: string, note?: string) => {
    const resolvedNote = note || 'समस्या का समाधान कर दिया गया है।';
    const updated = supportTickets.map(t => t.id === ticketId ? { 
      ...t, 
      status: 'resolved' as const, 
      resolutionNote: resolvedNote,
      lastUpdated: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
    } : t);
    setSupportTickets(updated);
    localStorage.setItem('safargo_support_tickets', JSON.stringify(updated));
    updateSupportTicketInDb(ticketId, {
      status: 'resolved',
      resolutionNote: resolvedNote,
      lastUpdated: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    }).catch(err => console.warn('Supabase resolveTicket error:', err));
  };

  // Agent Referral & Earn Program State & Methods
  const [agentReferrals, setAgentReferrals] = useState<AgentReferral[]>(() => {
    try {
      const saved = localStorage.getItem('safargo_agent_referrals');
      return saved ? JSON.parse(saved) : DEFAULT_REFERRALS;
    } catch {
      return DEFAULT_REFERRALS;
    }
  });

  const creditReferralBonus = (referralId: string, type: 'verification' | 'booking_five') => {
    const ref = agentReferrals.find(r => r.id === referralId);
    if (!ref) return;

    if (type === 'verification' && !ref.verificationRewardPaid) {
      const updated = agentReferrals.map(r => r.id === referralId ? {
        ...r,
        isVerified: true,
        verificationRewardPaid: true,
        totalEarned: r.totalEarned + 10
      } : r);
      setAgentReferrals(updated);
      localStorage.setItem('safargo_agent_referrals', JSON.stringify(updated));
      const refUpdated = updated.find(r => r.id === referralId);
      if (refUpdated) saveReferralToDb(refUpdated).catch(err => console.warn('Supabase saveReferral error:', err));

      // Instant credit ₹10 to agent wallet!
      setAgentWalletBalance(prev => {
        const next = Number((prev + 10).toFixed(2));
        localStorage.setItem('safargo_agent_wallet', JSON.stringify(next));
        return next;
      });
    } else if (type === 'booking_five' && !ref.completionRewardPaid) {
      const updated = agentReferrals.map(r => r.id === referralId ? {
        ...r,
        completedBookings: 5,
        completionRewardPaid: true,
        totalEarned: r.totalEarned + 50
      } : r);
      setAgentReferrals(updated);
      localStorage.setItem('safargo_agent_referrals', JSON.stringify(updated));
      const refUpdated = updated.find(r => r.id === referralId);
      if (refUpdated) saveReferralToDb(refUpdated).catch(err => console.warn('Supabase saveReferral error:', err));

      // Instant credit ₹50 to agent wallet!
      setAgentWalletBalance(prev => {
        const next = Number((prev + 50).toFixed(2));
        localStorage.setItem('safargo_agent_wallet', JSON.stringify(next));
        return next;
      });
    }
  };

  // Promo Codes & Offers Management
  const [promoOffers, setPromoOffers] = useState<PromoOffer[]>(() => {
    try {
      const saved = localStorage.getItem('safargo_promo_offers');
      return saved ? JSON.parse(saved) : DEFAULT_PROMOS;
    } catch {
      return DEFAULT_PROMOS;
    }
  });

  const addPromoOffer = (data: Omit<PromoOffer, 'id' | 'usageCount' | 'createdAt'>): PromoOffer => {
    const newOffer: PromoOffer = {
      ...data,
      code: data.code.trim().toUpperCase(),
      id: `promo-${Date.now()}`,
      usageCount: 0,
      createdAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    const updated = [newOffer, ...promoOffers];
    setPromoOffers(updated);
    localStorage.setItem('safargo_promo_offers', JSON.stringify(updated));
    savePromoCodeToDb(newOffer).catch(err => console.warn('Supabase savePromoCode error:', err));
    return newOffer;
  };

  const togglePromoOfferStatus = (offerId: string, status: 'active' | 'expired') => {
    const updated = promoOffers.map(p => p.id === offerId ? { ...p, status } : p);
    setPromoOffers(updated);
    localStorage.setItem('safargo_promo_offers', JSON.stringify(updated));
    updatePromoCodeInDb(offerId, { status }).catch(err => console.warn('Supabase updatePromoCode error:', err));
  };

  const deletePromoOffer = (offerId: string) => {
    const updated = promoOffers.filter(p => p.id !== offerId);
    setPromoOffers(updated);
    localStorage.setItem('safargo_promo_offers', JSON.stringify(updated));
    deletePromoCodeFromDb(offerId).catch(err => console.warn('Supabase deletePromoCode error:', err));
  };

  const applyPromoCode = (code: string, fare: number, service: 'bus' | 'hotel' = 'bus') => {
    const normalized = code.trim().toUpperCase();
    const offer = promoOffers.find(p => p.code.toUpperCase() === normalized);

    if (!offer) {
      return { success: false, discount: 0, message: 'अमान्य प्रोमो कोड (Invalid Promo Code)' };
    }

    if (offer.status === 'expired') {
      return { success: false, discount: 0, message: '⚠️ यह प्रोमो कोड एक्सपायर हो चुका है! (Code Expired)' };
    }

    if (offer.serviceType !== 'all' && offer.serviceType !== service) {
      return { 
        success: false, 
        discount: 0, 
        message: `यह कोड केवल ${offer.serviceType === 'bus' ? 'बस' : 'होटल'} बुकिंग पर मान्य है` 
      };
    }

    if (fare < offer.minBookingAmount) {
      return { 
        success: false, 
        discount: 0, 
        message: `न्यूनतम बुकिंग मूल्य ₹${offer.minBookingAmount} होना आवश्यक है` 
      };
    }

    let discount = 0;
    if (offer.discountType === 'fixed') {
      discount = Math.min(offer.discountValue, fare);
    } else {
      discount = Math.min(Math.round((fare * offer.discountValue) / 100), 500);
    }

    return { 
      success: true, 
      discount, 
      message: `बधाई! ₹${discount} की छूट सफलतापूर्वक लागू हो गई`, 
      offer 
    };
  };

  // Selected Bus & Seat Selection
  const [selectedBus, setSelectedBus] = useState<BusItem | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<BusSeat[]>([]);
  const [selectedBoardingPoint, setSelectedBoardingPoint] = useState<StopPoint | null>(null);
  const [selectedDroppingPoint, setSelectedDroppingPoint] = useState<StopPoint | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([]);

  // Hotel Search
  const [hotelCity, setHotelCity] = useState('Jaipur');
  const [checkInDate, setCheckInDate] = useState('18 Oct 2026');
  const [checkOutDate, setCheckOutDate] = useState('20 Oct 2026');
  const [guestsCount, setGuestsCount] = useState(2);
  const [selectedHotel, setSelectedHotel] = useState<HotelItem | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(null);

  // Cab
  const [selectedCab, setSelectedCab] = useState<CabItem | null>(null);

  // Persistence helpers
  const [bookings, setBookings] = useState<TravelBooking[]>(() => {
    try {
      const saved = localStorage.getItem('safargo_travel_bookings');
      return saved ? JSON.parse(saved) : DEFAULT_BOOKINGS;
    } catch {
      return DEFAULT_BOOKINGS;
    }
  });

  const [latestBooking, setLatestBooking] = useState<TravelBooking | null>(null);

  // Agent State (with Fixed ₹19.34 Commission and Instant Withdrawal System)
  const [isAgentMode, setIsAgentMode] = useState(false);
  const [agentWalletBalance, setAgentWalletBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('safargo_agent_wallet');
      return saved ? JSON.parse(saved) : 0;
    } catch {
      return 0;
    }
  });
  const [agentPayoutHistory, setAgentPayoutHistory] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('safargo_agent_payouts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const withdrawAgentEarnings = (amount: number, details: { type: 'upi' | 'bank'; destination: string }): boolean => {
    if (amount <= 0 || amount > agentWalletBalance) {
      alert('Withdrawal amount exceeds available balance.');
      return false;
    }

    const utr = `UTR${Math.floor(100000000 + Math.random() * 900000000)}`;
    const newPayout = {
      id: `wdr-${Date.now()}`,
      amount,
      date: 'Today, ' + new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      utr,
      destination: details.destination
    };

    const updatedBalance = Number((agentWalletBalance - amount).toFixed(2));
    setAgentWalletBalance(updatedBalance);
    localStorage.setItem('safargo_agent_wallet', JSON.stringify(updatedBalance));

    setAgentPayoutHistory(prev => {
      const updated = [newPayout, ...prev];
      localStorage.setItem('safargo_agent_payouts', JSON.stringify(updated));
      return updated;
    });

    // Dispatch instant real-time withdrawal notification (UI Toast banner, chime sound, WhatsApp alert)
    triggerWithdrawalNotification({
      amount,
      destination: details.destination,
      utr,
      agentName: currentAgent?.fullName,
      mobile: currentAgent?.mobile
    });

    return true;
  };

  const creditAgentWalletCommission = (amount: number, _reason?: string) => {
    if (amount <= 0) return;
    setAgentWalletBalance(prev => {
      const updated = Number((prev + amount).toFixed(2));
      localStorage.setItem('safargo_agent_wallet', JSON.stringify(updated));
      return updated;
    });
  };

  // Agent Applications Repository & Approvals
  const [agentApplications, setAgentApplications] = useState<AgentUser[]>(() => {
    try {
      const saved = localStorage.getItem('safargo_agent_applications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Exclude any legacy mock agent (Rajesh Verma)
          return parsed.filter(a => a.id !== 'SFG-AGENT-2026-9041' && !a.email?.includes('rajesh'));
        }
      }
      return DEFAULT_APPLICATIONS;
    } catch {
      return DEFAULT_APPLICATIONS;
    }
  });

  const [isAgentLoggedIn, setIsAgentLoggedIn] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('safargo_agent_logged_in');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('safargo_customer_logged_in');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const customerLogin = (data: { name?: string; phone: string; email?: string }) => {
    const cleanPhone = (data.phone || '').trim();
    const cleanName = (data.name || '').trim() || (userProfile.name || 'SafarGo ग्राहक');
    const cleanEmail = (data.email || '').trim() || (userProfile.email || `user.${cleanPhone.slice(-4) || '9999'}@safargo.in`);

    const updatedProfile: UserProfile = {
      ...userProfile,
      name: cleanName,
      phone: cleanPhone || userProfile.phone || '9876543210',
      email: cleanEmail
    };

    setUserProfile(updatedProfile);
    localStorage.setItem('safargo_user_profile', JSON.stringify(updatedProfile));
    setIsCustomerLoggedIn(true);
    localStorage.setItem('safargo_customer_logged_in', 'true');
    setIsAuthModalOpen(false);
  };

  const customerLogout = () => {
    setIsCustomerLoggedIn(false);
    localStorage.setItem('safargo_customer_logged_in', 'false');
    localStorage.removeItem('safargo_customer_logged_in');
  };

  const [currentAgent, setCurrentAgent] = useState<AgentUser | null>(() => {
    try {
      const saved = localStorage.getItem('safargo_current_agent');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Clean out any legacy demo agent
        if (parsed?.id === 'SFG-AGENT-2026-9041' || parsed?.email?.includes('rajesh') || parsed?.fullName?.includes('Rajesh Verma')) {
          localStorage.removeItem('safargo_current_agent');
          localStorage.setItem('safargo_agent_logged_in', 'false');
          return null;
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  // ==========================================
  // REAL SUPABASE DATABASE SYNCHRONIZATION
  // ==========================================
  useEffect(() => {
    let isMounted = true;
    const syncSupabase = async () => {
      try {
        // 1. Sync Agents
        const dbAgents = await fetchAgentsFromDb();
        if (isMounted && dbAgents && dbAgents.length > 0) {
          setAgentApplications(prev => {
            const map = new Map<string, AgentUser>();
            dbAgents.forEach(a => map.set(a.id, a));
            prev.forEach(p => { if (!map.has(p.id)) map.set(p.id, p); });
            const merged = Array.from(map.values());
            localStorage.setItem('safargo_agent_applications', JSON.stringify(merged));
            return merged;
          });
        }

        // 2. Sync Bookings
        const dbBookings = await fetchBookingsFromDb();
        if (isMounted && dbBookings && dbBookings.length > 0) {
          setBookings(prev => {
            const map = new Map<string, TravelBooking>();
            dbBookings.forEach(b => map.set(b.id, b));
            prev.forEach(p => { if (!map.has(p.id)) map.set(p.id, p); });
            const merged = Array.from(map.values());
            localStorage.setItem('safargo_travel_bookings', JSON.stringify(merged));
            return merged;
          });
        }

        // 3. Sync Fleet Buses
        const dbBuses = await fetchFleetBusesFromDb();
        if (isMounted && dbBuses && dbBuses.length > 0) {
          setBusesList(prev => {
            const map = new Map<string, BusItem>();
            dbBuses.forEach(b => map.set(b.id, b));
            prev.forEach(p => { if (!map.has(p.id)) map.set(p.id, p); });
            const merged = Array.from(map.values());
            localStorage.setItem('safargo_custom_buses', JSON.stringify(merged));
            return merged;
          });
        }

        // 4. Sync Wallet Top-ups
        const dbTopups = await fetchWalletTopUpsFromDb();
        if (isMounted && dbTopups && dbTopups.length > 0) {
          setWalletTopUpRequests(prev => {
            const map = new Map<string, WalletTopUpRequest>();
            dbTopups.forEach(t => map.set(t.id, t));
            prev.forEach(p => { if (!map.has(p.id)) map.set(p.id, p); });
            const merged = Array.from(map.values());
            localStorage.setItem('safargo_wallet_topups', JSON.stringify(merged));
            return merged;
          });
        }

        // 5. Sync Support Tickets
        const dbTickets = await fetchSupportTicketsFromDb();
        if (isMounted && dbTickets && dbTickets.length > 0) {
          setSupportTickets(prev => {
            const map = new Map<string, SupportTicket>();
            dbTickets.forEach(t => map.set(t.id, t));
            prev.forEach(p => { if (!map.has(p.id)) map.set(p.id, p); });
            const merged = Array.from(map.values());
            localStorage.setItem('safargo_support_tickets', JSON.stringify(merged));
            return merged;
          });
        }

        // 6. Sync Referrals
        const dbRefs = await fetchReferralsFromDb();
        if (isMounted && dbRefs && dbRefs.length > 0) {
          setAgentReferrals(prev => {
            const map = new Map<string, AgentReferral>();
            dbRefs.forEach(r => map.set(r.id, r));
            prev.forEach(p => { if (!map.has(p.id)) map.set(p.id, p); });
            const merged = Array.from(map.values());
            localStorage.setItem('safargo_agent_referrals', JSON.stringify(merged));
            return merged;
          });
        }

        // 7. Sync QR Config
        const dbQr = await fetchAppConfigFromDb('admin_qr_config');
        if (isMounted && dbQr) {
          setAdminQrConfig(dbQr);
          localStorage.setItem('safargo_admin_qr_config', JSON.stringify(dbQr));
        }

        // 8. Sync Promo Codes & Offers
        const dbPromos = await fetchPromoCodesFromDb();
        if (isMounted && dbPromos && dbPromos.length > 0) {
          setPromoOffers(prev => {
            const map = new Map<string, PromoOffer>();
            dbPromos.forEach(p => map.set(p.id, p));
            prev.forEach(p => { if (!map.has(p.id)) map.set(p.id, p); });
            const merged = Array.from(map.values());
            localStorage.setItem('safargo_promo_offers', JSON.stringify(merged));
            return merged;
          });
        }
      } catch (err) {
        console.warn('Supabase database sync notice:', err);
      }
    };

    syncSupabase();
    return () => { isMounted = false; };
  }, []);

  const agentLogin = (
    mobileOrEmail: string,
    _pass?: string
  ): { success: boolean; reason?: 'pending' | 'invalid'; message?: string; agent?: AgentUser } => {
    const cleanInput = mobileOrEmail.trim().toLowerCase();

    // 1. Check if Admin Login (jia647155@gmail.com or jia647155@gmali.com)
    if (ADMIN_EMAILS.includes(cleanInput)) {
      setCurrentAgent(ADMIN_USER);
      setIsAgentLoggedIn(true);
      setIsAgentMode(true);
      setIsAuthModalOpen(false);
      localStorage.setItem('safargo_agent_logged_in', 'true');
      localStorage.setItem('safargo_current_agent', JSON.stringify(ADMIN_USER));
      return { success: true, agent: ADMIN_USER };
    }

    // 2. Search in registered agent applications
    const cleanDigits = cleanInput.replace(/\D/g, '').slice(-10);
    const found = agentApplications.find(
      a =>
        a.email.toLowerCase() === cleanInput ||
        (cleanDigits.length === 10 && a.mobile === cleanDigits) ||
        a.id.toLowerCase() === cleanInput
    );

    if (found) {
      if (found.isSuspended) {
        return {
          success: false,
          reason: 'invalid',
          message: `⚠️ आपकी एजेंट आईडी कंपनी सुरक्षा एवं धोखाधड़ी रोकथाम नियमों के उल्लंघन के कारण सस्पेंड कर दी गई है। कारण: ${found.suspendReason || 'कंपनी नियमों का उल्लंघन'}। सहायता हेतु 1800-SAFAR-GO पर संपर्क करें।`,
          agent: found
        };
      }

      if (!found.isApproved) {
        // BLOCKED: Still pending SafarGo 24-hr verification!
        return {
          success: false,
          reason: 'pending',
          message:
            '⏳ आपका अकाउंट अभी वेरीफाई नहीं हुआ है। SafarGo टीम 24 घंटे के अंदर आपके दस्तावेजों की जांच कर रही है। वेरीफाई होने के बाद ही आप लॉगिन कर सकेंगे।',
          agent: found
        };
      }

      // Check custom password if set and provided
      if (_pass && found.password && _pass !== found.password) {
        return {
          success: false,
          reason: 'invalid',
          message: 'गलत पासवर्ड! कृपया सही पासवर्ड दर्ज करें अथवा नया पासवर्ड सेट करें।'
        };
      }

      // Approved! Allow login
      setCurrentAgent(found);
      setIsAgentLoggedIn(true);
      setIsAgentMode(true);
      setIsAuthModalOpen(false);
      localStorage.setItem('safargo_agent_logged_in', 'true');
      localStorage.setItem('safargo_current_agent', JSON.stringify(found));
      return { success: true, agent: found };
    }

    return {
      success: false,
      reason: 'invalid',
      message: 'गलत क्रेडेंशियल्स! केवल पंजीकृत और सत्यापित एजेंट ही लॉगिन कर सकते हैं।'
    };
  };

  const agentRegister = async (data: Omit<AgentUser, 'id' | 'isApproved'>): Promise<AgentUser> => {
    const newAgent: AgentUser = {
      ...data,
      id: `SFG-AGENT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      isApproved: false, // NOT logged in yet - Pending SafarGo team 24-hr verification!
      isSuspended: false,
      appliedDate: 'Today, 18 Oct 2026',
      role: 'agent'
    };

    const updated = [newAgent, ...agentApplications];
    setAgentApplications(updated);
    localStorage.setItem('safargo_agent_applications', JSON.stringify(updated));
    saveAgentToDb(newAgent).catch(err => console.warn('Supabase saveAgent error:', err));

    // Send confirmation email via Resend to the applicant's Gmail
    await sendOnboardingSubmittedEmail({
      toEmail: newAgent.email,
      fullName: newAgent.fullName,
      shopName: newAgent.shopName,
      agentId: newAgent.id,
      mobile: newAgent.mobile
    }).catch(console.error);

    return newAgent;
  };

  const approveAgent = async (agentId: string): Promise<boolean> => {
    let approvedAgent: AgentUser | null = null;
    const token = `sfg-tok-${Date.now()}`;
    const approvedDateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const updated = agentApplications.map(a => {
      if (a.id === agentId) {
        approvedAgent = { 
          ...a, 
          isApproved: true, 
          isSuspended: false,
          approvedDate: approvedDateStr,
          approvalToken: token
        };
        return approvedAgent;
      }
      return a;
    });

    setAgentApplications(updated);
    localStorage.setItem('safargo_agent_applications', JSON.stringify(updated));
    updateAgentInDb(agentId, {
      isApproved: true,
      isSuspended: false,
      approvedDate: approvedDateStr,
      approvalToken: token
    }).catch(err => console.warn('Supabase approveAgent error:', err));

    if (approvedAgent) {
      await sendAgentApprovalEmail({
        toEmail: (approvedAgent as AgentUser).email,
        fullName: (approvedAgent as AgentUser).fullName,
        shopName: (approvedAgent as AgentUser).shopName,
        agentId: (approvedAgent as AgentUser).id
      }).catch(console.error);
    }

    return true;
  };

  const rejectAgent = (agentId: string) => {
    const updated = agentApplications.filter(a => a.id !== agentId);
    setAgentApplications(updated);
    localStorage.setItem('safargo_agent_applications', JSON.stringify(updated));
    deleteAgentFromDb(agentId).catch(err => console.warn('Supabase rejectAgent error:', err));
  };

  const suspendAgent = (agentId: string, reason?: string) => {
    const defaultReason = reason || 'धोखाधड़ी / कंपनी नियमों का उल्लंघन';
    const updated = agentApplications.map(a => 
      a.id === agentId 
        ? { ...a, isSuspended: true, suspendReason: defaultReason } 
        : a
    );
    setAgentApplications(updated);
    localStorage.setItem('safargo_agent_applications', JSON.stringify(updated));
    updateAgentInDb(agentId, { isSuspended: true, suspendReason: defaultReason }).catch(err => console.warn('Supabase suspendAgent error:', err));

    if (currentAgent?.id === agentId) {
      const next = { ...currentAgent, isSuspended: true, suspendReason: defaultReason };
      setCurrentAgent(next);
      localStorage.setItem('safargo_current_agent', JSON.stringify(next));
    }
  };

  const reactivateAgent = (agentId: string) => {
    const updated = agentApplications.map(a => 
      a.id === agentId 
        ? { ...a, isSuspended: false, suspendReason: undefined } 
        : a
    );
    setAgentApplications(updated);
    localStorage.setItem('safargo_agent_applications', JSON.stringify(updated));
    updateAgentInDb(agentId, { isSuspended: false, suspendReason: undefined }).catch(err => console.warn('Supabase reactivateAgent error:', err));

    if (currentAgent?.id === agentId) {
      const next = { ...currentAgent, isSuspended: false, suspendReason: undefined };
      setCurrentAgent(next);
      localStorage.setItem('safargo_current_agent', JSON.stringify(next));
    }
  };

  const updateAgent = (agentId: string, patch: Partial<AgentUser>) => {
    const updated = agentApplications.map(a => a.id === agentId ? { ...a, ...patch } : a);
    setAgentApplications(updated);
    localStorage.setItem('safargo_agent_applications', JSON.stringify(updated));
    updateAgentInDb(agentId, patch).catch(err => console.warn('Supabase updateAgent error:', err));

    if (currentAgent?.id === agentId) {
      const next = { ...currentAgent, ...patch };
      setCurrentAgent(next);
      localStorage.setItem('safargo_current_agent', JSON.stringify(next));
    }
  };

  const setAgentPassword = (emailOrId: string, newPass: string): boolean => {
    const clean = emailOrId.trim().toLowerCase();
    let found = false;
    const updated = agentApplications.map(a => {
      if (a.email.toLowerCase() === clean || a.id.toLowerCase() === clean || a.mobile === clean) {
        found = true;
        return { ...a, password: newPass };
      }
      return a;
    });

    if (found) {
      setAgentApplications(updated);
      localStorage.setItem('safargo_agent_applications', JSON.stringify(updated));
      const targetAgent = updated.find(a => a.email.toLowerCase() === clean || a.id.toLowerCase() === clean || a.mobile === clean);
      if (targetAgent) {
        updateAgentInDb(targetAgent.id, { password: newPass }).catch(err => console.warn('Supabase setAgentPassword error:', err));
      }
      if (currentAgent && (currentAgent.email.toLowerCase() === clean || currentAgent.id.toLowerCase() === clean)) {
        const next = { ...currentAgent, password: newPass };
        setCurrentAgent(next);
        localStorage.setItem('safargo_current_agent', JSON.stringify(next));
      }
      return true;
    }
    return false;
  };

  const uploadAgentPhoto = (agentId: string, photoUrl: string): boolean => {
    // Only upload once policy
    const agent = agentApplications.find(a => a.id === agentId) || currentAgent;
    if (agent && agent.isPhotoLocked) {
      alert('🔒 प्रोफ़ाइल फ़ोटो पहले से अपलोड है और सुरक्षा कारणों से बदली नहीं जा सकती।');
      return false;
    }

    updateAgent(agentId, { profilePhoto: photoUrl, isPhotoLocked: true });
    return true;
  };

  // Global Authentication Modal Gate State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const requireAuth = (callback?: () => void): boolean => {
    if (!isAgentLoggedIn && !isCustomerLoggedIn) {
      setIsAuthModalOpen(true);
      return false;
    }
    if (callback) callback();
    return true;
  };

  const agentLogout = () => {
    setIsAgentLoggedIn(false);
    setIsAgentMode(false);
    setCurrentAgent(null);
    localStorage.removeItem('safargo_agent_logged_in');
    localStorage.removeItem('safargo_current_agent');
    localStorage.setItem('safargo_agent_logged_in', 'false');
    setActiveService('bus');
    setCurrentStep('search');
  };

  const deleteAgentAccount = (agentId: string): boolean => {
    const cleanId = agentId.trim().toLowerCase();
    const updated = agentApplications.filter(a => 
      a.id.toLowerCase() !== cleanId && 
      a.email.toLowerCase() !== cleanId && 
      a.mobile !== cleanId
    );
    setAgentApplications(updated);
    localStorage.setItem('safargo_agent_applications', JSON.stringify(updated));
    deleteAgentFromDb(agentId).catch(err => console.warn('Supabase deleteAgent error:', err));

    if (
      currentAgent &&
      (currentAgent.id.toLowerCase() === cleanId ||
       currentAgent.email.toLowerCase() === cleanId ||
       currentAgent.mobile === cleanId)
    ) {
      agentLogout();
    }
    return true;
  };

  // Language
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');

  // User Profile & Account State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('safargo_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.name?.includes('Rajesh Verma') || parsed?.phone === '9876543210' || parsed?.email?.includes('rajesh.verma')) {
          const fresh: UserProfile = {
            name: '',
            email: '',
            phone: '',
            gender: 'male',
            dob: '',
            emergencyContact: '',
            walletBalance: 0,
            promoCash: 0,
            goldMember: false
          };
          localStorage.setItem('safargo_user_profile', JSON.stringify(fresh));
          return fresh;
        }
        return parsed;
      }
      return {
        name: '',
        email: '',
        phone: '',
        gender: 'male',
        dob: '',
        emergencyContact: '',
        walletBalance: 0,
        promoCash: 0,
        goldMember: false
      };
    } catch {
      return {
        name: '',
        email: '',
        phone: '',
        gender: 'male',
        dob: '',
        emergencyContact: '',
        walletBalance: 0,
        promoCash: 0,
        goldMember: false
      };
    }
  });

  const [savedPassengers, setSavedPassengers] = useState<SavedCoPassenger[]>(() => {
    try {
      const saved = localStorage.getItem('safargo_saved_passengers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((p: any) => p.name?.includes('Verma'))) {
          localStorage.removeItem('safargo_saved_passengers');
          return [];
        }
        return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const updateUserProfile = (patch: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const next = { ...prev, ...patch };
      localStorage.setItem('safargo_user_profile', JSON.stringify(next));
      return next;
    });
  };

  const addSavedPassenger = (p: Omit<SavedCoPassenger, 'id'>) => {
    const newPassenger: SavedCoPassenger = { ...p, id: `sp-${Date.now()}` };
    setSavedPassengers(prev => {
      const next = [...prev, newPassenger];
      localStorage.setItem('safargo_saved_passengers', JSON.stringify(next));
      return next;
    });
  };

  const removeSavedPassenger = (id: string) => {
    setSavedPassengers(prev => {
      const next = prev.filter(sp => sp.id !== id);
      localStorage.setItem('safargo_saved_passengers', JSON.stringify(next));
      return next;
    });
  };

  const addWalletCash = (amount: number) => {
    setUserProfile(prev => {
      const next = { ...prev, walletBalance: prev.walletBalance + amount };
      localStorage.setItem('safargo_user_profile', JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    localStorage.setItem('safargo_travel_bookings', JSON.stringify(bookings));
  }, [bookings]);

  const setActiveService = (srv: TravelService) => {
    setActiveServiceInternal(srv);
    setCurrentStep('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const swapCities = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  const filteredBuses = React.useMemo(() => {
    // 1. Direct match in existing busesList
    const matchesFromList = busesList.filter((bus) => {
      const matchesFrom = fromCity.toLowerCase().includes(bus.sourceCity.toLowerCase()) || bus.sourceCity.toLowerCase().includes(fromCity.toLowerCase());
      const matchesTo = toCity.toLowerCase().includes(bus.destinationCity.toLowerCase()) || bus.destinationCity.toLowerCase().includes(toCity.toLowerCase());
      const isRouteMatch = (matchesFrom && matchesTo);

      if (busFilter === 'ac') return isRouteMatch && bus.busType.toLowerCase().includes('ac');
      if (busFilter === 'sleeper') return isRouteMatch && bus.busType.toLowerCase().includes('sleeper');
      if (busFilter === 'primo') return isRouteMatch && bus.isPrimo;
      return isRouteMatch;
    });

    if (matchesFromList.length > 0) {
      return matchesFromList;
    }

    // 2. Dynamic All-India & Madhya Pradesh (55 Districts & Villages) Route Engine
    return getBusesForRoute(fromCity, toCity, busFilter);
  }, [busesList, fromCity, toCity, busFilter]);

  const toggleSeatSelection = (seat: BusSeat) => {
    if (seat.status === 'booked') return;

    setSelectedSeats(prev => {
      const isSelected = prev.some(s => s.id === seat.id);
      if (isSelected) {
        return prev.filter(s => s.id !== seat.id);
      } else {
        if (prev.length >= 6) {
          alert('You can select maximum 6 seats per booking.');
          return prev;
        }
        return [...prev, seat];
      }
    });
  };

  const clearSeatSelection = () => {
    setSelectedSeats([]);
  };

  const confirmBusBooking = (
    paymentMethod: 'upi' | 'card' | 'netbanking' | 'pay_at_bus' | 'youpi_pg',
    contact: { fullName: string; mobile: string; email: string },
    utr?: string,
    youpiDetails?: { paymentId?: string; status?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED' }
  ): TravelBooking => {
    const pnr = `SFG${Math.floor(100000 + Math.random() * 900000)}`;
    const totalFare = selectedSeats.reduce((acc, s) => acc + s.fare, 0);
    const commission = isAgentMode ? FIXED_AGENT_COMMISSION : 0;
    
    // In bus ticket booking, ALL bookings require mandatory Super Admin approval!
    // No ticket is auto-confirmed. It goes into 'pending' review until Super Admin approves UTR.
    const bookingStatus: 'pending' = 'pending';

    const newBooking: TravelBooking = {
      id: `bk-${Date.now()}`,
      bookingType: 'bus',
      pnr,
      bookingDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      travelDate: journeyDate,
      status: bookingStatus,
      totalAmount: totalFare,
      paymentMethod,
      utr: utr ? utr.trim().toUpperCase() : (youpiDetails?.paymentId ? `YOUPI-${youpiDetails.paymentId.slice(-8).toUpperCase()}` : undefined),
      agentId: isAgentMode ? (currentAgent?.id || 'SFG-AGENT-ACTIVE') : undefined,
      agentEmail: isAgentMode ? (currentAgent?.email || contact.email) : undefined,
      verifiedByAdmin: false,
      verifiedAt: undefined,
      youpiPaymentId: youpiDetails?.paymentId,
      youpiStatus: youpiDetails?.status,
      passengerDetails: contact,
      busDetails: {
        bus: selectedBus || MOCK_BUSES[0],
        selectedSeats: selectedSeats.map(s => s.seatNumber),
        boardingPoint: selectedBoardingPoint || (selectedBus || MOCK_BUSES[0]).boardingPoints[0],
        droppingPoint: selectedDroppingPoint || (selectedBus || MOCK_BUSES[0]).droppingPoints[0],
        passengers: passengers.length > 0 ? passengers : selectedSeats.map((s, idx) => ({
          id: `p-${idx}`,
          seatNumber: s.seatNumber,
          name: idx === 0 ? contact.fullName : `Passenger ${idx + 1}`,
          age: 28,
          gender: 'male'
        }))
      },
      isAgentBooking: isAgentMode,
      agentCommissionAmount: commission
    };

    setBookings(prev => [newBooking, ...prev]);
    setLatestBooking(newBooking);
    saveBookingToDb(newBooking).catch(err => console.warn('Supabase saveBooking error:', err));

    setCurrentStep('booking_success');
    return newBooking;
  };

  const verifyBusBooking = async (bookingId: string): Promise<boolean> => {
    let verifiedBooking: TravelBooking | null = null;
    const nowStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const updated = bookings.map(b => {
      if (b.id === bookingId || b.pnr === bookingId) {
        verifiedBooking = {
          ...b,
          status: 'confirmed' as const,
          verifiedByAdmin: true,
          verifiedAt: nowStr
        };
        return verifiedBooking;
      }
      return b;
    });

    setBookings(updated);
    localStorage.setItem('safargo_travel_bookings', JSON.stringify(updated));

    if (latestBooking && (latestBooking.id === bookingId || latestBooking.pnr === bookingId) && verifiedBooking) {
      setLatestBooking(verifiedBooking);
    }

    if (verifiedBooking) {
      const vb: TravelBooking = verifiedBooking;
      updateBookingInDb(vb.id, {
        status: 'confirmed',
        verifiedByAdmin: true,
        verifiedAt: nowStr
      }).catch(err => console.warn('Supabase verifyBooking error:', err));

      // Credit commission ₹19.34 to agent wallet!
      const comm = (vb.isAgentBooking && (vb.agentCommissionAmount || FIXED_AGENT_COMMISSION)) || FIXED_AGENT_COMMISSION;
      setAgentWalletBalance(prev => {
        const next = Number((prev + comm).toFixed(2));
        localStorage.setItem('safargo_agent_wallet', JSON.stringify(next));
        return next;
      });

      // Dispatch verification email to agent
      const targetEmail = vb.agentEmail || vb.passengerDetails.email || currentAgent?.email || '';
      if (targetEmail) {
        await sendTicketApprovalEmail({
          toEmail: targetEmail,
          agentName: vb.passengerDetails.fullName || 'अधिकृत एजेंट',
          agentId: vb.agentId || currentAgent?.id || 'SFG-AGENT',
          pnr: vb.pnr,
          busOperator: vb.busDetails?.bus.operatorName || 'SafarGo Express',
          fromCity: vb.busDetails?.bus.sourceCity || 'Delhi',
          toCity: vb.busDetails?.bus.destinationCity || 'Jaipur',
          travelDate: vb.travelDate,
          departureTime: vb.busDetails?.bus.departureTime || '21:30',
          seats: vb.busDetails?.selectedSeats || ['1A'],
          totalFare: vb.totalAmount,
          utr: vb.utr,
          commission: comm
        }).catch(console.error);
      }

      // Auto dispatch WhatsApp e-Ticket to Passenger
      sendBookingWhatsApp(vb).catch(err => console.info('WhatsApp passenger ticket dispatch error:', err));

      // Auto dispatch WhatsApp Notification to Agent
      if (vb.isAgentBooking) {
        const agentPhone = currentAgent?.mobile || vb.passengerDetails.mobile;
        const agentMsg = formatAgentApprovalWhatsAppMessage(vb, vb.passengerDetails.fullName, comm);
        sendOpenWaMessage(agentPhone, agentMsg).catch(err => console.info('WhatsApp agent alert dispatch error:', err));
      }

      return true;
    }

    return false;
  };

  const rejectBusBooking = (bookingId: string, reason?: string, suspendAgentUser: boolean = false) => {
    const defaultReason = reason || 'फर्जी UTR / भुगतान धोखाधड़ी (Fake UTR / Payment scam)';
    let rejectedBooking: TravelBooking | null = null;

    const updated = bookings.map(b => {
      if (b.id === bookingId || b.pnr === bookingId) {
        rejectedBooking = {
          ...b,
          status: 'cancelled' as const,
          rejectionReason: defaultReason
        };
        return rejectedBooking;
      }
      return b;
    });

    setBookings(updated);
    localStorage.setItem('safargo_travel_bookings', JSON.stringify(updated));

    if (latestBooking && (latestBooking.id === bookingId || latestBooking.pnr === bookingId) && rejectedBooking) {
      setLatestBooking(rejectedBooking);
    }

    if (rejectedBooking) {
      const rb: TravelBooking = rejectedBooking;
      updateBookingInDb(rb.id, {
        status: 'cancelled',
        rejectionReason: defaultReason
      }).catch(err => console.warn('Supabase rejectBooking error:', err));
    }

    if (suspendAgentUser && rejectedBooking && (rejectedBooking as TravelBooking).agentId) {
      suspendAgent((rejectedBooking as TravelBooking).agentId!, defaultReason);
    }
  };

  const confirmHotelBooking = (paymentMethod: any, contact: any): TravelBooking => {
    const pnr = `HTL${Math.floor(100000 + Math.random() * 900000)}`;
    const price = selectedRoom ? selectedRoom.pricePerNight * 2 : (selectedHotel?.pricePerNight || 2499) * 2;
    const commission = isAgentMode ? FIXED_AGENT_COMMISSION : 0;

    const newBooking: TravelBooking = {
      id: `bk-htl-${Date.now()}`,
      bookingType: 'hotel',
      pnr,
      bookingDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      travelDate: checkInDate,
      status: 'confirmed',
      totalAmount: price,
      paymentMethod,
      passengerDetails: contact,
      hotelDetails: {
        hotel: selectedHotel || MOCK_HOTELS[0],
        roomType: selectedRoom?.name || 'Deluxe King Room',
        checkIn: checkInDate,
        checkOut: checkOutDate,
        roomsCount: 1,
        guestsCount
      },
      isAgentBooking: isAgentMode,
      agentCommissionAmount: commission
    };

    setBookings(prev => [newBooking, ...prev]);
    setLatestBooking(newBooking);
    saveBookingToDb(newBooking).catch(err => console.warn('Supabase saveHotelBooking error:', err));

    if (isAgentMode && commission > 0) {
      setAgentWalletBalance(prev => {
        const next = Number((prev + commission).toFixed(2));
        localStorage.setItem('safargo_agent_wallet', JSON.stringify(next));
        return next;
      });
    }

    setCurrentStep('hotel_success');
    return newBooking;
  };

  const cancelBooking = (pnr: string) => {
    if (confirm(`Are you sure you want to cancel ticket PNR ${pnr}? 100% refund will be initiated.`)) {
      setBookings(prev => {
        const next = prev.map(b => b.pnr === pnr ? { ...b, status: 'cancelled' as const } : b);
        const target = next.find(b => b.pnr === pnr);
        if (target) {
          updateBookingInDb(target.id, { status: 'cancelled' }).catch(err => console.warn('Supabase cancelBooking error:', err));
        }
        return next;
      });
      alert(`Booking ${pnr} cancelled successfully. Refund initiated to source account.`);
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'hi' ? 'en' : 'hi');
  };

  const t = (hiText: string, enText: string) => {
    return language === 'hi' ? hiText : enText;
  };

  return (
    <TravelContext.Provider
      value={{
        activeService,
        setActiveService,
        currentStep,
        setCurrentStep,
        fromCity,
        setFromCity,
        toCity,
        setToCity,
        journeyDate,
        setJourneyDate,
        swapCities,
        buses: busesList,
        addBus,
        deleteBus,
        updateBus,
        filteredBuses,
        busFilter,
        setBusFilter,
        selectedBus,
        setSelectedBus,
        selectedSeats,
        toggleSeatSelection,
        clearSeatSelection,
        selectedBoardingPoint,
        setSelectedBoardingPoint,
        selectedDroppingPoint,
        setSelectedDroppingPoint,
        passengers,
        setPassengers,
        hotelCity,
        setHotelCity,
        checkInDate,
        setCheckInDate,
        checkOutDate,
        setCheckOutDate,
        guestsCount,
        setGuestsCount,
        hotels: MOCK_HOTELS,
        selectedHotel,
        setSelectedHotel,
        selectedRoom,
        setSelectedRoom,
        cabs: MOCK_CABS,
        selectedCab,
        setSelectedCab,
        bookings,
        latestBooking,
        confirmBusBooking,
        confirmHotelBooking,
        cancelBooking,
        verifyBusBooking,
        rejectBusBooking,
        isAgentMode,
        setIsAgentMode,
        agentWalletBalance,
        agentPayoutHistory,
        language,
        toggleLanguage,
        t,
        userProfile,
        updateUserProfile,
        savedPassengers,
        addSavedPassenger,
        removeSavedPassenger,
        addWalletCash,
        withdrawAgentEarnings,
        creditAgentWalletCommission,
        isAgentLoggedIn,
        setIsAgentLoggedIn,
        isCustomerLoggedIn,
        setIsCustomerLoggedIn,
        customerLogin,
        customerLogout,
        currentAgent,
        setCurrentAgent,
        agentLogin,
        agentRegister,
        agentLogout,
        agentApplications,
        approveAgent,
        rejectAgent,
        suspendAgent,
        reactivateAgent,
        updateAgent,
        setAgentPassword,
        uploadAgentPhoto,
        walletTopUpRequests,
        submitWalletTopUp,
        verifyTopUpRequest,
        suspendFraudTopUp,
        adminQrConfig,
        updateAdminQrConfig,
        supportTickets,
        createSupportTicket,
        closeSupportTicket,
        resolveSupportTicket,
        agentReferrals,
        creditReferralBonus,
        deleteAgentAccount,
        isAuthModalOpen,
        setIsAuthModalOpen,
        requireAuth,
        promoOffers,
        addPromoOffer,
        togglePromoOfferStatus,
        deletePromoOffer,
        applyPromoCode,
        youpiConfig,
        updateYoupiConfig,
        openWaConfig,
        updateOpenWaConfig,
        sendBookingWhatsApp
      }}
    >
      {children}
    </TravelContext.Provider>
  );
};

export const useTravel = () => {
  const context = useContext(TravelContext);
  if (!context) {
    throw new Error('useTravel must be used within a TravelProvider');
  }
  return context;
};
