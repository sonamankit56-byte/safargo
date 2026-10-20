import { createClient } from '@supabase/supabase-js';
import { 
  AgentUser, 
  TravelBooking, 
  BusItem, 
  WalletTopUpRequest, 
  SupportTicket, 
  AgentReferral,
  AdminQrConfig,
  PromoOffer 
} from '../types/travel';

export const SUPABASE_URL = ((import.meta as any).env?.VITE_SUPABASE_URL as string) || 'https://qkttyqjyfbifdatyaprv.supabase.co';
export const SUPABASE_ANON_KEY = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || 'sb_publishable_Wu_ywFMrhc91B5DncnRT7g_EOY_tyGQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// 1. AGENTS CRUD
// ==========================================
export const fetchAgentsFromDb = async (): Promise<AgentUser[]> => {
  try {
    const { data, error } = await supabase.from('safargo_agents').select('*');
    if (error || !data) return [];
    return data.map((a: any): AgentUser => ({
      id: a.id,
      fullName: a.full_name,
      mobile: a.mobile,
      email: a.email,
      shopName: a.shop_name,
      businessType: a.business_type,
      city: a.city,
      address: a.address,
      pincode: a.pincode,
      panNumber: a.pan_number,
      aadhaarNumber: a.aadhaar_number,
      gstin: a.gstin,
      accountHolder: a.account_holder,
      accountNumber: a.account_number,
      ifsc: a.ifsc,
      bankName: a.bank_name,
      settlementUpiId: a.settlement_upi_id,
      isApproved: a.is_approved,
      isSuspended: a.is_suspended,
      suspendReason: a.suspend_reason,
      appliedDate: a.applied_date,
      approvedDate: a.approved_date,
      role: a.role,
      profilePhoto: a.profile_photo,
      isPhotoLocked: a.is_photo_locked,
      password: a.password,
      approvalToken: a.approval_token
    }));
  } catch (err) {
    console.error('fetchAgentsFromDb error:', err);
    return [];
  }
};

export const saveAgentToDb = async (agent: AgentUser): Promise<boolean> => {
  try {
    const { error } = await supabase.from('safargo_agents').upsert({
      id: agent.id,
      full_name: agent.fullName,
      mobile: agent.mobile,
      email: agent.email,
      shop_name: agent.shopName,
      business_type: agent.businessType,
      city: agent.city,
      address: agent.address,
      pincode: agent.pincode,
      pan_number: agent.panNumber,
      aadhaar_number: agent.aadhaarNumber,
      gstin: agent.gstin,
      account_holder: agent.accountHolder,
      account_number: agent.accountNumber,
      ifsc: agent.ifsc,
      bank_name: agent.bankName,
      settlement_upi_id: agent.settlementUpiId,
      is_approved: agent.isApproved,
      is_suspended: agent.isSuspended || false,
      suspend_reason: agent.suspendReason,
      applied_date: agent.appliedDate,
      approved_date: agent.approvedDate,
      role: agent.role || 'agent',
      profile_photo: agent.profilePhoto,
      is_photo_locked: agent.isPhotoLocked || false,
      password: agent.password,
      approval_token: agent.approvalToken
    });
    return !error;
  } catch (err) {
    console.error('saveAgentToDb error:', err);
    return false;
  }
};

export const updateAgentInDb = async (agentId: string, patch: Partial<AgentUser>): Promise<boolean> => {
  try {
    const payload: any = {};
    if (patch.fullName !== undefined) payload.full_name = patch.fullName;
    if (patch.mobile !== undefined) payload.mobile = patch.mobile;
    if (patch.email !== undefined) payload.email = patch.email;
    if (patch.shopName !== undefined) payload.shop_name = patch.shopName;
    if (patch.isApproved !== undefined) payload.is_approved = patch.isApproved;
    if (patch.isSuspended !== undefined) payload.is_suspended = patch.isSuspended;
    if (patch.suspendReason !== undefined) payload.suspend_reason = patch.suspendReason;
    if (patch.approvedDate !== undefined) payload.approved_date = patch.approvedDate;
    if (patch.password !== undefined) payload.password = patch.password;
    if (patch.profilePhoto !== undefined) payload.profile_photo = patch.profilePhoto;
    if (patch.isPhotoLocked !== undefined) payload.is_photo_locked = patch.isPhotoLocked;

    const { error } = await supabase.from('safargo_agents').update(payload).eq('id', agentId);
    return !error;
  } catch (err) {
    console.error('updateAgentInDb error:', err);
    return false;
  }
};

export const deleteAgentFromDb = async (agentId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('safargo_agents').delete().eq('id', agentId);
    return !error;
  } catch (err) {
    console.error('deleteAgentFromDb error:', err);
    return false;
  }
};

