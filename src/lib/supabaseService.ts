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
      const { data, error } = await supabase.from('profiles').insert(profile).select().single();
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
      const { error } = await supabase.from('profiles').update(updates).eq('id', id);
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
      const { data, error } = await supabase
        .from('bookings')
        .insert(booking)
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
      const { error } = await supabase.from('bookings').update(updates).eq('id', id);
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
      const { data, error } = await supabase.from('commission_ledger').insert(entry).select().single();
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
      const { data, error } = await supabase
        .from('wallet_recharge_requests')
        .insert(recharge)
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
      const { error } = await supabase
        .from('wallet_recharge_requests')
        .update(updates)
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
      const { error } = await supabase.from('wallet_transactions').insert(tx);
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

