// ==============================================================================
// GO USER Bus Booking Platform - Clean Adapter Interface for Future Bus APIs
// Supports Manual Bookings, RedBus, AbhiBus, Mantis, and generic GDS providers.
// ==============================================================================

import { BusTrip, SeatCategory } from '../types';

export interface BusSearchQuery {
  source: string;
  destination: string;
  journeyDate: string; // YYYY-MM-DD
  busType?: 'all' | 'ac' | 'sleeper' | 'seater';
}

export interface BusSeatLayoutItem {
  seatId: string;
  seatNumber: string;
  category: SeatCategory;
  isAvailable: boolean;
  fare: number;
  row: number;
  column: number;
  tier: 'lower' | 'upper';
}

export interface BusTripDetails extends BusTrip {
  provider: 'manual' | 'redbus' | 'abhibus' | 'generic_gds';
  availableSeatsCount: number;
}

export interface BusBookingHoldRequest {
  tripId: string;
  seatNumbers: string[];
  customerName: string;
  customerMobile: string;
  agentId: string;
}

export interface BusBookingHoldResult {
  holdReference: string;
  expiresInSeconds: number;
  totalPayable: number;
  success: boolean;
  message?: string;
}

export interface BusApiBookingRequest {
  tripId: string;
  seatNumbers: string[];
  boardingPoint: string;
  dropPoint: string;
  customerName: string;
  customerMobile: string;
  customerAge?: number;
  customerGender?: 'male' | 'female' | 'other';
  agentId: string;
  agentName?: string;
  paymentMode: 'agent_wallet' | 'safargo_qr';
  paymentUtr?: string;
}

export interface BusApiBookingResult {
  success: boolean;
  bookingCode: string;
  ticketPnr?: string;
  confirmedSeats: string[];
  totalFare: number;
  commissionEarned: number; // Flat ₹20 per booking
  provider: string;
  status: 'confirmed' | 'pending_verification' | 'failed';
  message: string;
}

export interface BusApiCancelResult {
  success: boolean;
  pnr: string;
  refundAmount: number;
  commissionReversed: number;
  status: 'cancelled' | 'rejected';
  message: string;
}

/**
 * Standard Adapter Interface for any Bus API provider.
 * Clean abstraction allowing instant plug-and-play of future bus aggregators.
 */
export interface BusApiAdapter {
  readonly providerId: string;
  readonly providerName: string;
  readonly isLiveApi: boolean;

  searchTrips(query: BusSearchQuery): Promise<BusTripDetails[]>;
  getSeatLayout(tripId: string): Promise<BusSeatLayoutItem[]>;
  holdSeats?(request: BusBookingHoldRequest): Promise<BusBookingHoldResult>;
  bookTicket(request: BusApiBookingRequest): Promise<BusApiBookingResult>;
  cancelTicket(pnr: string, reason: string): Promise<BusApiCancelResult>;
}

/**
 * Manual Bus Booking Adapter:
 * Manages operator requests, local inventory, manual desk approvals,
 * and credits the flat ₹20 GO USER agent commission.
 */
export class ManualBusBookingAdapter implements BusApiAdapter {
  readonly providerId = 'manual';
  readonly providerName = 'GO USER Manual Bus Desk';
  readonly isLiveApi = false;

  private inventoryTrips: BusTrip[];

  constructor(initialTrips: BusTrip[] = []) {
    this.inventoryTrips = initialTrips;
  }

  setInventory(trips: BusTrip[]) {
    this.inventoryTrips = trips;
  }

  async searchTrips(query: BusSearchQuery): Promise<BusTripDetails[]> {
    const srcLower = query.source.toLowerCase().trim();
    const destLower = query.destination.toLowerCase().trim();

    const matched = this.inventoryTrips.filter((t) => {
      const matchSrc = !srcLower || t.source.toLowerCase().includes(srcLower);
      const matchDest = !destLower || t.destination.toLowerCase().includes(destLower);
      return matchSrc && matchDest && t.is_active;
    });

    return matched.map((t) => ({
      ...t,
      provider: 'manual',
      availableSeatsCount: (t.available_seater || 0) + (t.available_sleeper || 0),
    }));
  }

