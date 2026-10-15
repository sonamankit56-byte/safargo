import { supabase, isSupabaseConfigured } from './supabase';
import {
  Booking,
  BusTrip,
  CommissionEntry,
  SalaryRecord,
  AuditLog,
  Profile,
  PayoutRequest,
  WalletRechargeRequest,
  WalletTransaction,
  PromotionClaim
} from '../types';

// Whitelist allowed columns for Supabase tables to prevent PGRST204 errors
const VALID_PROFILE_COLS = new Set([
  'id', 'role', 'full_name', 'mobile', 'email', 'city', 'district', 'address',
  'shop_name', 'agent_status', 'approved_by', 'approved_at', 'referral_code',
  'referred_by_code', 'referred_by_id', 'password', 'created_at', 'updated_at',
  'wallet_balance'
]);

const VALID_BOOKING_COLS = new Set([
  'id', 'booking_code', 'agent_id', 'agent_name', 'agent_mobile', 'idempotency_key',
  'customer_name', 'customer_mobile', 'passenger_count', 'passenger_details',
  'from_city', 'to_city', 'journey_date', 'departure_time_pref', 'operator_preference',
  'seat_category', 'seat_count', 'boarding_point', 'drop_point', 'estimated_fare',
  'total_estimated_amount', 'agent_notes', 'created_at', 'deadline_at', 'status',
  'actual_fare', 'confirmed_seats', 'actual_operator', 'actual_boarding_point',
  'actual_drop_point', 'ticket_pnr', 'ticket_doc_url', 'admin_notes', 'rejection_reason',
  'cancellation_reason', 'refund_status', 'refund_amount', 'confirmed_by', 'confirmed_at',
  'updated_at', 'payment_mode', 'payment_status', 'payment_utr', 'payment_screenshot_url'
]);

const VALID_RECHARGE_COLS = new Set([
  'id', 'agent_id', 'agent_name', 'agent_mobile', 'amount', 'payment_method',
  'utr_number', 'screenshot_url', 'status', 'admin_notes', 'approved_by',
  'approved_at', 'created_at'
]);

const VALID_TX_COLS = new Set([
  'id', 'agent_id', 'amount', 'type', 'booking_id', 'booking_code', 'recharge_id',
  'description', 'balance_after', 'created_at'
]);

const VALID_COMMISSION_COLS = new Set([
  'id', 'booking_id', 'booking_code', 'agent_id', 'agent_name', 'amount',
  'status', 'reversal_ref_id', 'notes', 'entry_type', 'referred_agent_id',
  'referred_agent_name', 'created_at'
]);

