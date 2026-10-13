import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Booking,
  BusTrip,
  CommissionEntry,
  SalaryRecord,
  AdminSettings,
  AuditLog,
  BookingStatus,
  RefundStatus,
  AdminAnnouncement,
  CustomFeature,
  PayoutRequest,
  WalletRechargeRequest,
  WalletTransaction,
  PromotionClaim,
  PromotionPlatform,
  PromotionContentType,
  PromoterApplication,
  ShopSubscriptionPlan,
  PartnerShop,
  PartnerShopItem,
  AgentCallLog,
  QuickDeliveryOrder,
  DeliveryOrderStatus,
  PromoCode
} from '../types';
import {
  INITIAL_BOOKINGS,
  INITIAL_BUS_TRIPS,
  INITIAL_COMMISSION_LEDGER,
  INITIAL_SALARY_RECORDS,
  INITIAL_SETTINGS,
  INITIAL_AUDIT_LOGS,
  INITIAL_PAYOUT_REQUESTS,
  INITIAL_WALLET_RECHARGES,
  INITIAL_WALLET_TRANSACTIONS,
  INITIAL_PROMOTION_CLAIMS,
  INITIAL_PROMOTER_APPLICATIONS,
  INITIAL_PARTNER_SHOPS,
  INITIAL_AGENT_CALL_LOGS,
  INITIAL_QUICK_DELIVERY_ORDERS,
  INITIAL_PROMO_CODES,
  SHOP_SUBSCRIPTION_PLANS
} from '../lib/mockData';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { db } from '../lib/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';
import { safeSetItem, sanitizeWalletRecharges, sanitizeBookings } from '../lib/storageUtils';
import { isFirebaseConfigured } from '../lib/firebase';
import {
  saveWalletRechargeToFirestore,
  saveBookingToFirestore,
  uploadScreenshotToFirebase,
  fetchFirestoreWalletRecharges,
  fetchFirestoreBookings,
} from '../lib/firebaseService';

interface DataContextType {
  // Bookings
  bookings: Booking[];
  agentBookings: Booking[];
  createBooking: (bookingData: Omit<Booking, 'id' | 'booking_code' | 'created_at' | 'deadline_at' | 'status' | 'updated_at'>) => Promise<Booking | null>;
  confirmBooking: (bookingId: string, verificationData: {
    actual_fare: number;
    confirmed_seats: string;
    actual_operator: string;
    actual_boarding_point: string;
    actual_drop_point: string;
    ticket_pnr: string;
    ticket_doc_url?: string;
    admin_notes?: string;
  }) => Promise<boolean>;
  rejectBooking: (bookingId: string, reason: string) => Promise<boolean>;
  reopenBooking: (bookingId: string) => Promise<boolean>;
  requestCancellation: (bookingId: string, reason: string) => Promise<boolean>;
  processCancellation: (bookingId: string, refundStatus: RefundStatus, refundAmount: number, reverseCommission: boolean) => Promise<boolean>;