// ==========================================
// 2. BOOKINGS CRUD
// ==========================================
export const fetchBookingsFromDb = async (): Promise<TravelBooking[]> => {
  try {
    const { data, error } = await supabase.from('safargo_bookings').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((b: any): TravelBooking => ({
      id: b.id,
      bookingType: b.booking_type || 'bus',
      pnr: b.pnr,
      bookingDate: b.booking_date,
      travelDate: b.travel_date,
      status: b.status,
      totalAmount: Number(b.total_amount),
      paymentMethod: b.payment_method,
      utr: b.utr,
      isAgentBooking: b.is_agent_booking,
      agentCommissionAmount: Number(b.agent_commission_amount || 0),
      agentId: b.agent_id,
      agentEmail: b.agent_email,
      verifiedByAdmin: b.verified_by_admin,
      verifiedAt: b.verified_at,
      rejectionReason: b.rejection_reason,
      passengerDetails: b.passenger_details,
      busDetails: b.bus_details
    }));
  } catch (err) {
    console.error('fetchBookingsFromDb error:', err);
    return [];
  }
};

export const saveBookingToDb = async (b: TravelBooking): Promise<boolean> => {
  try {
    const { error } = await supabase.from('safargo_bookings').upsert({
      id: b.id,
      booking_type: b.bookingType,
      pnr: b.pnr,
      booking_date: b.bookingDate,
      travel_date: b.travelDate,
      status: b.status,
      total_amount: b.totalAmount,
      payment_method: b.paymentMethod,
      utr: b.utr,
      is_agent_booking: b.isAgentBooking,
      agent_commission_amount: b.agentCommissionAmount,
      agent_id: b.agentId,
      agent_email: b.agentEmail,
      verified_by_admin: b.verifiedByAdmin || false,
      verified_at: b.verifiedAt,
      rejection_reason: b.rejectionReason,
      passenger_details: b.passengerDetails,
      bus_details: b.busDetails
    });
    return !error;
  } catch (err) {
    console.error('saveBookingToDb error:', err);
    return false;
  }
};

export const updateBookingInDb = async (bookingId: string, patch: Partial<TravelBooking>): Promise<boolean> => {
  try {
    const payload: any = {};
    if (patch.status !== undefined) payload.status = patch.status;
    if (patch.verifiedByAdmin !== undefined) payload.verified_by_admin = patch.verifiedByAdmin;
    if (patch.verifiedAt !== undefined) payload.verified_at = patch.verifiedAt;
    if (patch.rejectionReason !== undefined) payload.rejection_reason = patch.rejectionReason;

    const { error } = await supabase.from('safargo_bookings').update(payload).eq('id', bookingId);
    return !error;
  } catch (err) {
    console.error('updateBookingInDb error:', err);
    return false;
  }
};

// ==========================================
// 3. FLEET BUSES CRUD
// ==========================================
export const fetchFleetBusesFromDb = async (): Promise<BusItem[]> => {
  try {
    const { data, error } = await supabase.from('safargo_fleet_buses').select('*');
    if (error || !data) return [];
    return data.map((bus: any): BusItem => ({
      id: bus.id,
      operatorName: bus.operator_name,
      busType: bus.bus_type,
      sourceCity: bus.source_city,
      destinationCity: bus.destination_city,
      departureTime: bus.departure_time,
      arrivalTime: bus.arrival_time,
      duration: bus.duration,
      fare: Number(bus.fare),
      originalFare: Number(bus.original_fare || bus.fare * 1.3),
      discountPercent: bus.discount_percent || 20,
      rating: Number(bus.rating || 4.5),
      reviewCount: bus.review_count || 100,
      isPrimo: bus.is_primo || false,
      hasLiveTracking: bus.has_live_tracking || true,
      availableSeats: bus.available_seats || 36,
      amenities: bus.amenities || [],
      boardingPoints: bus.boarding_points || [],
      droppingPoints: bus.dropping_points || [],
      seats: bus.seats || []
    }));
  } catch (err) {
    console.error('fetchFleetBusesFromDb error:', err);
    return [];
  }
};

export const saveFleetBusToDb = async (bus: BusItem): Promise<boolean> => {
  try {
    const { error } = await supabase.from('safargo_fleet_buses').upsert({
      id: bus.id,
      operator_name: bus.operatorName,
      bus_type: bus.busType,
      source_city: bus.sourceCity,
      destination_city: bus.destinationCity,
      departure_time: bus.departureTime,
      arrival_time: bus.arrivalTime,
      duration: bus.duration,
      fare: bus.fare,
      original_fare: bus.originalFare,
      discount_percent: bus.discountPercent,
      rating: bus.rating,
      review_count: bus.reviewCount,
      is_primo: bus.isPrimo,
      has_live_tracking: bus.hasLiveTracking,
      available_seats: bus.availableSeats,
      amenities: bus.amenities,
      boarding_points: bus.boardingPoints,
      dropping_points: bus.droppingPoints,
      seats: bus.seats
    });
    return !error;
  } catch (err) {
    console.error('saveFleetBusToDb error:', err);
    return false;
  }
};