  async getSeatLayout(tripId: string): Promise<BusSeatLayoutItem[]> {
    const trip = this.inventoryTrips.find((t) => t.id === tripId);
    if (!trip) return [];

    const layout: BusSeatLayoutItem[] = [];
    // Lower Deck: 12 Seater + 6 Lower Sleeper
    for (let i = 1; i <= 12; i++) {
      layout.push({
        seatId: `L-S${i}`,
        seatNumber: `S${i}`,
        category: 'seater',
        isAvailable: i % 4 !== 0,
        fare: trip.seater_fare || 450,
        row: Math.ceil(i / 3),
        column: (i % 3) + 1,
        tier: 'lower',
      });
    }

    // Upper Deck: 8 Sleeper Berths
    for (let j = 1; j <= 8; j++) {
      layout.push({
        seatId: `U-SL${j}`,
        seatNumber: `U${j}`,
        category: 'sleeper',
        isAvailable: j % 3 !== 0,
        fare: trip.sleeper_fare || 750,
        row: Math.ceil(j / 2),
        column: (j % 2) + 1,
        tier: 'upper',
      });
    }

    return layout;
  }

  async bookTicket(request: BusApiBookingRequest): Promise<BusApiBookingResult> {
    const trip = this.inventoryTrips.find((t) => t.id === request.tripId);
    const seatFare = trip?.seater_fare || 450;
    const totalFare = seatFare * Math.max(1, request.seatNumbers.length);
    const bookingCode = `GO-${Date.now().toString().slice(-6)}`;

    return {
      success: true,
      bookingCode,
      ticketPnr: `PNR-MP-${Math.floor(100000 + Math.random() * 900000)}`,
      confirmedSeats: request.seatNumbers,
      totalFare,
      commissionEarned: 20, // Flat ₹20
      provider: this.providerName,
      status: request.paymentMode === 'agent_wallet' ? 'confirmed' : 'pending_verification',
      message: 'बुकिंग अनुरोध GO USER मैनुअल डेस्क पर सफलतापूर्वक दर्ज किया गया।',
    };
  }

  async cancelTicket(pnr: string, reason: string): Promise<BusApiCancelResult> {
    return {
      success: true,
      pnr,
      refundAmount: 0,
      commissionReversed: 20,
      status: 'cancelled',
      message: `टिकट ${pnr} रद्द किया गया। कारण: ${reason}`,
    };
  }
}

/**
 * Future Bus GDS / Live Aggregator Adapter Stub:
 * Pre-wired for future integration with RedBus, AbhiBus, etc.
 */
export class FutureGdsBusApiAdapter implements BusApiAdapter {
  readonly providerId = 'generic_gds';
  readonly providerName = 'GO USER Future Live Bus API (GDS Engine)';
  readonly isLiveApi = true;

  private apiKey?: string;
  private apiEndpoint?: string;

  constructor(apiKey?: string, apiEndpoint?: string) {
    this.apiKey = apiKey;
    this.apiEndpoint = apiEndpoint;
  }

  async searchTrips(query: BusSearchQuery): Promise<BusTripDetails[]> {
    // Adapter contract: when configured with LIVE credentials, calls aggregator endpoint
    return [];
  }

  async getSeatLayout(tripId: string): Promise<BusSeatLayoutItem[]> {
    return [];
  }

  async bookTicket(request: BusApiBookingRequest): Promise<BusApiBookingResult> {
    throw new Error('Live Bus API provider is in standby. Manual booking provider is active.');
  }

  async cancelTicket(pnr: string, reason: string): Promise<BusApiCancelResult> {
    throw new Error('Live Bus API cancellation in standby.');
  }
}

/**
 * Central Adapter Registry
 */
export class BusAdapterRegistry {
  private static instance: BusAdapterRegistry;
  private adapters: Map<string, BusApiAdapter> = new Map();
  private activeProviderId = 'manual';

  private constructor() {
    this.registerAdapter(new ManualBusBookingAdapter());
    this.registerAdapter(new FutureGdsBusApiAdapter());
  }

  static getInstance(): BusAdapterRegistry {
    if (!BusAdapterRegistry.instance) {
      BusAdapterRegistry.instance = new BusAdapterRegistry();
    }
    return BusAdapterRegistry.instance;
  }

  registerAdapter(adapter: BusApiAdapter) {
    this.adapters.set(adapter.providerId, adapter);
  }

  getAdapter(providerId?: string): BusApiAdapter {
    const id = providerId || this.activeProviderId;
    const adapter = this.adapters.get(id);
    if (!adapter) {
      return this.adapters.get('manual')!;
    }
    return adapter;
  }

  setActiveProvider(providerId: string) {
    if (this.adapters.has(providerId)) {
      this.activeProviderId = providerId;
    }
  }

  getActiveProviderId(): string {
    return this.activeProviderId;
  }
}
