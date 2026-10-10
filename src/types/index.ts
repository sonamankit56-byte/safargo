export type UserRole = 'admin' | 'agent' | 'customer';

export type AgentStatus = 'pending_approval' | 'approved' | 'rejected' | 'suspended';

export type BookingStatus =
  | 'booking_request'
  | 'awaiting_operator_confirmation'
  | 'confirmed'
  | 'rejected'
  | 'expired'
  | 'cancellation_requested'
  | 'cancelled';

export type SeatCategory =
  | 'seater'
  | 'sleeper'
  | 'semi_sleeper'
  | 'ac_seater'
  | 'non_ac_seater'
  | 'ac_sleeper'
  | 'non_ac_sleeper';

export type RefundStatus =
  | 'none'
  | 'requested'
  | 'under_review'
  | 'approved'
  | 'processing'
  | 'completed'
  | 'rejected';

export type SalaryStatus = 'unpaid' | 'approved' | 'paid';

export interface Passenger {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
}

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  mobile: string;
  email: string;
  city: string;
  district: string;
  address: string;
  shop_name?: string;
  wallet_balance?: number;
  agent_status: AgentStatus;
  approved_by?: string;
  approved_at?: string;
  referral_code: string;
  referred_by_code?: string;
  referred_by_id?: string;
  password?: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  booking_code: string;
  agent_id: string;
  agent_name?: string;
  agent_mobile?: string;
  idempotency_key?: string;
  customer_name: string;
  customer_mobile: string;
  passenger_count: number;
  passenger_details: Passenger[];
  from_city: string;
  to_city: string;
  journey_date: string;
  departure_time_pref: string;
  operator_preference: string;
  seat_category: SeatCategory;
  seat_count: number;
  boarding_point: string;
  drop_point: string;
  estimated_fare: number;
  total_estimated_amount: number;
  agent_notes?: string;
  created_at: string;
  deadline_at: string;
  status: BookingStatus;
  
  // Advance Payment Mode (SafarGo QR or Agent Prepaid Wallet)
  payment_mode?: 'safargo_qr' | 'agent_wallet';
  payment_status?: 'paid' | 'pending_verification';
  payment_utr?: string;
  payment_screenshot_url?: string;

  // Admin verification fields
  actual_fare?: number;
  confirmed_seats?: string;
  actual_operator?: string;
  actual_boarding_point?: string;
  actual_drop_point?: string;
  ticket_pnr?: string;
  ticket_doc_url?: string;
  admin_notes?: string;
  rejection_reason?: string;
  cancellation_reason?: string;
  refund_status?: RefundStatus;
  refund_amount?: number;
  confirmed_by?: string;
  confirmed_at?: string;
  updated_at: string;
}


export interface CommissionEntry {
  id: string;
  booking_id?: string;
  booking_code?: string;
  agent_id: string;
  agent_name?: string;
  amount: number;
  status: 'credited' | 'reversed' | 'paid';
  entry_type?: 'booking_commission' | 'referral_bonus' | 'reversal';
  referred_agent_id?: string;
  referred_agent_name?: string;
  reversal_ref_id?: string;
  notes?: string;
  created_at: string;
}

export interface SalaryRecord {
  id: string;
  agent_id: string;
  agent_name?: string;
  agent_mobile?: string;
  month_year: string; // e.g. "2026-10"
  target_bookings: number;
  confirmed_bookings: number;
  target_met: boolean;
  base_salary: number;
  payable_salary: number;
  status: SalaryStatus;
  approved_by?: string;
  approved_at?: string;
  paid_by?: string;
  paid_at?: string;
  payment_reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type PayoutStatus = 'pending' | 'approved' | 'rejected';

export interface PayoutRequest {
  id: string;
  agent_id: string;
  agent_name: string;
  agent_mobile: string;
  amount: number;
  payout_method: 'upi' | 'bank_transfer';
  upi_id?: string;
  account_number?: string;
  ifsc_code?: string;
  bank_name?: string;
  account_holder_name?: string;
  status: PayoutStatus;
  admin_reference?: string; // UTR or Bank Txn ID
  admin_notes?: string;
  created_at: string;
  processed_at?: string;
}

export interface BusTrip {
  id: string;
  operator_name: string;
  source: string;
  destination: string;
  journey_date: string;
  departure_time: string;
  arrival_time: string;
  bus_type: string;
  seater_fare: number;
  sleeper_fare: number;
  available_seater: number;
  available_sleeper: number;
  boarding_points: string[];
  drop_points: string[];
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type FeatureIconName =
  | 'Zap'
  | 'Package'
  | 'Train'
  | 'MapPin'
  | 'CreditCard'
  | 'Sparkles'
  | 'PhoneCall'
  | 'Shield'
  | 'HelpCircle'
  | 'Printer';

export interface CustomFeature {
  id: string;
  title: string;
  description: string;
  badge?: string;
  icon_name: FeatureIconName;
  action_type: 'whatsapp' | 'external_url' | 'notice_modal';
  action_value: string;
  is_active: boolean;
  created_at: string;
}

export interface AdminAnnouncement {
  is_active: boolean;
  title: string;
  message: string;
  type: 'info' | 'urgent' | 'warning' | 'success';
  target: 'all' | 'agents' | 'customers';
  updated_at: string;
}

export interface AdminSettings {
  commission_rate: number;
  monthly_target: number;
  monthly_salary: number;
  referral_bonus: number;
  referral_required_bookings: number;
  support_whatsapp: string;
  cancellation_reversal_policy: 'reverse_commission' | 'keep_commission';
  