export const deleteFleetBusFromDb = async (busId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('safargo_fleet_buses').delete().eq('id', busId);
    return !error;
  } catch (err) {
    console.error('deleteFleetBusFromDb error:', err);
    return false;
  }
};

// ==========================================
// 4. WALLET TOP-UPS CRUD
// ==========================================
export const fetchWalletTopUpsFromDb = async (): Promise<WalletTopUpRequest[]> => {
  try {
    const { data, error } = await supabase.from('safargo_wallet_topups').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((t: any): WalletTopUpRequest => ({
      id: t.id,
      agentId: t.agent_id,
      agentName: t.agent_name,
      shopName: t.shop_name,
      mobile: t.mobile,
      amount: Number(t.amount),
      utr: t.utr,
      date: t.date,
      status: t.status,
      rejectionReason: t.rejection_reason,
      isFlaggedFake: t.is_flagged_fake
    }));
  } catch (err) {
    console.error('fetchWalletTopUpsFromDb error:', err);
    return [];
  }
};

export const saveWalletTopUpToDb = async (topup: WalletTopUpRequest): Promise<boolean> => {
  try {
    const { error } = await supabase.from('safargo_wallet_topups').upsert({
      id: topup.id,
      agent_id: topup.agentId,
      agent_name: topup.agentName,
      shop_name: topup.shopName,
      mobile: topup.mobile,
      amount: topup.amount,
      utr: topup.utr,
      date: topup.date,
      status: topup.status,
      rejection_reason: topup.rejectionReason,
      is_flagged_fake: topup.isFlaggedFake || false
    });
    return !error;
  } catch (err) {
    console.error('saveWalletTopUpToDb error:', err);
    return false;
  }
};

export const updateWalletTopUpInDb = async (id: string, patch: Partial<WalletTopUpRequest>): Promise<boolean> => {
  try {
    const payload: any = {};
    if (patch.status !== undefined) payload.status = patch.status;
    if (patch.rejectionReason !== undefined) payload.rejection_reason = patch.rejectionReason;
    if (patch.isFlaggedFake !== undefined) payload.is_flagged_fake = patch.isFlaggedFake;

    const { error } = await supabase.from('safargo_wallet_topups').update(payload).eq('id', id);
    return !error;
  } catch (err) {
    console.error('updateWalletTopUpInDb error:', err);
    return false;
  }
};

// ==========================================
// 5. SUPPORT TICKETS CRUD
// ==========================================
export const fetchSupportTicketsFromDb = async (): Promise<SupportTicket[]> => {
  try {
    const { data, error } = await supabase.from('safargo_support_tickets').select('*').order('submitted_at', { ascending: false });
    if (error || !data) return [];
    return data.map((t: any): SupportTicket => ({
      id: t.id,
      bookingPnr: t.booking_pnr,
      category: t.category,
      subject: t.subject,
      description: t.description,
      status: t.status,
      createdAt: t.created_at,
      lastUpdated: t.last_updated,
      resolutionNote: t.resolution_note,
      userMobile: t.user_mobile,
      userName: t.user_name
    }));
  } catch (err) {
    console.error('fetchSupportTicketsFromDb error:', err);
    return [];
  }
};

export const saveSupportTicketToDb = async (t: SupportTicket): Promise<boolean> => {
  try {
    const { error } = await supabase.from('safargo_support_tickets').upsert({
      id: t.id,
      booking_pnr: t.bookingPnr,
      category: t.category,
      subject: t.subject,
      description: t.description,
      status: t.status,
      created_at: t.createdAt,
      last_updated: t.lastUpdated,
      resolution_note: t.resolutionNote,
      user_mobile: t.userMobile,
      user_name: t.userName
    });
    return !error;
  } catch (err) {
    console.error('saveSupportTicketToDb error:', err);
    return false;
  }
};

export const updateSupportTicketInDb = async (id: string, patch: Partial<SupportTicket>): Promise<boolean> => {
  try {
    const payload: any = {};
    if (patch.status !== undefined) payload.status = patch.status;
    if (patch.resolutionNote !== undefined) payload.resolution_note = patch.resolutionNote;
    if (patch.lastUpdated !== undefined) payload.last_updated = patch.lastUpdated;

    const { error } = await supabase.from('safargo_support_tickets').update(payload).eq('id', id);
    return !error;
  } catch (err) {
    console.error('updateSupportTicketInDb error:', err);
    return false;
  }
};