function filterObjectKeys<T extends Record<string, any>>(obj: T, allowed: Set<string>): any {
  if (!obj || typeof obj !== 'object') return {};
  const result: any = {};
  for (const key of Object.keys(obj)) {
    if (allowed.has(key) && obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result;
}

// Ensure the agent profile exists in Supabase to satisfy foreign key constraints
export async function ensureAgentProfile(agentId: string, name?: string, mobile?: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase || !agentId) return;
  try {
    const { data } = await supabase.from('profiles').select('id').eq('id', agentId).maybeSingle();
    if (!data) {
      await supabase.from('profiles').upsert({
        id: agentId,
        role: 'agent',
        full_name: name || 'SafarGo Agent',
        mobile: mobile || '9876543210',
        city: 'Indore',
        district: 'Indore',
        agent_status: 'approved',
        wallet_balance: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('[Supabase] ensureAgentProfile notice:', err);
  }
}

export const db = {
  // Profiles
  async getProfiles(): Promise<Profile[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) {
        console.error('Supabase getProfiles error:', error);
        return null;
      }
      return data as Profile[];
    } catch (e) {
      console.error('Supabase getProfiles network error:', e);
      return null;
    }
  },

  async createProfile(profile: Profile): Promise<Profile | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const cleanData = filterObjectKeys(profile, VALID_PROFILE_COLS);
      const { data, error } = await supabase.from('profiles').upsert(cleanData).select().single();
      if (error) {
        console.error('Supabase createProfile error:', error);
        return null;
      }
      return data as Profile;
    } catch (e) {
      console.error('Supabase createProfile network error:', e);
      return null;
    }
  },

  async updateProfile(id: string, updates: Partial<Profile>): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const cleanUpdates = filterObjectKeys(updates, VALID_PROFILE_COLS);
      const { error } = await supabase.from('profiles').update(cleanUpdates).eq('id', id);
      if (error) {
        console.error('Supabase updateProfile error:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Supabase updateProfile network error:', e);
      return false;
    }
  },

  // Bookings
  async getBookings(): Promise<Booking[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Supabase getBookings error:', error);
        return null;
      }
      return data as Booking[];
    } catch (e) {
      console.error('Supabase getBookings network error:', e);
      return null;
    }
  },

  async createBooking(booking: Booking): Promise<Booking | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      await ensureAgentProfile(booking.agent_id, booking.agent_name, booking.agent_mobile);
      const cleanBooking = filterObjectKeys(booking, VALID_BOOKING_COLS);
      const { data, error } = await supabase
        .from('bookings')
        .insert(cleanBooking)
        .select()
        .single();
      if (error) {
        console.error('Supabase createBooking error:', error);
        return null;
      }
      return data as Booking;
    } catch (e) {
      console.error('Supabase createBooking network error:', e);
      return null;
    }
  },

  async updateBooking(id: string, updates: Partial<Booking>): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const cleanUpdates = filterObjectKeys(updates, VALID_BOOKING_COLS);
      const { error } = await supabase.from('bookings').update(cleanUpdates).eq('id', id);
      if (error) {
        console.error('Supabase updateBooking error:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Supabase updateBooking network error:', e);
      return false;
    }
  },

  // Bus Trips
  async getBusTrips(): Promise<BusTrip[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('bus_trips')
        .select('*')
        .order('departure_time', { ascending: true });
      if (error) {
        console.error('Supabase getBusTrips error:', error);
        return null;
      }
      return data as BusTrip[];
    } catch (e) {
      console.error('Supabase getBusTrips network error:', e);
      return null;
    }
  },

  async createBusTrip(trip: BusTrip): Promise<BusTrip | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase.from('bus_trips').insert(trip).select().single();
      if (error) {
        console.error('Supabase createBusTrip error:', error);
        return null;
      }
      return data as BusTrip;
    } catch (e) {
      console.error('Supabase createBusTrip network error:', e);
      return null;
    }
  },

  async updateBusTrip(id: string, updates: Partial<BusTrip>): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase.from('bus_trips').update(updates).eq('id', id);
      if (error) {
        console.error('Supabase updateBusTrip error:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Supabase updateBusTrip network error:', e);
      return false;
    }
  },

  async deleteBusTrip(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase.from('bus_trips').delete().eq('id', id);
      if (error) {
        console.error('Supabase deleteBusTrip error:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Supabase deleteBusTrip network error:', e);
      return false;
    }
  },

  // Commission Ledger
  async getCommissions(): Promise<CommissionEntry[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('commission_ledger')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Supabase getCommissions error:', error);
        return null;
      }
      return data as CommissionEntry[];
    } catch (e) {
      console.error('Supabase getCommissions network error:', e);
      return null;
    }
  },

  async createCommission(entry: CommissionEntry): Promise<CommissionEntry | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      await ensureAgentProfile(entry.agent_id, entry.agent_name);
      const cleanEntry = filterObjectKeys(entry, VALID_COMMISSION_COLS);
      const { data, error } = await supabase.from('commission_ledger').insert(cleanEntry).select().single();
      if (error) {
        console.error('Supabase createCommission error:', error);
        return null;
      }
      return data as CommissionEntry;
    } catch (e) {
      console.error('Supabase createCommission network error:', e);
      return null;
    }
  },

  // Salary Records
  async getSalaryRecords(): Promise<SalaryRecord[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('salary_records')
        .select('*')
        .order('month_year', { ascending: false });
      if (error) {
        console.error('Supabase getSalaryRecords error:', error);
        return null;
      }
      return data as SalaryRecord[];
    } catch (e) {
      console.error('Supabase getSalaryRecords network error:', e);
      return null;
    }
  },

  async createSalaryRecord(salary: SalaryRecord): Promise<SalaryRecord | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase.from('salary_records').insert(salary).select().single();
      if (error) {
        console.error('Supabase createSalaryRecord error:', error);
        return null;
      }
      return data as SalaryRecord;
    } catch (e) {
      console.error('Supabase createSalaryRecord network error:', e);
      return null;
    }
  },

  async updateSalaryRecord(id: string, updates: Partial<SalaryRecord>): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase.from('salary_records').update(updates).eq('id', id);
      if (error) {
        console.error('Supabase updateSalaryRecord error:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Supabase updateSalaryRecord network error:', e);
      return false;
    }
  },

  // Payout Requests
  async getPayoutRequests(): Promise<PayoutRequest[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('payout_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Supabase getPayoutRequests error:', error);
        return null;
      }
      return data as PayoutRequest[];
    } catch (e) {
      console.error('Supabase getPayoutRequests network error:', e);
      return null;
    }
  },

  async createPayoutRequest(payout: PayoutRequest): Promise<PayoutRequest | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase.from('payout_requests').insert(payout).select().single();
      if (error) {
        console.error('Supabase createPayoutRequest error:', error);
        return null;
      }
      return data as PayoutRequest;
    } catch (e) {
      console.error('Supabase createPayoutRequest network error:', e);
      return null;
    }
  },

  async updatePayoutRequest(id: string, updates: Partial<PayoutRequest>): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase.from('payout_requests').update(updates).eq('id', id);
      if (error) {
        console.error('Supabase updatePayoutRequest error:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Supabase updatePayoutRequest network error:', e);
      return false;
    }
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) {
        console.error('Supabase getAuditLogs error:', error);
        return null;
      }
      return data as AuditLog[];
    } catch (e) {
      console.error('Supabase getAuditLogs network error:', e);
      return null;
    }
  },

  async createAuditLog(log: AuditLog): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase.from('audit_logs').insert(log);
      if (error) {
        console.error('Supabase createAuditLog error:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Supabase createAuditLog network error:', e);
      return false;
    }
  },

  // Wallet Recharges
  async getWalletRecharges(): Promise<WalletRechargeRequest[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('wallet_recharge_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Supabase getWalletRecharges error:', error);
        return null;
      }
      return data as WalletRechargeRequest[];
    } catch (e) {
      console.error('Supabase getWalletRecharges network error:', e);
      return null;
    }
  },

  async createWalletRecharge(recharge: WalletRechargeRequest): Promise<WalletRechargeRequest | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      await ensureAgentProfile(recharge.agent_id, recharge.agent_name, recharge.agent_mobile);
      const cleanRecharge = filterObjectKeys(recharge, VALID_RECHARGE_COLS);
      const { data, error } = await supabase
        .from('wallet_recharge_requests')
        .insert(cleanRecharge)
        .select()
        .single();
      if (error) {
        console.error('Supabase createWalletRecharge error:', error);
        return null;
      }
      return data as WalletRechargeRequest;
    } catch (e) {
      console.error('Supabase createWalletRecharge network error:', e);
      return null;
    }
  },

  async updateWalletRecharge(id: string, updates: Partial<WalletRechargeRequest>): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const cleanUpdates = filterObjectKeys(updates, VALID_RECHARGE_COLS);
      const { error } = await supabase
        .from('wallet_recharge_requests')
        .update(cleanUpdates)
        .eq('id', id);
      if (error) {
        console.error('Supabase updateWalletRecharge error:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Supabase updateWalletRecharge network error:', e);
      return false;
    }
  },

  // Wallet Transactions
  async getWalletTransactions(): Promise<WalletTransaction[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Supabase getWalletTransactions error:', error);
        return null;
      }
      return data as WalletTransaction[];
    } catch (e) {
      console.error('Supabase getWalletTransactions network error:', e);
      return null;
    }
  },

  async createWalletTransaction(tx: WalletTransaction): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      await ensureAgentProfile(tx.agent_id);
      const cleanTx = filterObjectKeys(tx, VALID_TX_COLS);
      const { error } = await supabase.from('wallet_transactions').insert(cleanTx);
      if (error) {
        console.error('Supabase createWalletTransaction error:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Supabase createWalletTransaction network error:', e);
      return false;
    }
  },

  // Viral Promotion Claims
  async getPromotionClaims(): Promise<PromotionClaim[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('promotion_claims')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Supabase getPromotionClaims error:', error);
        return null;
      }
      return data as PromotionClaim[];
    } catch (e) {
      console.error('Supabase getPromotionClaims network error:', e);
      return null;
    }
  },

  async createPromotionClaim(claim: PromotionClaim): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase.from('promotion_claims').insert(claim);
      if (error) {
        console.error('Supabase createPromotionClaim error:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Supabase createPromotionClaim network error:', e);
      return false;
    }
  },

  async updatePromotionClaim(id: string, updates: Partial<PromotionClaim>): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase
        .from('promotion_claims')
        .update(updates)
        .eq('id', id);
      if (error) {
        console.error('Supabase updatePromotionClaim error:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Supabase updatePromotionClaim network error:', e);
      return false;
    }
  }
};