  // Advance Payment & Wallet System Settings
  min_wallet_recharge: number; // default: 2000
  safargo_upi_id: string; // e.g. "safargo.booking@icici" or "919876543210@paytm"
  safargo_payee_name?: string; // e.g. "SafarGo Travels"
  safargo_phonepe_number?: string; // e.g. "9876543210@ybl" or mobile number
  safargo_gpay_number?: string; // e.g. "9876543210@okaxis" or mobile number
  safargo_paytm_number?: string; // e.g. "9876543210@paytm" or mobile number
  safargo_qr_image_url?: string; // Custom uploaded official QR image
  safargo_bank_account_no?: string; // Official Bank A/C No
  safargo_bank_ifsc?: string; // Official Bank IFSC
  safargo_bank_name?: string; // Official Bank Name
  safargo_bank_holder_name?: string; // Official Bank A/C Holder Name

  // Announcement broadcast
  announcement: AdminAnnouncement;

  // Built-in feature toggles
  feature_refer_earn: boolean;
  feature_tatkal_service: boolean;
  feature_parcel_service: boolean;
  feature_train_enquiry: boolean;
  feature_hotel_service: boolean;
  feature_print_service: boolean;

  // Dynamic custom features added by Admin
  custom_features: CustomFeature[];

  // Viral Creator & Social Media Promotion Settings
  promo_instagram_active?: boolean;
  promo_instagram_target_views?: number; // 1,000,000 views
  promo_instagram_reward?: number; // ₹500
  promo_youtube_active?: boolean;
  promo_youtube_target_views?: number; // 10,000 views
  promo_youtube_reward?: number; // ₹100
  promo_sla_hours?: number; // 24 hours
}

export type WalletRechargeStatus = 'pending' | 'approved' | 'rejected';

export interface WalletRechargeRequest {
  id: string;
  agent_id: string;
  agent_name: string;
  agent_mobile: string;
  amount: number; // Minimum ₹2,000
  payment_method: 'upi_qr' | 'bank_transfer';
  utr_number: string;
  screenshot_url?: string;
  status: WalletRechargeStatus;
  admin_notes?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
}

export interface WalletTransaction {
  id: string;
  agent_id: string;
  amount: number; // Positive for credit, negative for debit
  type: 'recharge' | 'ticket_booking' | 'refund' | 'adjustment';
  booking_id?: string;
  booking_code?: string;
  recharge_id?: string;
  description: string;
  balance_after: number;
  created_at: string;
}


export interface AuditLog {
  id: string;
  actor_id?: string;
  actor_email?: string;
  actor_role?: string;
  action: string;
  record_type: string;
  record_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export type PromotionPlatform = 'instagram' | 'youtube';
export type PromotionContentType = 'reel' | 'video' | 'short';
export type PromotionClaimStatus = 'pending' | 'approved' | 'rejected' | 'paid';

export interface PromotionClaim {
  id: string;
  claim_code: string; // e.g. "PRM-20261010-001"
  user_id: string;
  user_name: string;
  user_mobile: string;
  user_role: 'admin' | 'agent' | 'customer' | 'creator';
  platform: PromotionPlatform;
  content_type: PromotionContentType;
  post_url: string;
  channel_or_handle: string; // e.g. "@creator_rahul" or "UP Bus Diaries"
  views_count: number;
  reward_amount: number; // ₹500 for Instagram 1M, ₹100 for YouTube 10k
  screenshot_url?: string;
  payout_method: 'wallet' | 'upi' | 'bank';
  upi_id?: string;
  bank_details?: string;
  status: PromotionClaimStatus;
  admin_notes?: string;
  rejection_reason?: string;
  payment_reference?: string;
  created_at: string;
  deadline_at: string; // created_at + 24 Hours SLA
  reviewed_at?: string;
  reviewed_by?: string;
}