  // Bus Trips (Manual Inventory)
  busTrips: BusTrip[];
  addBusTrip: (trip: Omit<BusTrip, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateBusTrip: (id: string, trip: Partial<BusTrip>) => Promise<boolean>;
  deleteBusTrip: (id: string) => Promise<boolean>;

  // Commission & Salary
  commissions: CommissionEntry[];
  agentCommissions: CommissionEntry[];
  salaryRecords: SalaryRecord[];
  agentSalaryRecord: SalaryRecord | undefined;
  approveSalary: (salaryId: string) => Promise<boolean>;
  markSalaryPaid: (salaryId: string, paymentReference: string) => Promise<boolean>;

  // Payout Requests
  payoutRequests: PayoutRequest[];
  agentPayoutRequests: PayoutRequest[];
  requestPayout: (payoutData: Omit<PayoutRequest, 'id' | 'agent_id' | 'agent_name' | 'agent_mobile' | 'status' | 'created_at'>) => Promise<boolean>;
  approvePayout: (payoutId: string, adminReference: string, notes?: string) => Promise<boolean>;
  rejectPayout: (payoutId: string, reason: string) => Promise<boolean>;

  // Settings & Announcements & Custom Features
  settings: AdminSettings;
  updateSettings: (newSettings: Partial<AdminSettings>) => Promise<boolean>;
  updateAnnouncement: (announcement: Partial<AdminAnnouncement>) => Promise<boolean>;
  addCustomFeature: (feature: Omit<CustomFeature, 'id' | 'created_at'>) => Promise<boolean>;
  updateCustomFeature: (id: string, feature: Partial<CustomFeature>) => Promise<boolean>;
  deleteCustomFeature: (id: string) => Promise<boolean>;
  toggleCustomFeature: (id: string) => Promise<boolean>;

  // Audit Logs
  auditLogs: AuditLog[];

  // Prepaid Wallet System (Min ₹2,000 Recharge)
  walletRecharges: WalletRechargeRequest[];
  agentWalletRecharges: WalletRechargeRequest[];
  walletTransactions: WalletTransaction[];
  agentWalletTransactions: WalletTransaction[];
  agentWalletBalance: number;
  requestWalletRecharge: (amount: number, utr: string, screenshotUrl?: string, paymentMethod?: 'upi_qr' | 'bank_transfer') => Promise<boolean>;
  approveWalletRecharge: (rechargeId: string, adminNotes?: string) => Promise<boolean>;
  rejectWalletRecharge: (rechargeId: string, reason: string) => Promise<boolean>;
  adjustAgentWallet: (agentId: string, amount: number, type: 'credit' | 'debit', reason: string) => Promise<boolean>;

  // Viral Creator & Social Media Promotion (Instagram 1M => ₹500, YouTube 10k => ₹100, 24-hr SLA)
  promotionClaims: PromotionClaim[];
  agentPromotionClaims: PromotionClaim[];
  submitPromotionClaim: (claimData: {
    user_name: string;
    user_mobile: string;
    platform: PromotionPlatform;
    content_type: PromotionContentType;
    post_url: string;
    channel_or_handle: string;
    views_count: number;
    screenshot_url?: string;
    payout_method: 'wallet' | 'upi' | 'bank';
    upi_id?: string;
    bank_details?: string;
  }) => Promise<boolean>;
  approvePromotionClaim: (claimId: string, paymentReference?: string, notes?: string) => Promise<boolean>;
  rejectPromotionClaim: (claimId: string, reason: string) => Promise<boolean>;

  // Promoter Partner Program (Only 5 Candidates, ₹15,000/Month Salary, 500 Target, 100% Refund)
  promoterApplications: PromoterApplication[];
  submitPromoterApplication: (data: {
    applicant_name: string;
    mobile: string;
    email: string;
    city: string;
    district: string;
    experience_note: string;
    application_fee_utr: string;
  }) => Promise<boolean>;
  schedulePromoterInterview: (appId: string, interviewDate: string, notes?: string) => Promise<boolean>;
  passPromoterInterview: (appId: string, notes?: string) => Promise<boolean>;
  onboardPromoterPartner: (
    appId: string,
    onboardingUtr: string,
    slotNo: number,
    userId?: string,
    password?: string
  ) => Promise<boolean>;
  setPromoterCredentials: (
    appId: string,
    userId: string,
    password: string,
    slotNo?: number
  ) => Promise<boolean>;
  refundPromoterFee: (appId: string) => Promise<boolean>;

  // Local Shopkeeper Subscriptions & Online Catalog
  partnerShops: PartnerShop[];
  addPartnerShop: (shop: Omit<PartnerShop, 'id' | 'created_at'>) => Promise<boolean>;
  updatePartnerShop: (shopId: string, updates: Partial<PartnerShop>) => Promise<boolean>;
  addPartnerShopItem: (shopId: string, item: Omit<PartnerShopItem, 'id'>) => Promise<boolean>;
  togglePartnerShopItemStock: (shopId: string, itemId: string) => Promise<boolean>;

  // Daily Agent Calling & Field Audit Tracker
  agentCallLogs: AgentCallLog[];
  logAgentCall: (callData: Omit<AgentCallLog, 'id' | 'created_at'>) => Promise<boolean>;

  // SafarGo 15-Minute Rural/Town Quick Delivery (Blinkit Model for MP)
  quickDeliveryOrders: QuickDeliveryOrder[];
  agentQuickDeliveryOrders: QuickDeliveryOrder[];
  createDeliveryOrder: (orderData: {
    customer_name: string;
    customer_mobile: string;
    customer_address: string;
    city: string;
    items_description: string;
    distance_km: number;
    pickup_mode: 'local_concierge' | 'partner_shop';
    partner_shop_id?: string;
    partner_shop_name?: string;
  }) => Promise<QuickDeliveryOrder | null>;
  agentAcceptDeliveryOrder: (orderId: string) => Promise<boolean>;
  agentUploadDeliveryPhotoAndPrice: (orderId: string, photoUrl: string, actualItemPrice: number) => Promise<boolean>;
  customerConfirmDeliveryOrder: (orderId: string) => Promise<boolean>;
  completeDeliveryOrder: (orderId: string) => Promise<boolean>;
  cancelDeliveryOrder: (orderId: string, reason?: string) => Promise<boolean>;

  // Promo Codes & Special Offers System (Admin & Agents)
  promoCodes: PromoCode[];
  createPromoCode: (data: Omit<PromoCode, 'id' | 'used_count' | 'created_at'>) => Promise<PromoCode | null>;
  togglePromoCodeStatus: (id: string) => Promise<boolean>;
  deletePromoCode: (id: string) => Promise<boolean>;
  applyPromoCode: (
    code: string,
    service: 'bus_booking' | 'quick_delivery',
    amount: number,
    agentId?: string
  ) => {
    success: boolean;
    discountAmount: number;
    agentBonus: number;
    message: string;
    promo?: PromoCode;
  };

  // Commission Celebration Modal Trigger
  celebrationBooking: Booking | null;
  dismissCelebration: () => void;
}

const STORAGE_KEY_BOOKINGS = 'safargo_bookings_v1';
const STORAGE_KEY_COMMISSION = 'safargo_commission_v1';
const STORAGE_KEY_SALARY = 'safargo_salary_v1';
const STORAGE_KEY_TRIPS = 'safargo_trips_v1';
const STORAGE_KEY_SETTINGS = 'safargo_settings_v1';
const STORAGE_KEY_LOGS = 'safargo_audit_logs_v1';
const STORAGE_KEY_SEEN_CONFIRMATIONS = 'safargo_seen_confirmations_v1';
const STORAGE_KEY_PAYOUTS = 'safargo_payouts_v1';
const STORAGE_KEY_WALLET_RECHARGES = 'safargo_wallet_recharges_v1';
const STORAGE_KEY_WALLET_TX = 'safargo_wallet_tx_v1';
const STORAGE_KEY_PROMOTIONS = 'safargo_promotion_claims_v1';
const STORAGE_KEY_PROMOTERS = 'safargo_promoter_apps_v1';
const STORAGE_KEY_PARTNER_SHOPS = 'safargo_partner_shops_v1';
const STORAGE_KEY_CALL_LOGS = 'safargo_call_logs_v1';
const STORAGE_KEY_QUICK_DELIVERIES = 'safargo_quick_deliveries_v1';
const STORAGE_KEY_PROMO_CODES = 'safargo_promo_codes_v1';

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAdmin, isApprovedAgent, allProfiles, updateProfile, updateUserProfile } = useAuth();
  const { success, error, info, warning } = useToast();


  // Load state from localStorage or mock defaults
  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BOOKINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_BOOKINGS;
  });

  const [commissions, setCommissions] = useState<CommissionEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COMMISSION);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_COMMISSION_LEDGER;
  });

  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SALARY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SALARY_RECORDS;
  });

  const [busTrips, setBusTrips] = useState<BusTrip[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TRIPS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_BUS_TRIPS;
  });

  const [settings, setSettings] = useState<AdminSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_SETTINGS,
          ...parsed,
          announcement: {
            ...INITIAL_SETTINGS.announcement,
            ...(parsed.announcement || {}),
          },
          custom_features: parsed.custom_features || INITIAL_SETTINGS.custom_features,
        };
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SETTINGS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_AUDIT_LOGS;
  });

  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PAYOUTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PAYOUT_REQUESTS;
  });

  const [walletRecharges, setWalletRecharges] = useState<WalletRechargeRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WALLET_RECHARGES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_WALLET_RECHARGES;
  });

  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WALLET_TX);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_WALLET_TRANSACTIONS;
  });

  const [promotionClaims, setPromotionClaims] = useState<PromotionClaim[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROMOTIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PROMOTION_CLAIMS;
  });

  const [promoterApplications, setPromoterApplications] = useState<PromoterApplication[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROMOTERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PROMOTER_APPLICATIONS;
  });

  const [partnerShops, setPartnerShops] = useState<PartnerShop[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PARTNER_SHOPS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PARTNER_SHOPS;
  });

  const [agentCallLogs, setAgentCallLogs] = useState<AgentCallLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CALL_LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_AGENT_CALL_LOGS;
  });

  const [quickDeliveryOrders, setQuickDeliveryOrders] = useState<QuickDeliveryOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_QUICK_DELIVERIES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_QUICK_DELIVERY_ORDERS;
  });

  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROMO_CODES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PROMO_CODES;
  });

  // Track seen confirmation IDs so animation only plays once per confirmed booking
  const [seenConfirmations, setSeenConfirmations] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SEEN_CONFIRMATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return ['bkg-001']; // Initial confirmed booking already seen
  });

  const [celebrationBooking, setCelebrationBooking] = useState<Booking | null>(null);

  // Sync with safeStorage (Protected against QuotaExceededError)
  useEffect(() => {
    safeSetItem(STORAGE_KEY_BOOKINGS, JSON.stringify(sanitizeBookings(bookings)));
  }, [bookings]);

  useEffect(() => {
    safeSetItem(STORAGE_KEY_COMMISSION, JSON.stringify(commissions));
  }, [commissions]);

  useEffect(() => {
    safeSetItem(STORAGE_KEY_SALARY, JSON.stringify(salaryRecords));
  }, [salaryRecords]);

  useEffect(() => {
    safeSetItem(STORAGE_KEY_TRIPS, JSON.stringify(busTrips));
  }, [busTrips]);

  useEffect(() => {
    safeSetItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    safeSetItem(STORAGE_KEY_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    safeSetItem(STORAGE_KEY_SEEN_CONFIRMATIONS, JSON.stringify(seenConfirmations));
  }, [seenConfirmations]);

  useEffect(() => {
    safeSetItem(STORAGE_KEY_PAYOUTS, JSON.stringify(payoutRequests));
  }, [payoutRequests]);

  useEffect(() => {
    safeSetItem(STORAGE_KEY_WALLET_RECHARGES, JSON.stringify(sanitizeWalletRecharges(walletRecharges)));
  }, [walletRecharges]);

  useEffect(() => {
    safeSetItem(STORAGE_KEY_WALLET_TX, JSON.stringify(walletTransactions));
  }, [walletTransactions]);

  useEffect(() => {
    safeSetItem(STORAGE_KEY_PROMOTIONS, JSON.stringify(promotionClaims));
  }, [promotionClaims]);

  useEffect(() => {
    safeSetItem(STORAGE_KEY_PROMOTERS, JSON.stringify(promoterApplications));
  }, [promoterApplications]);

  useEffect(() => {
    safeSetItem(STORAGE_KEY_PARTNER_SHOPS, JSON.stringify(partnerShops));
  }, [partnerShops]);

  useEffect(() => {
    safeSetItem(STORAGE_KEY_CALL_LOGS, JSON.stringify(agentCallLogs));
  }, [agentCallLogs]);

  useEffect(() => {
    safeSetItem(STORAGE_KEY_QUICK_DELIVERIES, JSON.stringify(quickDeliveryOrders));
  }, [quickDeliveryOrders]);

  useEffect(() => {
    safeSetItem(STORAGE_KEY_PROMO_CODES, JSON.stringify(promoCodes));
  }, [promoCodes]);

  // Real Database Sync: Load initial live data from Supabase when configured
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const loadLiveSupabaseData = async () => {
      try {
        const [liveBookings, liveTrips, liveCommissions, liveSalaries, livePayouts, liveRecharges, liveTxs, liveClaims] = await Promise.all([
          db.getBookings(),
          db.getBusTrips(),
          db.getCommissions(),
          db.getSalaryRecords(),
          db.getPayoutRequests(),
          db.getWalletRecharges(),
          db.getWalletTransactions(),
          db.getPromotionClaims(),
        ]);

        if (liveBookings && liveBookings.length > 0) setBookings(liveBookings);
        if (liveTrips && liveTrips.length > 0) setBusTrips(liveTrips);
        if (liveCommissions && liveCommissions.length > 0) setCommissions(liveCommissions);
        if (liveSalaries && liveSalaries.length > 0) setSalaryRecords(liveSalaries);
        if (livePayouts && livePayouts.length > 0) setPayoutRequests(livePayouts);
        if (liveRecharges && liveRecharges.length > 0) setWalletRecharges(liveRecharges);
        if (liveTxs && liveTxs.length > 0) setWalletTransactions(liveTxs);
        if (liveClaims && liveClaims.length > 0) setPromotionClaims(liveClaims);
      } catch (err) {
        console.error('Error fetching live Supabase data:', err);
      }
    };

    loadLiveSupabaseData();
  }, []);

  // Multi-Tab Storage Sync: Instantly reflect Admin approvals & Agent requests across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_WALLET_RECHARGES && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setWalletRecharges(parsed);
        } catch (err) {
          console.error('Wallet recharges storage sync error:', err);
        }
      }
      if (e.key === STORAGE_KEY_WALLET_TX && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setWalletTransactions(parsed);
        } catch (err) {
          console.error('Wallet tx storage sync error:', err);
        }
      }
      if (e.key === STORAGE_KEY_BOOKINGS && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setBookings(parsed);
        } catch (err) {
          console.error('Bookings storage sync error:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Firebase Firestore Live Sync for Wallet Recharges & Bookings (runs on mount and every 6s)
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const syncFirestoreData = async () => {
      try {
        const remoteRecharges = await fetchFirestoreWalletRecharges();
        if (remoteRecharges && remoteRecharges.length > 0) {
          setWalletRecharges((prev) => {
            const mergedMap = new Map<string, WalletRechargeRequest>();
            prev.forEach((item) => mergedMap.set(item.id, item));
            remoteRecharges.forEach((remote) => {
              const existing = mergedMap.get(remote.id);
              if (!existing) {
                mergedMap.set(remote.id, remote);
              } else {
                // Approved or rejected status always takes precedence over pending
                const resolvedStatus =
                  existing.status === 'approved' || remote.status === 'approved'
                    ? 'approved'
                    : existing.status === 'rejected' || remote.status === 'rejected'
                    ? 'rejected'
                    : existing.status;
                mergedMap.set(remote.id, {
                  ...existing,
                  ...remote,
                  status: resolvedStatus,
                  screenshot_url: existing.screenshot_url || remote.screenshot_url,
                });
              }
            });
            return Array.from(mergedMap.values()).sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
          });
        }
      } catch (err) {
        console.warn('[Firestore Sync] Wallet recharges sync warning:', err);
      }
    };

    syncFirestoreData();
    const interval = setInterval(syncFirestoreData, 6000);
    return () => clearInterval(interval);
  }, []);


  // Log helper
  const addAuditLog = useCallback(
    (action: string, record_type: string, record_id?: string, metadata?: Record<string, any>) => {
      const newLog: AuditLog = {
        id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        actor_id: currentUser?.id,
        actor_email: currentUser?.email,
        actor_role: currentUser?.role,
        action,
        record_type,
        record_id,
        metadata,
        created_at: new Date().toISOString(),
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    },
    [currentUser]
  );

  // Safe 15-Minute Expiration Evaluator (Runs every 10 seconds)
  // Ensures deadline is strictly respected and expired bookings are updated safely
  useEffect(() => {
    const interval = setInterval(() => {
      const nowTime = Date.now();
      setBookings((prev) => {
        let hasChanges = false;
        const updated = prev.map((b) => {
          if (
            (b.status === 'booking_request' || b.status === 'awaiting_operator_confirmation') &&
            new Date(b.deadline_at).getTime() <= nowTime
          ) {
            hasChanges = true;
            return {
              ...b,
              status: 'expired' as BookingStatus,
              rejection_reason: '15-minute response deadline passed before operator confirmation.',
              updated_at: new Date().toISOString(),
            };
          }
          return b;
        });
        if (hasChanges) {
          addAuditLog('auto_expire_deadline', 'bookings', undefined, { timestamp: new Date().toISOString() });
        }
        return hasChanges ? updated : prev;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [addAuditLog]);

  // Check for newly confirmed bookings for the logged-in agent to trigger celebration
  useEffect(() => {
    if (currentUser?.role === 'agent') {
      const newlyConfirmed = bookings.find(
        (b) =>
          b.agent_id === currentUser.id &&
          b.status === 'confirmed' &&
          !seenConfirmations.includes(b.id)
      );

      if (newlyConfirmed) {
        setCelebrationBooking(newlyConfirmed);
        setSeenConfirmations((prev) => [...prev, newlyConfirmed.id]);
      }
    }
  }, [bookings, currentUser, seenConfirmations]);

  const dismissCelebration = () => {
    setCelebrationBooking(null);
  };

  // Agent's Bookings Filter (RLS frontend equivalent: agents only see their own)
  const agentBookings = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return bookings;
    return bookings.filter((b) => b.agent_id === currentUser.id || (currentUser.mobile && b.agent_mobile === currentUser.mobile));
  }, [bookings, currentUser]);

  // Agent's Commissions Filter
  const agentCommissions = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return commissions;
    return commissions.filter((c) => c.agent_id === currentUser.id);
  }, [commissions, currentUser]);

  // Agent's Payout Requests Filter
  const agentPayoutRequests = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return payoutRequests;
    return payoutRequests.filter((p) => p.agent_id === currentUser.id);
  }, [payoutRequests, currentUser]);

  // Agent's Wallet Recharges Filter
  const agentWalletRecharges = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return walletRecharges;
    return walletRecharges.filter(
      (r) => r.agent_id === currentUser.id || (currentUser.mobile && r.agent_mobile === currentUser.mobile)
    );
  }, [walletRecharges, currentUser]);

  // Agent's Wallet Transactions Filter
  const agentWalletTransactions = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return walletTransactions;
    return walletTransactions.filter((t) => t.agent_id === currentUser.id);
  }, [walletTransactions, currentUser]);

  // Agent's Viral Promotion Claims Filter
  const agentPromotionClaims = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return promotionClaims;
    return promotionClaims.filter((p) => p.user_id === currentUser.id);
  }, [promotionClaims, currentUser]);

  // Helper to compute any agent's true live wallet balance from approved recharges & transactions
  const computeWalletBalanceForAgent = useCallback(
    (agentId?: string, agentMobile?: string, profileBalance?: number): number => {
      if (!agentId && !agentMobile) return 0;

      const approvedRechargesTotal = walletRecharges
        .filter(
          (r) =>
            r.status === 'approved' &&
            (r.agent_id === agentId || (agentMobile && r.agent_mobile === agentMobile))
        )
        .reduce((sum, r) => sum + Number(r.amount || 0), 0);

      const ticketDebitsTotal = walletTransactions
        .filter((t) => t.agent_id === agentId && t.type === 'ticket_booking')
        .reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);

      const refundsTotal = walletTransactions
        .filter((t) => t.agent_id === agentId && t.type === 'refund')
        .reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);

      const adjustmentsTotal = walletTransactions
        .filter((t) => t.agent_id === agentId && t.type === 'adjustment')
        .reduce(
          (sum, t) =>
            sum +
            (t.description?.includes('डेबिट (-)')
              ? -Math.abs(Number(t.amount || 0))
              : Math.abs(Number(t.amount || 0))),
          0
        );

      if (approvedRechargesTotal > 0) {
        const ledgerBalance = Math.max(
          0,
          approvedRechargesTotal + refundsTotal + adjustmentsTotal - ticketDebitsTotal
        );
        return ledgerBalance;
      }

      return Math.max(0, (profileBalance || 0) + refundsTotal + adjustmentsTotal - ticketDebitsTotal);
    },
    [walletRecharges, walletTransactions]
  );

  // Agent's live wallet balance (automatically includes all approved recharges)
  const agentWalletBalance = useMemo(() => {
    if (!currentUser) return 0;
    return computeWalletBalanceForAgent(
      currentUser.id,
      currentUser.mobile,
      currentUser.wallet_balance
    );
  }, [currentUser, computeWalletBalanceForAgent]);

  // Automatically keep currentUser.wallet_balance in AuthContext synced with agentWalletBalance
  useEffect(() => {
    if (
      currentUser &&
      typeof agentWalletBalance === 'number' &&
      (currentUser.wallet_balance || 0) !== agentWalletBalance
    ) {
      updateUserProfile(currentUser.id, { wallet_balance: agentWalletBalance });
    }
  }, [currentUser, agentWalletBalance, updateUserProfile]);


  // Current month's salary record for current agent
  const currentMonthYear = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }, []);

  const agentSalaryRecord = useMemo(() => {
    if (!currentUser) return undefined;
    return salaryRecords.find(
      (s) => s.agent_id === currentUser.id && s.month_year === currentMonthYear
    );
  }, [salaryRecords, currentUser, currentMonthYear]);

  // Calculate agent target dynamically based on eligible confirmed bookings in current calendar month
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'agent') return;

    const confirmedThisMonth = bookings.filter((b) => {
      if (b.agent_id !== currentUser.id || b.status !== 'confirmed') return false;
      const bDate = new Date(b.created_at);
      const bMonthYear = `${bDate.getFullYear()}-${String(bDate.getMonth() + 1).padStart(2, '0')}`;
      return bMonthYear === currentMonthYear;
    }).length;

    setSalaryRecords((prev) => {
      const existing = prev.find(
        (s) => s.agent_id === currentUser.id && s.month_year === currentMonthYear
      );

      const targetMet = confirmedThisMonth >= settings.monthly_target;
      const agentWithdrawnThisMonth = payoutRequests
        .filter(
          (p) =>
            p.agent_id === currentUser.id &&
            p.created_at.startsWith(currentMonthYear) &&
            p.status !== 'rejected'
        )
        .reduce((sum, p) => sum + p.amount, 0);

      // 150 Target Salary Model: If agent did not withdraw, they get the full ₹5,000 on Sunday.
      // If agent withdrew commission during the month, the remaining balance up to ₹5,000 is payable.
      const payableSalary = targetMet
        ? Math.max(0, settings.monthly_salary - agentWithdrawnThisMonth)
        : 0;

      if (existing) {
        if (
          existing.confirmed_bookings !== confirmedThisMonth ||
          existing.payable_salary !== payableSalary
        ) {
          return prev.map((s) =>
            s.id === existing.id
              ? {
                  ...s,
                  confirmed_bookings: confirmedThisMonth,
                  target_met: targetMet,
                  target_bookings: settings.monthly_target,
                  base_salary: settings.monthly_salary,
                  payable_salary: payableSalary,
                  updated_at: new Date().toISOString(),
                }
              : s
          );
        }
        return prev;
      } else {
        // Create initial salary record for this month
        const newRecord: SalaryRecord = {
          id: `sal-${Date.now()}`,
          agent_id: currentUser.id,
          agent_name: currentUser.full_name,
          agent_mobile: currentUser.mobile,
          month_year: currentMonthYear,
          target_bookings: settings.monthly_target,
          confirmed_bookings: confirmedThisMonth,
          target_met: targetMet,
          base_salary: settings.monthly_salary,
          payable_salary: payableSalary,
          status: 'unpaid',
          notes: 'Automatic monthly target tracking (₹5,000 full salary on 150 target without early withdrawal; weekly Sunday payout)',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        return [...prev, newRecord];
      }
    });
  }, [bookings, currentUser, currentMonthYear, settings.monthly_target, settings.monthly_salary, payoutRequests]);

  // CREATE BOOKING (Agents or Automated Instant Ticket Requests)
  const createBooking = async (
    bookingData: Omit<Booking, 'id' | 'booking_code' | 'created_at' | 'deadline_at' | 'status' | 'updated_at'>
  ): Promise<Booking | null> => {
    const isInstantAutoRequest = Boolean(bookingData.agent_notes?.includes('[Instant Ticket Auto-Request]'));

    if (!isInstantAutoRequest) {
      if (!currentUser) {
        error('Not Authenticated', 'Please log in to submit a booking.');
        return null;
      }
    }

    const activeActor =
      currentUser ||
      allProfiles.find((p) => p.id === 'usr-agent-01') ||
      allProfiles.find((p) => p.role === 'agent') || {
        id: 'usr-agent-01',
        full_name: bookingData.agent_name || 'राजेश कुमार शर्मा',
        mobile: bookingData.agent_mobile || '9826012345',
        wallet_balance: 0,
      };

    // Idempotency check: prevent duplicate submissions within 30 seconds
    if (bookingData.idempotency_key) {
      const duplicate = bookings.find(
        (b) => b.idempotency_key === bookingData.idempotency_key
      );
      if (duplicate) {
        warning('Duplicate Submission Prevented', `Booking ${duplicate.booking_code} was already submitted.`);
        return duplicate;
      }
    }

    const now = new Date();
    const dateCode = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const bookingCode = `SFG-${dateCode}-${randomSuffix}`;
    const timerMins = isInstantAutoRequest ? 5 : 15;
    const deadline = new Date(now.getTime() + timerMins * 60 * 1000).toISOString();

    // Advance Payment Verification (SafarGo QR or Agent Prepaid Wallet)
    const paymentMode = bookingData.payment_mode || 'safargo_qr';
    let paymentStatus: 'paid' | 'pending_verification' = 'pending_verification';

    if (paymentMode === 'agent_wallet') {
      const currentWalletBal = Math.max(
        agentWalletBalance,
        computeWalletBalanceForAgent(activeActor.id, activeActor.mobile, activeActor.wallet_balance)
      );
      if (currentWalletBal < bookingData.total_estimated_amount) {
        error(
          'अपर्याप्त वॉलेट बैलेंस (Insufficient Wallet Balance)',
          `टिकट बुक करने के लिए ₹${bookingData.total_estimated_amount.toLocaleString('en-IN')} चाहिए, परन्तु आपके वॉलेट में केवल ₹${currentWalletBal.toLocaleString('en-IN')} हैं। कृपया वॉलेट में न्यूनतम ₹2,000 जोड़ें या SafarGo QR Code से भुगतान करें।`
        );
        return null;
      }

      // Deduct from wallet
      const newWalletBal = Math.max(0, currentWalletBal - bookingData.total_estimated_amount);
      await updateUserProfile(activeActor.id, { wallet_balance: newWalletBal });
      paymentStatus = 'paid';

      // Record wallet debit transaction
      const debitTx: WalletTransaction = {
        id: `wtx-${Date.now()}`,
        agent_id: activeActor.id,
        amount: -bookingData.total_estimated_amount,
        type: 'ticket_booking',
        booking_code: bookingCode,
        description: `टिकट बुकिंग कटौती: ${bookingData.from_city} → ${bookingData.to_city}`,
        balance_after: newWalletBal,
        created_at: now.toISOString(),
      };
      setWalletTransactions((prev) => {
        const next = [debitTx, ...prev];
        safeSetItem(STORAGE_KEY_WALLET_TX, JSON.stringify(next));
        return next;
      });
      if (isSupabaseConfigured) {
        db.createWalletTransaction(debitTx).catch(console.error);
      }
    } else {
      // SafarGo QR Code payment
      if (!bookingData.payment_utr || !bookingData.payment_utr.trim()) {
        error(
          'Payment UTR Required',
          'कृपया SafarGo QR Code / UPI पर भुगतान करने के बाद 12-अंकों का बैंक UTR / Transaction ID दर्ज करें।'
        );
        return null;
      }
      paymentStatus = 'pending_verification';
    }

    const newBooking: Booking = {
      ...bookingData,
      id: `bkg-${Date.now()}`,
      booking_code: bookingCode,
      agent_id: activeActor.id,
      agent_name: activeActor.full_name,
      agent_mobile: activeActor.mobile,
      payment_mode: paymentMode,
      payment_status: paymentStatus,
      payment_utr: bookingData.payment_utr,
      payment_screenshot_url: bookingData.payment_screenshot_url,
      created_at: now.toISOString(),
      deadline_at: deadline,
      status: 'booking_request',
      updated_at: now.toISOString(),
    };

    setBookings((prev) => {
      const next = [newBooking, ...prev];
      safeSetItem(STORAGE_KEY_BOOKINGS, JSON.stringify(sanitizeBookings(next)));
      return next;
    });

    saveBookingToFirestore(newBooking).catch(console.error);

    if (isSupabaseConfigured) {
      db.createBooking(newBooking).catch((err) => console.error('Supabase live booking insert:', err));
    }

    addAuditLog('create_booking', 'bookings', newBooking.id, {
      booking_code: bookingCode,
      customer: newBooking.customer_name,
      fare: newBooking.total_estimated_amount,
    });

    success(
      'Booking Request Saved!',
      `Booking ID: ${bookingCode}. ${timerMins}-minute confirmation timer started.`
    );

    return newBooking;
  };

  // CONFIRM BOOKING & ATOMIC COMMISSION CREDIT (Admin only)
  const confirmBooking = async (
    bookingId: string,
    verificationData: {
      actual_fare: number;
      confirmed_seats: string;
      actual_operator: string;
      actual_boarding_point: string;
      actual_drop_point: string;
      ticket_pnr: string;
      ticket_doc_url?: string;
      admin_notes?: string;
    }
  ): Promise<boolean> => {
    if (!isAdmin) {
      error('Unauthorized', 'Only administrators can confirm bookings and award commission.');
      return false;
    }

    const target = bookings.find((b) => b.id === bookingId);
    if (!target) {
      error('Error', 'Booking not found.');
      return false;
    }

    if (target.status === 'confirmed') {
      warning('Already Confirmed', 'This booking has already been confirmed and commission was credited.');
      return false;
    }

    if (target.status === 'rejected' || target.status === 'cancelled') {
      error('Invalid State', `Cannot confirm a ${target.status} booking.`);
      return false;
    }

    // Atomic commission check: ensure no prior credit ledger entry exists for this booking
    const alreadyCredited = commissions.some(
      (c) => c.booking_id === bookingId && c.status === 'credited'
    );
    if (alreadyCredited) {
      error('Duplicate Commission Prevented', 'Commission has already been credited for this booking.');
      return false;
    }

    const commRate = settings.commission_rate;
    const nowIso = new Date().toISOString();

    // 1. Update Booking
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'confirmed',
              actual_fare: verificationData.actual_fare,
              confirmed_seats: verificationData.confirmed_seats,
              actual_operator: verificationData.actual_operator,
              actual_boarding_point: verificationData.actual_boarding_point,
              actual_drop_point: verificationData.actual_drop_point,
              ticket_pnr: verificationData.ticket_pnr,
              ticket_doc_url: verificationData.ticket_doc_url,
              admin_notes: verificationData.admin_notes,
              boarding_sathi_status: b.boarding_sathi_opted ? 'boarded_safely' : b.boarding_sathi_status,
              confirmed_by: currentUser?.id,
              confirmed_at: nowIso,
              updated_at: nowIso,
            }
          : b
      )
    );

    // 2. Insert Commission Ledger Entry (₹19.34)
    const newCommissionEntry: CommissionEntry = {
      id: `comm-${Date.now()}`,
      booking_id: bookingId,
      booking_code: target.booking_code,
      agent_id: target.agent_id,
      agent_name: target.agent_name,
      amount: commRate,
      status: 'credited',
      entry_type: 'booking_commission',
      notes: `Automatic commission credited on booking confirmation by admin (${target.booking_code})`,
      created_at: nowIso,
    };

    // 2b. Check if the agent was referred by someone and has now achieved 5 confirmed bookings
    let newReferralBonusEntry: CommissionEntry | null = null;
    const bookedAgent = allProfiles.find((p) => p.id === target.agent_id);
    if (bookedAgent && bookedAgent.referred_by_id) {
      const referrer = allProfiles.find((p) => p.id === bookedAgent.referred_by_id);
      if (referrer) {
        // Count confirmed bookings by this agent (including this one)
        const agentConfirmedBookings = bookings.filter(
          (b) => b.agent_id === bookedAgent.id && b.status === 'confirmed' && b.id !== bookingId
        ).length + 1;

        const reqBookings = settings.referral_required_bookings || 5;
        const refBonus = settings.referral_bonus || 50;

        // Check if referral bonus was already awarded for this referred agent
        const bonusAlreadyAwarded = commissions.some(
          (c) => c.entry_type === 'referral_bonus' && c.referred_agent_id === bookedAgent.id
        );

        if (agentConfirmedBookings >= reqBookings && !bonusAlreadyAwarded) {
          newReferralBonusEntry = {
            id: `comm-ref-${Date.now()}`,
            agent_id: referrer.id,
            agent_name: referrer.full_name,
            amount: refBonus,
            status: 'credited',
            entry_type: 'referral_bonus',
            referred_agent_id: bookedAgent.id,
            referred_agent_name: bookedAgent.full_name,
            notes: `Referral Bonus: ${bookedAgent.full_name} completed ${reqBookings} compulsory confirmed bookings!`,
            created_at: nowIso,
          };
          addAuditLog('award_referral_bonus', 'commission_ledger', newReferralBonusEntry.id, {
            referrer: referrer.full_name,
            referred: bookedAgent.full_name,
            amount: refBonus,
            bookings_completed: agentConfirmedBookings,
          });
          info(
            'Referral Bonus Awarded!',
            `₹${refBonus} credited to ${referrer.full_name} (Referred agent ${bookedAgent.full_name} completed 5 bookings threshold)`
          );
        }
      }
    }

    // 2c. Check if Boarding Sathi was opted (extra ₹33 customer charge, agent receives +₹23 payout, SafarGo keeps ₹10)
    let newBoardingSathiEntry: CommissionEntry | null = null;
    if (target.boarding_sathi_opted) {
      const agentPayout = target.boarding_sathi_agent_payout || 23;
      const entryId = `comm-bs-${Date.now()}`;
      newBoardingSathiEntry = {
        id: entryId,
        booking_id: bookingId,
        booking_code: target.booking_code,
        agent_id: target.agent_id,
        agent_name: target.agent_name,
        amount: agentPayout,
        status: 'credited',
        entry_type: 'bonus',
        notes: `🛡️ बोर्डिंग साथी सेवा मानदेय (+₹${agentPayout}) - यात्री को बस में सुरक्षित बैठाने की सेवा (${target.booking_code})`,
        created_at: nowIso,
      };
      addAuditLog('award_boarding_sathi_payout', 'commission_ledger', entryId, {
        booking_code: target.booking_code,
        agent_name: target.agent_name,
        agent_payout: agentPayout,
        customer_fee: target.boarding_sathi_fee || 33,
        platform_fee: target.boarding_sathi_platform_fee || 10,
      });
      info(
        'बोर्डिंग साथी मानदेय!',
        `+₹${agentPayout} एजेंट ${target.agent_name} के लेज़र में क्रेडिट (बोर्डिंग साथी सेवा: ₹33 शुल्क, ₹10 SafarGo शेयर)`
      );
    }

    setCommissions((prev) => {
      const list = [newCommissionEntry, ...prev];
      if (newReferralBonusEntry) {
        list.unshift(newReferralBonusEntry);
      }
      if (newBoardingSathiEntry) {
        list.unshift(newBoardingSathiEntry);
      }
      return list;
    });

    if (isSupabaseConfigured) {
      db.updateBooking(bookingId, {
        status: 'confirmed',
        actual_fare: verificationData.actual_fare,
        confirmed_seats: verificationData.confirmed_seats,
        actual_operator: verificationData.actual_operator,
        actual_boarding_point: verificationData.actual_boarding_point,
        actual_drop_point: verificationData.actual_drop_point,
        ticket_pnr: verificationData.ticket_pnr,
        ticket_doc_url: verificationData.ticket_doc_url,
        admin_notes: verificationData.admin_notes,
        confirmed_by: currentUser?.id,
        confirmed_at: nowIso,
        updated_at: nowIso,
      }).catch((e) => console.error('Supabase confirm booking sync error:', e));

      db.createCommission(newCommissionEntry).catch((e) => console.error('Supabase commission entry sync error:', e));
    }

    // 3. Audit Log
    addAuditLog('confirm_booking', 'bookings', bookingId, {
      booking_code: target.booking_code,
      commission_credited: commRate,
      pnr: verificationData.ticket_pnr,
      actual_fare: verificationData.actual_fare,
    });

    success(
      'Booking Confirmed!',
      `PNR: ${verificationData.ticket_pnr}. ₹${commRate.toFixed(2)} commission credited to agent ${target.agent_name}.`
    );

    return true;
  };

  // REJECT BOOKING (Admin only)
  const rejectBooking = async (bookingId: string, reason: string): Promise<boolean> => {
    if (!isAdmin) {
      error('Unauthorized', 'Only administrators can reject bookings.');
      return false;
    }

    const target = bookings.find((b) => b.id === bookingId);
    if (!target) return false;

    const nowIso = new Date().toISOString();
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'rejected',
              rejection_reason: reason,
              updated_at: nowIso,
            }
          : b
      )
    );

    if (isSupabaseConfigured) {
      db.updateBooking(bookingId, {
        status: 'rejected',
        rejection_reason: reason,
        updated_at: nowIso,
      }).catch((e) => console.error('Supabase reject booking error:', e));
    }

    // Refund wallet balance if paid from agent_wallet
    if (target.payment_mode === 'agent_wallet') {
      const targetAgent = allProfiles.find((p) => p.id === target.agent_id);
      const refundedBal = (targetAgent?.wallet_balance || 0) + target.total_estimated_amount;
      if (currentUser?.id === target.agent_id) {
        await updateProfile({ wallet_balance: refundedBal });
      } else if (isSupabaseConfigured) {
        db.updateProfile(target.agent_id, { wallet_balance: refundedBal }).catch(console.error);
      }

      const refundTx: WalletTransaction = {
        id: `wtx-${Date.now()}`,
        agent_id: target.agent_id,
        amount: target.total_estimated_amount,
        type: 'refund',
        booking_id: bookingId,
        booking_code: target.booking_code,
        description: `रिफंड: बुकिंग अस्वीकृत होने पर वॉलेट में राशि वापस (${target.booking_code})`,
        balance_after: refundedBal,
        created_at: nowIso,
      };
      setWalletTransactions((prev) => [refundTx, ...prev]);
      if (isSupabaseConfigured) {
        db.createWalletTransaction(refundTx).catch(console.error);
      }
    }


    addAuditLog('reject_booking', 'bookings', bookingId, {
      booking_code: target.booking_code,
      reason,
    });

    info('Booking Rejected', `Reason: ${reason}`);
    return true;
  };

  // REOPEN EXPIRED BOOKING (Admin only)
  const reopenBooking = async (bookingId: string): Promise<boolean> => {
    if (!isAdmin) {
      error('Unauthorized', 'Only administrators can reopen expired bookings.');
      return false;
    }

    const target = bookings.find((b) => b.id === bookingId);
    if (!target) return false;

    // Extend deadline by another 15 minutes from now
    const nowIso = new Date().toISOString();
    const newDeadline = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'awaiting_operator_confirmation',
              deadline_at: newDeadline,
              rejection_reason: undefined,
              updated_at: nowIso,
            }
          : b
      )
    );

    if (isSupabaseConfigured) {
      db.updateBooking(bookingId, {
        status: 'awaiting_operator_confirmation',
        deadline_at: newDeadline,
        rejection_reason: undefined,
        updated_at: nowIso,
      }).catch((e) => console.error('Supabase reopen booking error:', e));
    }

    addAuditLog('reopen_booking', 'bookings', bookingId, {
      booking_code: target.booking_code,
      new_deadline: newDeadline,
    });

    success('Booking Reopened', `New 15-minute response timer started for ${target.booking_code}.`);
    return true;
  };

  // REQUEST CANCELLATION (Agent)
  const requestCancellation = async (bookingId: string, reason: string): Promise<boolean> => {
    const target = bookings.find((b) => b.id === bookingId);
    if (!target) return false;

    if (!isAdmin && target.agent_id !== currentUser?.id) {
      error('Unauthorized', 'You can only request cancellation for your own bookings.');
      return false;
    }

    const nowIso = new Date().toISOString();
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'cancellation_requested',
              cancellation_reason: reason,
              refund_status: 'requested',
              updated_at: nowIso,
            }
          : b
      )
    );

    if (isSupabaseConfigured) {
      db.updateBooking(bookingId, {
        status: 'cancellation_requested',
        cancellation_reason: reason,
        refund_status: 'requested',
        updated_at: nowIso,
      }).catch((e) => console.error('Supabase cancellation request error:', e));
    }

    addAuditLog('request_cancellation', 'bookings', bookingId, {
      booking_code: target.booking_code,
      reason,
    });

    info('Cancellation Requested', 'Admin team will review with bus operator.');
    return true;
  };

  // PROCESS CANCELLATION & REFUNDS (Admin only)
  const processCancellation = async (
    bookingId: string,
    refundStatus: RefundStatus,
    refundAmount: number,
    reverseCommission: boolean
  ): Promise<boolean> => {
    if (!isAdmin) {
      error('Unauthorized', 'Only administrators can process cancellations.');
      return false;
    }

    const target = bookings.find((b) => b.id === bookingId);
    if (!target) return false;

    const nowIso = new Date().toISOString();

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'cancelled',
              refund_status: refundStatus,
              refund_amount: refundAmount,
              updated_at: nowIso,
            }
          : b
      )
    );

    // Apply commission reversal if applicable
    let reversalEntry: CommissionEntry | null = null;
    if (reverseCommission && target.status === 'confirmed') {
      const origCredit = commissions.find(
        (c) => c.booking_id === bookingId && c.status === 'credited'
      );
      if (origCredit) {
        reversalEntry = {
          id: `comm-rev-${Date.now()}`,
          booking_id: bookingId,
          booking_code: target.booking_code,
          agent_id: target.agent_id,
          agent_name: target.agent_name,
          amount: -origCredit.amount,
          status: 'reversed',
          reversal_ref_id: origCredit.id,
          notes: `Commission reversed upon cancellation (${target.booking_code})`,
          created_at: nowIso,
        };
        setCommissions((prev) => [reversalEntry!, ...prev]);
      }
    }

    if (isSupabaseConfigured) {
      db.updateBooking(bookingId, {
        status: 'cancelled',
        refund_status: refundStatus,
        refund_amount: refundAmount,
        updated_at: nowIso,
      }).catch((e) => console.error('Supabase cancel booking sync error:', e));

      if (reversalEntry) {
        db.createCommission(reversalEntry).catch((e) => console.error('Supabase commission reversal sync error:', e));
      }
    }

    addAuditLog('process_cancellation', 'bookings', bookingId, {
      booking_code: target.booking_code,
      refund_status: refundStatus,
      refund_amount: refundAmount,
      commission_reversed: reverseCommission,
    });

    success('Cancellation Finalized', `Status set to Cancelled. Refund: ₹${refundAmount}`);
    return true;
  };

  // BUS TRIPS INVENTORY MANAGEMENT (Admin)
  const addBusTrip = async (trip: Omit<BusTrip, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    if (!isAdmin) {
      error('Unauthorized', 'Only admins can add bus routes.');
      return false;
    }

    const newTrip: BusTrip = {
      ...trip,
      id: `trip-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setBusTrips((prev) => [newTrip, ...prev]);

    if (isSupabaseConfigured) {
      db.createBusTrip(newTrip).catch((e) => console.error('Supabase addBusTrip error:', e));
    }

    addAuditLog('add_bus_trip', 'bus_trips', newTrip.id, { operator: trip.operator_name, route: `${trip.source} to ${trip.destination}` });
    success('Bus Trip Added', `${trip.operator_name} (${trip.source} → ${trip.destination}) is now listed.`);
    return true;
  };

  const updateBusTrip = async (id: string, trip: Partial<BusTrip>): Promise<boolean> => {
    if (!isAdmin) return false;
    const nowIso = new Date().toISOString();
    setBusTrips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...trip, updated_at: nowIso } : t))
    );

    if (isSupabaseConfigured) {
      db.updateBusTrip(id, { ...trip, updated_at: nowIso }).catch((e) => console.error('Supabase updateBusTrip error:', e));
    }

    success('Trip Updated', 'Bus route inventory updated.');
    return true;
  };

  const deleteBusTrip = async (id: string): Promise<boolean> => {
    if (!isAdmin) return false;
    setBusTrips((prev) => prev.filter((t) => t.id !== id));

    if (isSupabaseConfigured) {
      db.deleteBusTrip(id).catch((e) => console.error('Supabase deleteBusTrip error:', e));
    }

    info('Trip Removed', 'Bus route has been removed.');
    return true;
  };

  // SALARY MANAGEMENT (Admin)
  const approveSalary = async (salaryId: string): Promise<boolean> => {
    if (!isAdmin) return false;
    const nowIso = new Date().toISOString();
    setSalaryRecords((prev) =>
      prev.map((s) =>
        s.id === salaryId
          ? {
              ...s,
              status: 'approved',
              approved_by: currentUser?.id,
              approved_at: nowIso,
              updated_at: nowIso,
            }
          : s
      )
    );

    if (isSupabaseConfigured) {
      db.updateSalaryRecord(salaryId, {
        status: 'approved',
        approved_by: currentUser?.id,
        approved_at: nowIso,
        updated_at: nowIso,
      }).catch((e) => console.error('Supabase approveSalary error:', e));
    }

    success('Salary Approved', 'Agent monthly fixed salary approved for payout.');
    return true;
  };

  const markSalaryPaid = async (salaryId: string, paymentReference: string): Promise<boolean> => {
    if (!isAdmin) return false;
    const nowIso = new Date().toISOString();
    setSalaryRecords((prev) =>
      prev.map((s) =>
        s.id === salaryId
          ? {
              ...s,
              status: 'paid',
              paid_by: currentUser?.id,
              paid_at: nowIso,
              payment_reference: paymentReference,
              updated_at: nowIso,
            }
          : s
      )
    );

    if (isSupabaseConfigured) {
      db.updateSalaryRecord(salaryId, {
        status: 'paid',
        paid_by: currentUser?.id,
        paid_at: nowIso,
        payment_reference: paymentReference,
        updated_at: nowIso,
      }).catch((e) => console.error('Supabase markSalaryPaid error:', e));
    }

    success('Salary Marked as Paid', `Payment Ref: ${paymentReference}`);
    return true;
  };

  // PAYOUT REQUESTS & PROCESSING
  const requestPayout = async (
    payoutData: Omit<PayoutRequest, 'id' | 'agent_id' | 'agent_name' | 'agent_mobile' | 'status' | 'created_at'>
  ): Promise<boolean> => {
    if (!currentUser || currentUser.role !== 'agent') {
      error('Unauthorized', 'केवल अधिकृत एजेंट ही निकासी अनुरोध दर्ज कर सकते हैं।');
      return false;
    }
    if (!isApprovedAgent) {
      error('Approval Required', 'केवल स्वीकृत एजेंट ही निकासी अनुरोध कर सकते हैं।');
      return false;
    }

    // Calculate available net commission
    const totalCredited = agentCommissions
      .filter((c) => c.status === 'credited')
      .reduce((sum, c) => sum + c.amount, 0);
    const totalReversed = agentCommissions
      .filter((c) => c.status === 'reversed')
      .reduce((sum, c) => sum + Math.abs(c.amount), 0);
    const totalWithdrawnOrPending = payoutRequests
      .filter((p) => p.agent_id === currentUser.id && p.status !== 'rejected')
      .reduce((sum, p) => sum + p.amount, 0);

    const netCommission = Math.max(0, totalCredited - totalReversed);

    // Check if 150 target is met in current calendar month
    const currentMonthConfirmed = bookings.filter((b) => {
      if (b.agent_id !== currentUser.id || b.status !== 'confirmed') return false;
      const bDate = new Date(b.created_at);
      const bMonthYear = `${bDate.getFullYear()}-${String(bDate.getMonth() + 1).padStart(2, '0')}`;
      return bMonthYear === currentMonthYear;
    }).length;

    const isTargetMet = currentMonthConfirmed >= settings.monthly_target;
    // Salary Base Model: 150 bookings guarantees ₹5,000 base salary!
    // If agent didn't withdraw early, they get the full ₹5,000.
    const effectiveTotalEarnings = isTargetMet
      ? Math.max(netCommission, settings.monthly_salary)
      : netCommission;

    const availableBalance = Math.max(0, effectiveTotalEarnings - totalWithdrawnOrPending);

    if (payoutData.amount > availableBalance) {
      error('Insufficient Balance', `निकासी राशि उपलब्ध शेष (₹${availableBalance.toFixed(2)}) से अधिक नहीं हो सकती।`);
      return false;
    }

    if (payoutData.amount <= 0) {
      error('Invalid Amount', 'कृपया ₹1 या अधिक की मान्य राशि दर्ज करें।');
      return false;
    }

    const newPayout: PayoutRequest = {
      id: `payout-${Date.now()}`,
      agent_id: currentUser.id,
      agent_name: currentUser.full_name,
      agent_mobile: currentUser.mobile,
      ...payoutData,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    setPayoutRequests((prev) => [newPayout, ...prev]);

    if (isSupabaseConfigured) {
      db.createPayoutRequest(newPayout).catch((e) => console.error('Supabase payout create sync error:', e));
    }

    addAuditLog('request_payout', 'payout_requests', newPayout.id, {
      amount: newPayout.amount,
      method: newPayout.payout_method,
    });
    success('Payout Requested', `₹${newPayout.amount.toFixed(2)} निकासी अनुरोध SafarGo एडमिन को भेज दिया गया है।`);
    return true;
  };

  const approvePayout = async (payoutId: string, adminReference: string, notes?: string): Promise<boolean> => {
    if (!isAdmin) {
      error('Unauthorized', 'केवल एडमिन ही पेआउट स्वीकृत कर सकते हैं।');
      return false;
    }

    const processedAt = new Date().toISOString();
    setPayoutRequests((prev) =>
      prev.map((p) =>
        p.id === payoutId
          ? {
              ...p,
              status: 'approved',
              admin_reference: adminReference,
              admin_notes: notes,
              processed_at: processedAt,
            }
          : p
      )
    );

    if (isSupabaseConfigured) {
      db.updatePayoutRequest(payoutId, {
        status: 'approved',
        admin_reference: adminReference,
        admin_notes: notes,
        processed_at: processedAt,
      }).catch((e) => console.error('Supabase approvePayout error:', e));
    }

    addAuditLog('approve_payout', 'payout_requests', payoutId, {
      admin_reference: adminReference,
      notes,
    });
    success('Payout Approved', `पेआउट संदर्भ (${adminReference}) के साथ स्वीकृत कर दिया गया है।`);
    return true;
  };

  const rejectPayout = async (payoutId: string, reason: string): Promise<boolean> => {
    if (!isAdmin) {
      error('Unauthorized', 'केवल एडमिन ही पेआउट अस्वीकृत कर सकते हैं।');
      return false;
    }

    const processedAt = new Date().toISOString();
    setPayoutRequests((prev) =>
      prev.map((p) =>
        p.id === payoutId
          ? {
              ...p,
              status: 'rejected',
              admin_notes: reason,
              processed_at: processedAt,
            }
          : p
      )
    );

    if (isSupabaseConfigured) {
      db.updatePayoutRequest(payoutId, {
        status: 'rejected',
        admin_notes: reason,
        processed_at: processedAt,
      }).catch((e) => console.error('Supabase rejectPayout error:', e));
    }

    addAuditLog('reject_payout', 'payout_requests', payoutId, { reason });
    warning('Payout Rejected', 'निकासी अनुरोध अस्वीकृत कर दिया गया है।');
    return true;
  };

  // SETTINGS (Admin)
  const updateSettings = async (newSettings: Partial<AdminSettings>): Promise<boolean> => {
    if (!isAdmin) {
      error('Unauthorized', 'Only administrators can modify system settings.');
      return false;
    }
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addAuditLog('update_settings', 'admin_settings', undefined, newSettings);
    success('Settings Saved', 'Platform rates and operational rules updated.');
    return true;
  };

  const updateAnnouncement = async (announcementData: Partial<AdminAnnouncement>): Promise<boolean> => {
    if (!isAdmin) {
      error('Unauthorized', 'Only administrators can broadcast announcements.');
      return false;
    }
    const updatedAnnouncement: AdminAnnouncement = {
      ...settings.announcement,
      ...announcementData,
      updated_at: new Date().toISOString(),
    };
    setSettings((prev) => ({
      ...prev,
      announcement: updatedAnnouncement,
    }));
    addAuditLog('update_announcement', 'admin_settings', undefined, updatedAnnouncement);
    success(
      updatedAnnouncement.is_active ? 'घोषणा प्रसारित की गई (Broadcast Active)' : 'घोषणा निष्क्रिय की गई (Announcement Disabled)',
      updatedAnnouncement.title
    );
    return true;
  };

  const addCustomFeature = async (feature: Omit<CustomFeature, 'id' | 'created_at'>): Promise<boolean> => {
    if (!isAdmin) {
      error('Unauthorized', 'Only administrators can add custom features.');
      return false;
    }
    const newFeature: CustomFeature = {
      ...feature,
      id: `feat-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setSettings((prev) => ({
      ...prev,
      custom_features: [...(prev.custom_features || []), newFeature],
    }));
    addAuditLog('add_custom_feature', 'custom_features', newFeature.id, { title: newFeature.title });
    success('नई फंक्शनैलिटी जोड़ी गई (Feature Added)', `"${newFeature.title}" अब एजेंटों के लिए उपलब्ध है।`);
    return true;
  };

  const updateCustomFeature = async (id: string, updatedFields: Partial<CustomFeature>): Promise<boolean> => {
    if (!isAdmin) {
      error('Unauthorized', 'Only administrators can edit features.');
      return false;
    }
    setSettings((prev) => ({
      ...prev,
      custom_features: (prev.custom_features || []).map((f) =>
        f.id === id ? { ...f, ...updatedFields } : f
      ),
    }));
    addAuditLog('update_custom_feature', 'custom_features', id, updatedFields);
    success('Feature Updated', 'फंक्शनैलिटी सेटिंग्स अपडेट कर दी गई हैं।');
    return true;
  };

  const deleteCustomFeature = async (id: string): Promise<boolean> => {
    if (!isAdmin) {
      error('Unauthorized', 'Only administrators can delete features.');
      return false;
    }
    setSettings((prev) => ({
      ...prev,
      custom_features: (prev.custom_features || []).filter((f) => f.id !== id),
    }));
    addAuditLog('delete_custom_feature', 'custom_features', id);
    info('Feature Removed', 'कस्टम फंक्शनैलिटी हटा दी गई है।');
    return true;
  };

  const toggleCustomFeature = async (id: string): Promise<boolean> => {
    if (!isAdmin) return false;
    const target = settings.custom_features?.find((f) => f.id === id);
    if (!target) return false;
    const newStatus = !target.is_active;
    return updateCustomFeature(id, { is_active: newStatus });
  };

  // WALLET RECHARGE SYSTEM (Agents can deposit, Min ₹2,000)
  const requestWalletRecharge = async (
    amount: number,
    utr: string,
    screenshotUrl?: string,
    paymentMethod: 'upi_qr' | 'bank_transfer' = 'upi_qr'
  ): Promise<boolean> => {
    // Determine active agent (logged in agent, admin, or fallback active agent profile)
    const activeAgent =
      currentUser && (currentUser.role === 'agent' || currentUser.role === 'admin')
        ? currentUser
        : allProfiles.find((p) => p.role === 'agent') || {
            id: 'usr-agent-01',
            full_name: 'पवन कुमार वर्मा (एजेंट)',
            mobile: '9826011223',
            role: 'agent',
          };

    if (amount <= 0) {
      error('अमान्य राशि', 'कृपया ₹1 या अधिक की मान्य राशि दर्ज करें।');
      return false;
    }
    if (!utr || !utr.trim()) {
      error('UTR Required', 'कृपया बैंक ट्रांसफर / UPI UTR नंबर दर्ज करें।');
      return false;
    }

    const rechargeId = `rech-${Date.now()}`;
    const newRecharge: WalletRechargeRequest = {
      id: rechargeId,
      agent_id: activeAgent.id,
      agent_name: activeAgent.full_name,
      agent_mobile: activeAgent.mobile,
      amount,
      payment_method: paymentMethod,
      utr_number: utr.trim(),
      screenshot_url: screenshotUrl,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    setWalletRecharges((prev) => [newRecharge, ...prev]);

    // Non-blocking background sync to Firebase Storage & Firestore
    if (screenshotUrl && screenshotUrl.startsWith('data:image/')) {
      uploadScreenshotToFirebase(screenshotUrl, 'wallet_receipts')
        .then((remoteUrl) => {
          if (remoteUrl) {
            const updated = { ...newRecharge, screenshot_url: remoteUrl };
            setWalletRecharges((prev) => prev.map((r) => (r.id === rechargeId ? updated : r)));
            saveWalletRechargeToFirestore(updated).catch(console.error);
          } else {
            saveWalletRechargeToFirestore(newRecharge).catch(console.error);
          }
        })
        .catch(() => {
          saveWalletRechargeToFirestore(newRecharge).catch(console.error);
        });
    } else {
      saveWalletRechargeToFirestore(newRecharge).catch(console.error);
    }

    if (isSupabaseConfigured) {
      db.createWalletRecharge(newRecharge).catch(console.error);
    }

    addAuditLog('request_wallet_recharge', 'wallet_recharge_requests', newRecharge.id, {
      amount,
      utr,
    });

    success(
      '💥 Boom! Your amount added soon!',
      `हम वेरीफाई कर रहे हैं! 10 मिनट के टाइमर तक वेट कीजिए, पैसे वॉलेट में जमा हो जाएंगे।`
    );
    return true;
  };

  const approveWalletRecharge = async (rechargeId: string, adminNotes?: string): Promise<boolean> => {
    if (!isAdmin) {
      error('Unauthorized', 'केवल एडमिन ही वॉलेट रिचार्ज स्वीकृत कर सकते हैं।');
      return false;
    }

    const recharge = walletRecharges.find((r) => r.id === rechargeId);
    if (!recharge || recharge.status !== 'pending') return false;

    const nowIso = new Date().toISOString();
    const approvedRecharge: WalletRechargeRequest = {
      ...recharge,
      status: 'approved',
      admin_notes: adminNotes,
      approved_by: currentUser?.id,
      approved_at: nowIso,
    };

    setWalletRecharges((prev) => {
      const next = prev.map((r) => (r.id === rechargeId ? approvedRecharge : r));
      safeSetItem(STORAGE_KEY_WALLET_RECHARGES, JSON.stringify(sanitizeWalletRecharges(next)));
      return next;
    });

    saveWalletRechargeToFirestore(approvedRecharge).catch(console.error);

    const targetProfile = allProfiles.find(
      (p) => p.id === recharge.agent_id || (recharge.agent_mobile && p.mobile === recharge.agent_mobile)
    );
    const targetAgentId = targetProfile ? targetProfile.id : recharge.agent_id;
    const currentBal = computeWalletBalanceForAgent(
      targetAgentId,
      recharge.agent_mobile,
      targetProfile?.wallet_balance
    );
    const newBal = currentBal + Number(recharge.amount || 0);

    await updateUserProfile(targetAgentId, {
      wallet_balance: newBal,
      agent_status: 'approved',
    });

    const creditTx: WalletTransaction = {
      id: `wtx-${Date.now()}`,
      agent_id: targetAgentId,
      amount: Number(recharge.amount || 0),
      type: 'recharge',
      recharge_id: recharge.id,
      description: `वॉलेट रिचार्ज स्वीकृत (UTR: ${recharge.utr_number})`,
      balance_after: newBal,
      created_at: nowIso,
    };
    setWalletTransactions((prev) => {
      const next = [creditTx, ...prev];
      safeSetItem(STORAGE_KEY_WALLET_TX, JSON.stringify(next));
      return next;
    });

    if (isSupabaseConfigured) {
      db.updateWalletRecharge(rechargeId, {
        status: 'approved',
        admin_notes: adminNotes,
        approved_by: currentUser?.id,
        approved_at: nowIso,
      }).catch(console.error);
      db.createWalletTransaction(creditTx).catch(console.error);
    }

    addAuditLog('approve_wallet_recharge', 'wallet_recharges', recharge.id, {
      agent_id: targetAgentId,
      amount: recharge.amount,
      new_balance: newBal,
    });

    success(
      '✅ वॉलेट रिचार्ज वेरीफाइड व स्वीकृत!',
      `${recharge.agent_name} के वॉलेट में ₹${recharge.amount.toLocaleString('en-IN')} तुरंत जमा हो गए हैं! (नया बैलेंस: ₹${newBal.toLocaleString('en-IN')})`
    );
    return true;
  };

  const rejectWalletRecharge = async (rechargeId: string, reason: string): Promise<boolean> => {
    if (!isAdmin) return false;
    const recharge = walletRecharges.find((r) => r.id === rechargeId);
    if (!recharge || recharge.status !== 'pending') return false;

    const nowIso = new Date().toISOString();
    const rejectedRecharge: WalletRechargeRequest = {
      ...recharge,
      status: 'rejected',
      admin_notes: reason,
      approved_by: currentUser?.id,
      approved_at: nowIso,
    };

    setWalletRecharges((prev) => {
      const next = prev.map((r) => (r.id === rechargeId ? rejectedRecharge : r));
      safeSetItem(STORAGE_KEY_WALLET_RECHARGES, JSON.stringify(sanitizeWalletRecharges(next)));
      return next;
    });

    saveWalletRechargeToFirestore(rejectedRecharge).catch(console.error);

    if (isSupabaseConfigured) {
      db.updateWalletRecharge(rechargeId, {
        status: 'rejected',
        admin_notes: reason,
        approved_by: currentUser?.id,
        approved_at: nowIso,
      }).catch(console.error);
    }

    warning('Recharge Rejected', `वॉलेट रिचार्ज अस्वीकृत: ${reason}`);
    return true;
  };

  const adjustAgentWallet = async (
    agentId: string,
    amount: number,
    type: 'credit' | 'debit',
    reason: string
  ): Promise<boolean> => {
    if (!isAdmin) {
      error('Unauthorized', 'केवल एडमिन ही एजेंट के वॉलेट में बदलाव कर सकते हैं।');
      return false;
    }

    if (!agentId || amount <= 0 || !reason.trim()) {
      error('Invalid Input', 'कृपया वैध राशि और कारण दर्ज करें।');
      return false;
    }

    const targetProfile = allProfiles.find((p) => p.id === agentId);
    if (!targetProfile) {
      error('Agent Not Found', 'यह एजेंट सिस्टम में नहीं मिला।');
      return false;
    }

    const currentBal = computeWalletBalanceForAgent(
      agentId,
      targetProfile.mobile,
      targetProfile.wallet_balance
    );
    let newBal = currentBal;

    if (type === 'credit') {
      newBal = currentBal + amount;
    } else {
      if (currentBal < amount) {
        error(
          'Insufficient Balance',
          `एजेंट का वर्तमान बैलेंस केवल ₹${currentBal.toLocaleString('en-IN')} है, ₹${amount.toLocaleString('en-IN')} नहीं काटा जा सकता।`
        );
        return false;
      }
      newBal = currentBal - amount;
    }

    const nowIso = new Date().toISOString();

    await updateUserProfile(agentId, { wallet_balance: newBal });

    const adjTx: WalletTransaction = {
      id: `wtx-${Date.now()}`,
      agent_id: agentId,
      amount: amount,
      type: 'adjustment',
      description: `एडमिन द्वारा मैन्युअल ${type === 'credit' ? 'क्रेडिट (+)' : 'डेबिट (-)'}: ${reason.trim()}`,
      balance_after: newBal,
      created_at: nowIso,
    };

    setWalletTransactions((prev) => {
      const next = [adjTx, ...prev];
      safeSetItem(STORAGE_KEY_WALLET_TX, JSON.stringify(next));
      return next;
    });
    if (isSupabaseConfigured) {
      db.createWalletTransaction(adjTx).catch(console.error);
    }

    addAuditLog(
      type === 'credit' ? 'admin_wallet_credit' : 'admin_wallet_debit',
      'profiles',
      agentId,
      {
        amount,
        type,
        reason,
        previous_balance: currentBal,
        new_balance: newBal,
      }
    );

    success(
      'वॉलेट बैलेंस अपडेट!',
      `${targetProfile.full_name} के वॉलेट में ₹${amount.toLocaleString('en-IN')} ${type === 'credit' ? 'सफलतापूर्वक जोड़े गए' : 'सफलतापूर्वक काटे गए'}। नया बैलेंस: ₹${newBal.toLocaleString('en-IN')}`
    );

    return true;
  };

  // Viral Creator & Social Media Promotion Handlers
  const submitPromotionClaim = async (claimData: {
    user_name: string;
    user_mobile: string;
    platform: PromotionPlatform;
    content_type: PromotionContentType;
    post_url: string;
    channel_or_handle: string;
    views_count: number;
    screenshot_url?: string;
    payout_method: 'wallet' | 'upi' | 'bank';
    upi_id?: string;
    bank_details?: string;
  }): Promise<boolean> => {
    if (!claimData.post_url || !claimData.post_url.trim()) {
      error('URL Required', 'कृपया अपनी Instagram Reel या YouTube वीडियो का लिंक दर्ज करें।');
      return false;
    }

    const isInsta = claimData.platform === 'instagram';
    const targetViews = isInsta
      ? (settings.promo_instagram_target_views || 1000000)
      : (settings.promo_youtube_target_views || 10000);
    const rewardAmount = isInsta
      ? (settings.promo_instagram_reward || 500)
      : (settings.promo_youtube_reward || 100);

    const now = new Date();
    const slaHours = settings.promo_sla_hours || 24;
    const deadline = new Date(now.getTime() + slaHours * 60 * 60 * 1000).toISOString();
    const dateCode = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.floor(100 + Math.random() * 900);
    const claimCode = `PRM-${dateCode}-${randSuffix}`;

    const newClaim: PromotionClaim = {
      id: `prm-${Date.now()}`,
      claim_code: claimCode,
      user_id: currentUser?.id || `guest-${Date.now()}`,
      user_name: claimData.user_name.trim() || currentUser?.full_name || 'Creator',
      user_mobile: claimData.user_mobile.trim() || currentUser?.mobile || '',
      user_role: currentUser?.role || 'creator',
      platform: claimData.platform,
      content_type: claimData.content_type,
      post_url: claimData.post_url.trim(),
      channel_or_handle: claimData.channel_or_handle.trim() || '@creator',
      views_count: Number(claimData.views_count) || 0,
      reward_amount: rewardAmount,
      screenshot_url: claimData.screenshot_url,
      payout_method: claimData.payout_method,
      upi_id: claimData.upi_id?.trim(),
      bank_details: claimData.bank_details?.trim(),
      status: 'pending',
      created_at: now.toISOString(),
      deadline_at: deadline,
    };

    setPromotionClaims((prev) => [newClaim, ...prev]);
    if (isSupabaseConfigured) {
      db.createPromotionClaim(newClaim).catch(console.error);
    }

    addAuditLog('submit_promotion_claim', 'promotion_claims', newClaim.id, {
      platform: newClaim.platform,
      views: newClaim.views_count,
      reward: newClaim.reward_amount,
    });

    success(
      'प्रमोशन क्लेम सबमिट हुआ! 🚀',
      `आपका क्लेम ID #${newClaim.claim_code} दर्ज कर लिया गया है। SafarGo टीम 24 घंटे के अंदर व्यूज चेक करके ₹${newClaim.reward_amount} बोनस क्रेडिट करेगी!`
    );
    return true;
  };

  const approvePromotionClaim = async (
    claimId: string,
    paymentReference?: string,
    notes?: string
  ): Promise<boolean> => {
    if (!isAdmin) {
      error('Unauthorized', 'केवल एडमिन ही प्रमोशन क्लेम स्वीकृत कर सकते हैं।');
      return false;
    }

    const claim = promotionClaims.find((c) => c.id === claimId);
    if (!claim || claim.status !== 'pending') return false;

    const nowIso = new Date().toISOString();
    const txnRef = paymentReference?.trim() || `TXN-PRM-${Date.now().toString().slice(-6)}`;

    setPromotionClaims((prev) =>
      prev.map((c) =>
        c.id === claimId
          ? {
              ...c,
              status: 'paid',
              payment_reference: txnRef,
              admin_notes: notes || 'Verified genuine views & SafarGo mention.',
              reviewed_by: currentUser?.id,
              reviewed_at: nowIso,
            }
          : c
      )
    );

    // If payout method is 'wallet' and user is an agent, credit agent's wallet
    const targetProfile = allProfiles.find((p) => p.id === claim.user_id);
    if (claim.payout_method === 'wallet' && targetProfile && targetProfile.role === 'agent') {
      const currentBal = targetProfile.wallet_balance || 0;
      const newBal = currentBal + claim.reward_amount;

      if (currentUser?.id === claim.user_id) {
        await updateProfile({ wallet_balance: newBal });
      } else if (isSupabaseConfigured) {
        db.updateProfile(claim.user_id, { wallet_balance: newBal }).catch(console.error);
      }

      const creditTx: WalletTransaction = {
        id: `wtx-${Date.now()}`,
        agent_id: claim.user_id,
        amount: claim.reward_amount,
        type: 'adjustment',
        description: `Viral Promotion Bonus (${claim.platform.toUpperCase()} - ${claim.claim_code})`,
        balance_after: newBal,
        created_at: nowIso,
      };

      setWalletTransactions((prev) => [creditTx, ...prev]);
      if (isSupabaseConfigured) {
        db.createWalletTransaction(creditTx).catch(console.error);
      }
    }

    if (isSupabaseConfigured) {
      db.updatePromotionClaim(claimId, {
        status: 'paid',
        payment_reference: txnRef,
        admin_notes: notes || 'Verified genuine views & SafarGo mention.',
        reviewed_by: currentUser?.id,
        reviewed_at: nowIso,
      }).catch(console.error);
    }

    addAuditLog('approve_promotion_claim', 'promotion_claims', claimId, {
      reward_amount: claim.reward_amount,
      payout_method: claim.payout_method,
      payment_reference: txnRef,
    });

    success(
      'प्रमोशन स्वीकृत व भुगतान संपन्न! ✅',
      `${claim.user_name} को ${claim.platform.toUpperCase()} के लिए ₹${claim.reward_amount} बोनस स्वीकृत व भुगतान किया गया।`
    );
    return true;
  };

  const rejectPromotionClaim = async (claimId: string, reason: string): Promise<boolean> => {
    if (!isAdmin) return false;
    const claim = promotionClaims.find((c) => c.id === claimId);
    if (!claim) return false;

    const nowIso = new Date().toISOString();
    setPromotionClaims((prev) =>
      prev.map((c) =>
        c.id === claimId
          ? {
              ...c,
              status: 'rejected',
              rejection_reason: reason,
              reviewed_by: currentUser?.id,
              reviewed_at: nowIso,
            }
          : c
      )
    );

    if (isSupabaseConfigured) {
      db.updatePromotionClaim(claimId, {
        status: 'rejected',
        rejection_reason: reason,
        reviewed_by: currentUser?.id,
        reviewed_at: nowIso,
      }).catch(console.error);
    }

    addAuditLog('reject_promotion_claim', 'promotion_claims', claimId, { reason });
    warning('Promotion Rejected', `प्रमोशन क्लेम अस्वीकृत: ${reason}`);
    return true;
  };

  // =====================================================================
  // PROMOTER PARTNER PROGRAM METHODS (5 SLOTS, ₹15K SALARY, 500 TARGET)
  // =====================================================================
  const submitPromoterApplication = async (data: {
    applicant_name: string;
    mobile: string;
    email: string;
    city: string;
    district: string;
    experience_note: string;
    application_fee_utr: string;
  }): Promise<boolean> => {
    // Check if 5 slots are already filled
    const onboardedCount = promoterApplications.filter((p) => p.status === 'onboarded_499_paid').length;
    if (onboardedCount >= 5) {
      error('Slots Full', 'सफ़ारगो प्रमोटर पार्टनर के सभी 5 पद पूर्ण हो चुके हैं!');
      return false;
    }

    const cleanUtr = data.application_fee_utr.trim();
    if (cleanUtr.length < 6) {
      error('Invalid UTR', 'कृपया वैध 12-अंकों का UPI/UTR रेफरेंस नंबर दर्ज करें।');
      return false;
    }

    const nowIso = new Date().toISOString();
    const threeMonthsLater = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

    const newApp: PromoterApplication = {
      id: `prm-app-${Date.now()}`,
      applicant_name: data.applicant_name.trim(),
      mobile: data.mobile.trim(),
      email: data.email.trim(),
      city: data.city.trim(),
      district: data.district.trim(),
      experience_note: data.experience_note.trim(),
      application_fee: 149,
      application_fee_utr: cleanUtr,
      status: 'applied_149_paid',
      onboarding_fee: 499,
      target_verified_agents: 500,
      current_verified_agents: 0,
      current_total_agents: 0,
      fee_refund_eligible: false,
      created_at: nowIso,
      deadline_at: threeMonthsLater,
    };

    setPromoterApplications((prev) => [newApp, ...prev]);
    addAuditLog('submit_promoter_app', 'promoter_applications', newApp.id, { applicant: data.applicant_name });
    success('आवेदन सफलतापूर्वक जमा हुआ! 🎉', '₹149 आवेदन शुल्क दर्ज हुआ। सुपर एडमिन द्वारा इंटरव्यू शेड्यूल किया जाएगा।');
    return true;
  };

  const schedulePromoterInterview = async (appId: string, interviewDate: string, notes?: string): Promise<boolean> => {
    if (!isAdmin) return false;
    setPromoterApplications((prev) =>
      prev.map((app) =>
        app.id === appId
          ? {
              ...app,
              status: 'interview_scheduled',
              interview_date: interviewDate,
              interview_notes: notes || 'सुपर एडमिन द्वारा टेलीफोनिक/गूगल मीट इंटरव्यू निर्धारित।',
            }
          : app
      )
    );
    addAuditLog('schedule_promoter_interview', 'promoter_applications', appId, { interviewDate });
    success('इंटरव्यू शेड्यूल हुआ', `प्रमोटर इंटरव्यू दिनांक: ${interviewDate}`);
    return true;
  };

  const passPromoterInterview = async (appId: string, notes?: string): Promise<boolean> => {
    if (!isAdmin) return false;
    setPromoterApplications((prev) =>
      prev.map((app) =>
        app.id === appId
          ? {
              ...app,
              status: 'interview_passed',
              interview_notes: notes || (app.interview_notes ? app.interview_notes + ' | इंटरव्यू पास' : 'इंटरव्यू पास'),
            }
          : app
      )
    );
    addAuditLog('pass_promoter_interview', 'promoter_applications', appId, {});
    success('इंटरव्यू पास! ✅', 'उम्मीदवार शॉर्टलिस्ट हुआ। अब ₹499 ऑनबोर्डिंग शुल्क दर्ज करके स्लॉट अलॉट करें।');
    return true;
  };

  const onboardPromoterPartner = async (
    appId: string,
    onboardingUtr: string,
    slotNo: number,
    userId?: string,
    password?: string
  ): Promise<boolean> => {
    if (!isAdmin) return false;
    const target = promoterApplications.find((a) => a.id === appId);
    if (!target) return false;

    if (slotNo < 1 || slotNo > 5) {
      error('Invalid Slot', 'स्लॉट नंबर केवल 1 से 5 के मध्य हो सकता है।');
      return false;
    }

    const nowIso = new Date().toISOString();
    const threeMonthsLater = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
    const promoterCode = `PRM-MP-0${slotNo}`;

    setPromoterApplications((prev) =>
      prev.map((app) =>
        app.id === appId
          ? {
              ...app,
              status: 'onboarded_499_paid',
              onboarding_fee_utr: onboardingUtr.trim(),
              assigned_slot: slotNo,
              promoter_code: promoterCode,
              promoter_user_id: userId || app.promoter_user_id || app.mobile,
              promoter_password: password || app.promoter_password || 'Promoter@123',
              deadline_at: threeMonthsLater,
            }
          : app
      )
    );

    addAuditLog('onboard_promoter', 'promoter_applications', appId, { slotNo, promoterCode });
    success('प्रमोटर पार्टनर ऑनबोर्ड! 🚀', `${target.applicant_name} को स्लॉट #${slotNo} (${promoterCode}) अलॉट हुआ। ₹15,000 मानदेय एक्टिव!`);
    return true;
  };

  const setPromoterCredentials = async (
    appId: string,
    userId: string,
    password: string,
    slotNo?: number
  ): Promise<boolean> => {
    if (!isAdmin) return false;
    const target = promoterApplications.find((a) => a.id === appId);
    if (!target) return false;

    setPromoterApplications((prev) =>
      prev.map((app) =>
        app.id === appId
          ? {
              ...app,
              promoter_user_id: userId.trim(),
              promoter_password: password.trim(),
              ...(slotNo ? { assigned_slot: slotNo, promoter_code: `PRM-MP-0${slotNo}` } : {}),
            }
          : app
      )
    );

    addAuditLog('set_promoter_credentials', 'promoter_applications', appId, { userId });
    success('प्रमोटर क्रेडेंशियल्स अपडेट! 🔑', `${target.applicant_name} के लिए यूजर आईडी (${userId}) और पासवर्ड सेव हो गया है।`);
    return true;
  };

  const refundPromoterFee = async (appId: string): Promise<boolean> => {
    if (!isAdmin) return false;
    const target = promoterApplications.find((a) => a.id === appId);
    if (!target) return false;

    const nowIso = new Date().toISOString();
    setPromoterApplications((prev) =>
      prev.map((app) =>
        app.id === appId
          ? {
              ...app,
              fee_refund_eligible: true,
              fee_refunded_at: nowIso,
            }
          : app
      )
    );

    addAuditLog('refund_promoter_fee', 'promoter_applications', appId, { totalRefund: 648 });
    success('100% फीस रिफंड सफल! 💰', `${target.applicant_name} को ₹648 (₹149 + ₹499) का 100% रिफंड जारी कर दिया गया है।`);
    return true;
  };

  // =====================================================================
  // LOCAL DUKANDAR (SHOPKEEPER) SUBSCRIPTIONS & CATALOG METHODS
  // =====================================================================
  const addPartnerShop = async (shopData: Omit<PartnerShop, 'id' | 'created_at'>): Promise<boolean> => {
    const newShop: PartnerShop = {
      ...shopData,
      id: `shop-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setPartnerShops((prev) => [newShop, ...prev]);
    addAuditLog('add_partner_shop', 'partner_shops', newShop.id, { shopName: newShop.shop_name });
    success('लोकल दुकान सफलतापूर्वक जुड़ी! 🏪', `${newShop.shop_name} (${newShop.subscription_plan_name}) प्लेटफॉर्म पर लिस्ट हो गई है।`);
    return true;
  };

  const updatePartnerShop = async (shopId: string, updates: Partial<PartnerShop>): Promise<boolean> => {
    setPartnerShops((prev) =>
      prev.map((s) => (s.id === shopId ? { ...s, ...updates } : s))
    );
    success('दुकान जानकारी अपडेट हुई', 'पार्टनर दुकान विवरण सुरक्षित हुआ।');
    return true;
  };

  const addPartnerShopItem = async (shopId: string, item: Omit<PartnerShopItem, 'id'>): Promise<boolean> => {
    const newItem: PartnerShopItem = {
      ...item,
      id: `item-${Date.now()}`,
    };
    setPartnerShops((prev) =>
      prev.map((s) =>
        s.id === shopId
          ? {
              ...s,
              catalog_items: [...(s.catalog_items || []), newItem],
            }
          : s
      )
    );
    success('सामान लिस्ट हुआ! 📦', `${item.name} दुकान कैटलॉग में सफलतापूर्वक जुड़ गया।`);
    return true;
  };

  const togglePartnerShopItemStock = async (shopId: string, itemId: string): Promise<boolean> => {
    setPartnerShops((prev) =>
      prev.map((s) =>
        s.id === shopId
          ? {
              ...s,
              catalog_items: (s.catalog_items || []).map((it) =>
                it.id === itemId ? { ...it, in_stock: !it.in_stock } : it
              ),
            }
          : s
      )
    );
    return true;
  };

  // =====================================================================
  // DAILY AGENT CALLING & FIELD AUDIT METHODS
  // =====================================================================
  const logAgentCall = async (callData: Omit<AgentCallLog, 'id' | 'created_at'>): Promise<boolean> => {
    const newLog: AgentCallLog = {
      ...callData,
      id: `call-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setAgentCallLogs((prev) => [newLog, ...prev]);
    addAuditLog('log_agent_call', 'agent_call_logs', newLog.id, { agentName: callData.agent_name });
    success('कॉल लॉग दर्ज हुआ 📞', `${callData.agent_name} की दैनिक कॉलिंग व एक्टिविटी चेक-इन सेव हो गई।`);
    return true;
  };

  // =====================================================================
  // SAFARGO 15-MINUTE QUICK DELIVERY METHODS (DISTANCE SPLIT MODEL)
  // =====================================================================
  const agentQuickDeliveryOrders = useMemo(() => {
    if (!currentUser) return [];
    return quickDeliveryOrders.filter(
      (o) => !o.agent_id || o.agent_id === currentUser.id
    );
  }, [quickDeliveryOrders, currentUser]);

  const calculateDeliveryPricing = (distanceKm: number) => {
    const km = Math.max(0.1, Number(distanceKm) || 1);
    if (km <= 2) {
      return { delivery_fee: 25, agent_payout: 18, safargo_platform_fee: 7 };
    } else if (km <= 4) {
      return { delivery_fee: 45, agent_payout: 34, safargo_platform_fee: 11 };
    } else if (km <= 6) {
      return { delivery_fee: 65, agent_payout: 50, safargo_platform_fee: 15 };
    } else {
      const extraKm = Math.ceil(km - 6);
      return {
        delivery_fee: 65 + extraKm * 10,
        agent_payout: 50 + extraKm * 8,
        safargo_platform_fee: 15 + extraKm * 2,
      };
    }
  };

  const createDeliveryOrder = async (orderData: {
    customer_name: string;
    customer_mobile: string;
    customer_address: string;
    city: string;
    items_description: string;
    distance_km: number;
    pickup_mode: 'local_concierge' | 'partner_shop';
    partner_shop_id?: string;
    partner_shop_name?: string;
  }): Promise<QuickDeliveryOrder | null> => {
    const pricing = calculateDeliveryPricing(orderData.distance_km);
    const nowIso = new Date().toISOString();
    const newOrder: QuickDeliveryOrder = {
      id: `dlv-${Date.now()}`,
      order_code: `SFG-DLV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      customer_name: orderData.customer_name.trim(),
      customer_mobile: orderData.customer_mobile.trim(),
      customer_address: orderData.customer_address.trim(),
      city: orderData.city.trim(),
      items_description: orderData.items_description.trim(),
      distance_km: orderData.distance_km,
      pickup_mode: orderData.pickup_mode,
      partner_shop_id: orderData.partner_shop_id,
      partner_shop_name: orderData.partner_shop_name,
      delivery_fee: pricing.delivery_fee,
      agent_payout: pricing.agent_payout,
      safargo_platform_fee: pricing.safargo_platform_fee,
      status: 'placed',
      created_at: nowIso,
    };

    setQuickDeliveryOrders((prev) => [newOrder, ...prev]);
    addAuditLog('create_delivery_order', 'quick_delivery_orders', newOrder.id, { code: newOrder.order_code });
    success('15-मिनट डिलीवरी ऑर्डर दर्ज हुआ! ⚡', `दूरी: ${orderData.distance_km} KM | डिलीवरी शुल्क: ₹${pricing.delivery_fee}। नजदीकी सफ़ारगो एजेंट 5 मिनट में पिकअप शुरू करेगा।`);
    return newOrder;
  };

  const agentAcceptDeliveryOrder = async (orderId: string): Promise<boolean> => {
    if (!currentUser) return false;
    const nowIso = new Date().toISOString();
    setQuickDeliveryOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'agent_assigned',
              agent_id: currentUser.id,
              agent_name: currentUser.full_name,
              agent_mobile: currentUser.mobile,
              agent_accepted_at: nowIso,
            }
          : o
      )
    );
    success('ऑर्डर स्वीकार किया! 🚴', 'अब 5 मिनट में नजदीकी दुकान पर पहुँचें और सामान व बिल की फोटो खींचकर अपलोड करें।');
    return true;
  };

  const agentUploadDeliveryPhotoAndPrice = async (orderId: string, photoUrl: string, actualItemPrice: number): Promise<boolean> => {
    const order = quickDeliveryOrders.find((o) => o.id === orderId);
    if (!order) return false;

    const totalAmt = actualItemPrice + order.delivery_fee;
    setQuickDeliveryOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              item_photo_url: photoUrl,
              actual_item_price: actualItemPrice,
              total_order_amount: totalAmt,
              status: 'photo_price_uploaded',
            }
          : o
      )
    );
    success('बिल व फोटो अपलोड हुई! 📸', `कुल राशि: ₹${actualItemPrice} (सामान) + ₹${order.delivery_fee} (डिलीवरी) = ₹${totalAmt}। ग्राहक की स्क्रीन पर पुष्टि हेतु भेजा गया।`);
    return true;
  };

  const customerConfirmDeliveryOrder = async (orderId: string): Promise<boolean> => {
    const now = new Date();
    const nowIso = now.toISOString();
    const deadline15m = new Date(now.getTime() + 15 * 60 * 1000).toISOString();

    setQuickDeliveryOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'out_for_delivery',
              customer_confirmed_at: nowIso,
              deadline_15m_at: deadline15m,
            }
          : o
      )
    );
    success('ग्राहक द्वारा बिल स्वीकृत! ⏳', '15 मिनट का डिलीवरी टाइमर शुरू हो गया है। एजेंट आपके घर की ओर निकल चुका है।');
    return true;
  };

  const completeDeliveryOrder = async (orderId: string): Promise<boolean> => {
    const order = quickDeliveryOrders.find((o) => o.id === orderId);
    if (!order) return false;

    const nowIso = new Date().toISOString();
    setQuickDeliveryOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'delivered',
              delivered_at: nowIso,
            }
          : o
      )
    );

    // Auto-credit agent payout to wallet
    if (order.agent_id) {
      const agentProfile = allProfiles.find((p) => p.id === order.agent_id);
      if (agentProfile) {
        const curBal = agentProfile.wallet_balance || 0;
        const newBal = curBal + order.agent_payout;
        if (currentUser?.id === order.agent_id) {
          await updateProfile({ wallet_balance: newBal });
        } else if (isSupabaseConfigured) {
          db.updateProfile(order.agent_id, { wallet_balance: newBal }).catch(console.error);
        }

        const payoutTx: WalletTransaction = {
          id: `wtx-${Date.now()}`,
          agent_id: order.agent_id,
          amount: order.agent_payout,
          type: 'adjustment',
          description: `15-Min Delivery Payout (${order.order_code} - ${order.distance_km} KM)`,
          balance_after: newBal,
          created_at: nowIso,
        };
        setWalletTransactions((prev) => [payoutTx, ...prev]);
      }
    }

    addAuditLog('complete_delivery_order', 'quick_delivery_orders', orderId, { payout: order.agent_payout });
    success('डिलीवरी सफलतापूर्वक संपन्न! 🏆', `एजेंट को ₹${order.agent_payout} की डिलीवरी कमाई सीधे वॉलेट में क्रेडिट कर दी गई।`);
    return true;
  };

  const cancelDeliveryOrder = async (orderId: string, reason?: string): Promise<boolean> => {
    setQuickDeliveryOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'cancelled',
            }
          : o
      )
    );
    warning('डिलीवरी ऑर्डर रद्द', reason || 'ऑर्डर रद्द कर दिया गया है।');
    return true;
  };

  // =====================================================================
  // PROMO CODES & SPECIAL OFFERS METHODS (ADMIN & AGENTS)
  // =====================================================================
  const createPromoCode = async (
    promoData: Omit<PromoCode, 'id' | 'used_count' | 'created_at'>
  ): Promise<PromoCode | null> => {
    if (!isAdmin) {
      error('अनधिकृत', 'केवल एडमिन ही प्रोमो कोड व ऑफर्स बना सकते हैं।');
      return null;
    }

    const cleanCode = promoData.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (!cleanCode) {
      error('गलत प्रोमो कोड', 'कृपया मान्य प्रोमो कोड दर्ज करें।');
      return null;
    }

    if (promoCodes.some((p) => p.code === cleanCode)) {
      error('कोड पहले से मौजूद है', `कोड "${cleanCode}" पहले से बना हुआ है। कृपया नया कोड चुनें।`);
      return null;
    }

    const nowIso = new Date().toISOString();
    const newPromo: PromoCode = {
      ...promoData,
      id: `promo-${Date.now()}`,
      code: cleanCode,
      used_count: 0,
      created_at: nowIso,
    };

    setPromoCodes((prev) => [newPromo, ...prev]);
    addAuditLog('create_promo_code', 'promo_codes', newPromo.id, {
      code: newPromo.code,
      discount: newPromo.discount_value,
      agentBonus: newPromo.agent_extra_incentive,
    });

    success(
      'प्रोमो कोड व ऑफर लाइव हुआ! 🎟️',
      `कोड: "${newPromo.code}" सफलतापूर्वक बनाया गया। ${
        newPromo.agent_extra_incentive > 0
          ? `एजेंट को +₹${newPromo.agent_extra_incentive} का अतिरिक्त बोनस मिलेगा!`
          : ''
      }`
    );
    return newPromo;
  };

  const togglePromoCodeStatus = async (id: string): Promise<boolean> => {
    setPromoCodes((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_active: !p.is_active } : p))
    );
    success('प्रोमो कोड स्टेटस बदला', 'ऑफर स्टेटस सफलतापूर्वक अपडेट हुआ।');
    return true;
  };

  const deletePromoCode = async (id: string): Promise<boolean> => {
    setPromoCodes((prev) => prev.filter((p) => p.id !== id));
    success('प्रोमो कोड हटाया गया', 'ऑफर को लिस्ट से हटा दिया गया है।');
    return true;
  };

  const applyPromoCode = (
    code: string,
    service: 'bus_booking' | 'quick_delivery',
    amount: number,
    agentId?: string
  ): {
    success: boolean;
    discountAmount: number;
    agentBonus: number;
    message: string;
    promo?: PromoCode;
  } => {
    const cleanCode = code.trim().toUpperCase();
    const promo = promoCodes.find((p) => p.code === cleanCode);

    if (!promo) {
      return { success: false, discountAmount: 0, agentBonus: 0, message: 'अमान्य प्रोमो कोड!' };
    }

    if (!promo.is_active) {
      return { success: false, discountAmount: 0, agentBonus: 0, message: 'यह प्रोमो कोड वर्तमान में निष्क्रिय (Inactive) है।' };
    }

    const now = new Date();
    if (promo.valid_until && new Date(promo.valid_until) < now) {
      return { success: false, discountAmount: 0, agentBonus: 0, message: 'यह प्रोमो कोड समाप्त (Expired) हो चुका है।' };
    }

    if (promo.usage_limit > 0 && promo.used_count >= promo.usage_limit) {
      return { success: false, discountAmount: 0, agentBonus: 0, message: 'इस प्रोमो कोड की अधिकतम उपयोग सीमा पूरी हो चुकी है।' };
    }

    if (amount < promo.min_order_amount) {
      return {
        success: false,
        discountAmount: 0,
        agentBonus: 0,
        message: `न्यूनतम ₹${promo.min_order_amount} के ऑर्डर पर ही यह कोड लागू होगा।`,
      };
    }

    if (promo.applicable_service !== 'all' && promo.applicable_service !== service) {
      return {
        success: false,
        discountAmount: 0,
        agentBonus: 0,
        message: `यह कोड केवल ${promo.applicable_service === 'bus_booking' ? 'बस बुकिंग' : '15-मिनट डिलीवरी'} के लिए मान्य है।`,
      };
    }

    if (promo.applicable_to === 'specific_agent' && promo.assigned_agent_id) {
      if (agentId && agentId !== promo.assigned_agent_id) {
        return {
          success: false,
          discountAmount: 0,
          agentBonus: 0,
          message: `यह कोड केवल अधिकृत एजेंट (${promo.assigned_agent_name || 'विशिष्ट एजेंट'}) के लिए मान्य है।`,
        };
      }
    }

    let discount = 0;
    if (promo.discount_type === 'flat') {
      discount = promo.discount_value;
    } else {
      discount = Math.round((amount * promo.discount_value) / 100);
      if (promo.max_discount_amount && discount > promo.max_discount_amount) {
        discount = promo.max_discount_amount;
      }
    }

    discount = Math.min(discount, amount);

    return {
      success: true,
      discountAmount: discount,
      agentBonus: promo.agent_extra_incentive || 0,
      message: `प्रोमो कोड "${promo.code}" लागू हुआ! ₹${discount} की छूट मिली।`,
      promo,
    };
  };

  return (
    <DataContext.Provider
      value={{
        bookings,
        agentBookings,
        createBooking,
        confirmBooking,
        rejectBooking,
        reopenBooking,
        requestCancellation,
        processCancellation,
        busTrips,
        addBusTrip,
        updateBusTrip,
        deleteBusTrip,
        commissions,
        agentCommissions,
        salaryRecords,
        agentSalaryRecord,
        approveSalary,
        markSalaryPaid,
        payoutRequests,
        agentPayoutRequests,
        requestPayout,
        approvePayout,
        rejectPayout,
        walletRecharges,
        agentWalletRecharges,
        walletTransactions,
        agentWalletTransactions,
        agentWalletBalance,
        requestWalletRecharge,
        approveWalletRecharge,
        rejectWalletRecharge,
        adjustAgentWallet,
        promotionClaims,
        agentPromotionClaims,
        submitPromotionClaim,
        approvePromotionClaim,
        rejectPromotionClaim,
        promoterApplications,
        submitPromoterApplication,
        schedulePromoterInterview,
        passPromoterInterview,
        onboardPromoterPartner,
        setPromoterCredentials,
        refundPromoterFee,
        partnerShops,
        addPartnerShop,
        updatePartnerShop,
        addPartnerShopItem,
        togglePartnerShopItemStock,
        agentCallLogs,
        logAgentCall,
        quickDeliveryOrders,
        agentQuickDeliveryOrders,
        createDeliveryOrder,
        agentAcceptDeliveryOrder,
        agentUploadDeliveryPhotoAndPrice,
        customerConfirmDeliveryOrder,
        completeDeliveryOrder,
        cancelDeliveryOrder,
        promoCodes,
        createPromoCode,
        togglePromoCodeStatus,
        deletePromoCode,
        applyPromoCode,
        settings,
        updateSettings,
        updateAnnouncement,
        addCustomFeature,
        updateCustomFeature,
        deleteCustomFeature,
        toggleCustomFeature,
        auditLogs,
        celebrationBooking,
        dismissCelebration,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