// ==========================================
// 6. REFERRALS CRUD
// ==========================================
export const fetchReferralsFromDb = async (): Promise<AgentReferral[]> => {
  try {
    const { data, error } = await supabase.from('safargo_referrals').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((r: any): AgentReferral => ({
      id: r.id,
      referrerAgentId: r.referrer_agent_id,
      referredName: r.referred_name,
      referredShop: r.referred_shop,
      referredMobile: r.referred_mobile,
      date: r.date,
      isVerified: r.is_verified,
      verificationRewardPaid: r.verification_reward_paid,
      completedBookings: r.completed_bookings,
      completionRewardPaid: r.completion_reward_paid,
      totalEarned: Number(r.total_earned)
    }));
  } catch (err) {
    console.error('fetchReferralsFromDb error:', err);
    return [];
  }
};

export const saveReferralToDb = async (r: AgentReferral): Promise<boolean> => {
  try {
    const { error } = await supabase.from('safargo_referrals').upsert({
      id: r.id,
      referrer_agent_id: r.referrerAgentId,
      referred_name: r.referredName,
      referred_shop: r.referredShop,
      referred_mobile: r.referredMobile,
      date: r.date,
      is_verified: r.isVerified,
      verification_reward_paid: r.verificationRewardPaid,
      completed_bookings: r.completedBookings,
      completion_reward_paid: r.completionRewardPaid,
      total_earned: r.totalEarned
    });
    return !error;
  } catch (err) {
    console.error('saveReferralToDb error:', err);
    return false;
  }
};

// ==========================================
// 7. APP CONFIG CRUD (QR CODE)
// ==========================================
export const fetchAppConfigFromDb = async (key: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase.from('safargo_app_config').select('value').eq('key', key).maybeSingle();
    if (error || !data) return null;
    return data.value;
  } catch (err) {
    console.error('fetchAppConfigFromDb error:', err);
    return null;
  }
};

export const saveAppConfigToDb = async (key: string, value: any): Promise<boolean> => {
  try {
    const { error } = await supabase.from('safargo_app_config').upsert({ key, value });
    return !error;
  } catch (err) {
    console.error('saveAppConfigToDb error:', err);
    return false;
  }
};

// ==========================================
// 8. PROMO CODES & OFFERS CRUD
// ==========================================
export const fetchPromoCodesFromDb = async (): Promise<PromoOffer[]> => {
  try {
    const { data, error } = await supabase
      .from('safargo_promo_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((p: any): PromoOffer => ({
      id: p.id,
      code: p.code,
      title: p.title,
      description: p.description || '',
      discountType: p.discount_type || 'fixed',
      discountValue: Number(p.discount_value),
      minBookingAmount: Number(p.min_booking_amount || 0),
      serviceType: p.service_type || 'bus',
      validTill: p.valid_till,
      status: p.status || 'active',
      usageCount: p.usage_count || 0,
      createdAt: p.created_at
    }));
  } catch (err) {
    console.error('fetchPromoCodesFromDb error:', err);
    return [];
  }
};

export const savePromoCodeToDb = async (promo: PromoOffer): Promise<boolean> => {
  try {
    const { error } = await supabase.from('safargo_promo_codes').upsert({
      id: promo.id,
      code: promo.code.trim().toUpperCase(),
      title: promo.title,
      description: promo.description,
      discount_type: promo.discountType,
      discount_value: promo.discountValue,
      min_booking_amount: promo.minBookingAmount,
      service_type: promo.serviceType,
      valid_till: promo.validTill,
      status: promo.status,
      usage_count: promo.usageCount
    });
    return !error;
  } catch (err) {
    console.error('savePromoCodeToDb error:', err);
    return false;
  }
};

export const updatePromoCodeInDb = async (promoId: string, patch: Partial<PromoOffer>): Promise<boolean> => {
  try {
    const payload: any = {};
    if (patch.status !== undefined) payload.status = patch.status;
    if (patch.title !== undefined) payload.title = patch.title;
    if (patch.description !== undefined) payload.description = patch.description;
    if (patch.discountValue !== undefined) payload.discount_value = patch.discountValue;
    if (patch.validTill !== undefined) payload.valid_till = patch.validTill;
    if (patch.usageCount !== undefined) payload.usage_count = patch.usageCount;

    const { error } = await supabase.from('safargo_promo_codes').update(payload).eq('id', promoId);
    return !error;
  } catch (err) {
    console.error('updatePromoCodeInDb error:', err);
    return false;
  }
};

export const deletePromoCodeFromDb = async (promoId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('safargo_promo_codes').delete().eq('id', promoId);
    return !error;
  } catch (err) {
    console.error('deletePromoCodeFromDb error:', err);
    return false;
  }
};
