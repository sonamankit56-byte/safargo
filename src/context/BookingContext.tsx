import React, { createContext, useContext, useState, useEffect } from 'react';
import { Bus, Seat, BoardingPoint, DroppingPoint, Booking, FilterState, Passenger, AgentProfile } from '../types';
import { MOCK_BUSES } from '../data/mockData';

interface BookingContextType {
  // Search
  fromCity: string;
  setFromCity: (city: string) => void;
  toCity: string;
  setToCity: (city: string) => void;
  journeyDate: string;
  setJourneyDate: (date: string) => void;
  swapCities: () => void;

  // Filters
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  matchedBuses: Bus[];

  // Seat Selection
  selectedBus: Bus | null;
  setSelectedBus: (bus: Bus | null) => void;
  selectedSeats: Seat[];
  toggleSeat: (seat: Seat) => void;
  clearSelectedSeats: () => void;
  selectedBoarding: BoardingPoint | null;
  setSelectedBoarding: (bp: BoardingPoint | null) => void;
  selectedDropping: DroppingPoint | null;
  setSelectedDropping: (dp: DroppingPoint | null) => void;

  // Checkout & Bookings
  passengers: Passenger[];
  setPassengers: React.Dispatch<React.SetStateAction<Passenger[]>>;
  contactPhone: string;
  setContactPhone: (phone: string) => void;
  contactEmail: string;
  setContactEmail: (email: string) => void;
  couponCode: string;
  setCouponCode: (coupon: string) => void;
  discountAmount: number;
  applyCoupon: (code: string) => boolean;
  confirmedBookings: Booking[];
  confirmCurrentBooking: () => Booking | null;
  cancelBooking: (pnr: string) => boolean;
  getBookingByPnr: (pnr: string) => Booking | undefined;

  // Auth
  user: { name: string; phone: string; email: string } | null;
  login: (phone: string, name?: string, email?: string) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // Agent Program
  agent: AgentProfile | null;
  isAgentLoggedIn: boolean;
  registerAgent: (data: { fullName: string; agencyName: string; phone: string; email: string; city: string; upiId: string }) => AgentProfile;
  loginAgent: (phone?: string) => AgentProfile;
  logoutAgent: () => void;

  // Navigation state
  currentView: 'home' | 'search' | 'checkout' | 'success' | 'my-bookings' | 'agent' | 'login';
  setCurrentView: (view: 'home' | 'search' | 'checkout' | 'success' | 'my-bookings' | 'agent' | 'login') => void;
  activePnr: string | null;
  setActivePnr: (pnr: string | null) => void;
}

const initialFilters: FilterState = {
  busTypes: { ac: false, nonAc: false, sleeper: false, seater: false },
  departureSlots: { earlyMorning: false, morning: false, afternoon: false, night: false },
  primoOnly: false,
  singleSeatsOnly: false,
  maxPrice: 2500,
  selectedOperators: [],
  sortBy: 'price_asc',
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get tomorrow's date as default
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [fromCity, setFromCity] = useState('Delhi');
  const [toCity, setToCity] = useState('Manali');
  const [journeyDate, setJourneyDate] = useState(defaultDateStr);

  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [selectedBoarding, setSelectedBoarding] = useState<BoardingPoint | null>(null);
  const [selectedDropping, setSelectedDropping] = useState<DroppingPoint | null>(null);

  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [contactPhone, setContactPhone] = useState('9876543210');
  const [contactEmail, setContactEmail] = useState('traveler@safargo.in');
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  const [currentView, setCurrentView] = useState<'home' | 'search' | 'checkout' | 'success' | 'my-bookings' | 'agent' | 'login'>('home');
  const [activePnr, setActivePnr] = useState<string | null>(null);

  // Auth state
  const [user, setUser] = useState<{ name: string; phone: string; email: string } | null>(() => {
    const saved = localStorage.getItem('safar_go_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Confirmed bookings from localStorage
  const [confirmedBookings, setConfirmedBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('safar_go_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('safar_go_bookings', JSON.stringify(confirmedBookings));
  }, [confirmedBookings]);

  // Agent Profile state from localStorage
  const [agent, setAgent] = useState<AgentProfile | null>(() => {
    const saved = localStorage.getItem('safar_go_agent');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAgentLoggedIn, setIsAgentLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('safar_go_agent_logged_in') === 'true';
  });

  useEffect(() => {
    if (agent) {
      localStorage.setItem('safar_go_agent', JSON.stringify(agent));
    } else {
      localStorage.removeItem('safar_go_agent');
    }
  }, [agent]);

  useEffect(() => {
    localStorage.setItem('safar_go_agent_logged_in', isAgentLoggedIn ? 'true' : 'false');
  }, [isAgentLoggedIn]);

  const registerAgent = (data: { fullName: string; agencyName: string; phone: string; email: string; city: string; upiId: string }): AgentProfile => {
    const d = new Date();
    const day = d.getDay();
    const daysUntilSunday = day === 0 ? 7 : (7 - day);
    d.setDate(d.getDate() + daysUntilSunday);
    const sundayStr = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

    const newAgent: AgentProfile = {
      agentId: 'SGA-' + Math.floor(10000 + Math.random() * 90000),
      fullName: data.fullName,
      agencyName: data.agencyName,
      phone: data.phone,
      email: data.email,
      city: data.city,
      upiId: data.upiId,
      totalBookingsCount: 0,
      commissionPerBooking: 19.34,
      totalEarnings: 0,
      unpaidEarnings: 0,
      nextPayoutDate: sundayStr,
      registeredAt: new Date().toISOString(),
    };

    setAgent(newAgent);
    // User requirement: Do NOT log in immediately upon registration.
    // Account activation notification (24-hr check) is shown and user must log in.
    setIsAgentLoggedIn(false);
    return newAgent;
  };

  const loginAgent = (phone?: string): AgentProfile => {
    let currentAgent = agent;
    if (!currentAgent) {
      const d = new Date();
      const day = d.getDay();
      const daysUntilSunday = day === 0 ? 7 : (7 - day);
      d.setDate(d.getDate() + daysUntilSunday);
      const sundayStr = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

      currentAgent = {
        agentId: 'SGA-' + Math.floor(10000 + Math.random() * 90000),
        fullName: 'Vikram Singh',
        agencyName: 'Shree Ganesh Tour & Travels',
        phone: phone || '9823019283',
        email: 'vikram.travels@gmail.com',
        city: 'Delhi NCR',
        upiId: 'vikram@okaxis',
        totalBookingsCount: 3,
        commissionPerBooking: 19.34,
        totalEarnings: 58.02,
        unpaidEarnings: 58.02,
        nextPayoutDate: sundayStr,
        registeredAt: new Date().toISOString(),
      };
      setAgent(currentAgent);
    }
    setIsAgentLoggedIn(true);
    return currentAgent;
  };

  const logoutAgent = () => {
    setIsAgentLoggedIn(false);
  };

  const swapCities = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  const resetFilters = () => setFilters(initialFilters);

  const toggleSeat = (seat: Seat) => {
    if (seat.status === 'booked') return;
    const exists = selectedSeats.find(s => s.id === seat.id);
    if (exists) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
      setPassengers(passengers.filter(p => p.seatNumber !== seat.number));
    } else {
      if (selectedSeats.length >= 6) {
        alert('You can select a maximum of 6 seats per booking.');
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
      setPassengers([...passengers, {
        name: '',
        age: 28,
        gender: 'male',
        seatNumber: seat.number,
      }]);
    }
  };

  const clearSelectedSeats = () => {
    setSelectedSeats([]);
    setPassengers([]);
    setSelectedBoarding(null);
    setSelectedDropping(null);
  };

  const applyCoupon = (code: string): boolean => {
    const cleaned = code.trim().toUpperCase();
    if (cleaned === 'SAFAR100') {
      setDiscountAmount(100);
      setCouponCode('SAFAR100');
      return true;
    } else if (cleaned === 'FIRST50') {
      setDiscountAmount(150);
      setCouponCode('FIRST50');
      return true;
    }
    return false;
  };

  // Filter and sort buses
  const matchedBuses = MOCK_BUSES.filter(bus => {
    // City match (case-insensitive substring)
    const matchesRoute =
      bus.fromCity.toLowerCase().includes(fromCity.toLowerCase()) &&
      bus.toCity.toLowerCase().includes(toCity.toLowerCase());

    if (!matchesRoute) return false;

    // Price
    if (bus.basePrice > filters.maxPrice) return false;

    // Primo
    if (filters.primoOnly && !bus.operator.isPrimo) return false;

    // Single Seats
    if (filters.singleSeatsOnly && bus.singleSeatsAvailable <= 0) return false;

    // Bus Types
    const bt = filters.busTypes;
    if (bt.ac && !bus.isAC) return false;
    if (bt.nonAc && bus.isAC) return false;
    if (bt.sleeper && !bus.isSleeper) return false;
    if (bt.seater && !bus.isSeater) return false;

    // Operators
    if (filters.selectedOperators.length > 0 && !filters.selectedOperators.includes(bus.operator.name)) {
      return false;
    }

    // Departure slots
    const ds = filters.departureSlots;
    const hour = parseInt(bus.departureTime.split(':')[0], 10);
    const hasSlotActive = ds.earlyMorning || ds.morning || ds.afternoon || ds.night;
    if (hasSlotActive) {
      const matchEarly = ds.earlyMorning && hour < 6;
      const matchMorning = ds.morning && hour >= 6 && hour < 12;
      const matchAfternoon = ds.afternoon && hour >= 12 && hour < 18;
      const matchNight = ds.night && hour >= 18;
      if (!matchEarly && !matchMorning && !matchAfternoon && !matchNight) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'price_asc') return a.basePrice - b.basePrice;
    if (filters.sortBy === 'price_desc') return b.basePrice - a.basePrice;
    if (filters.sortBy === 'rating_desc') return b.operator.rating - a.operator.rating;
    if (filters.sortBy === 'departure_asc') return a.departureTime.localeCompare(b.departureTime);
    return 0;
  });

  const confirmCurrentBooking = (): Booking | null => {
    if (!selectedBus || selectedSeats.length === 0 || !selectedBoarding || !selectedDropping) {
      return null;
    }

    const baseAmount = selectedSeats.reduce((sum, s) => sum + s.price, 0);
    const gstAmount = Math.round(baseAmount * 0.05); // 5% GST
    const totalAmount = Math.max(0, baseAmount + gstAmount - discountAmount);

    // Generate random 10-character PNR
    const pnr = 'SG' + Math.floor(10000000 + Math.random() * 90000000);

    const newBooking: Booking = {
      pnr,
      busId: selectedBus.id,
      bus: selectedBus,
      journeyDate,
      selectedSeats: [...selectedSeats],
      passengers: [...passengers],
      contactEmail,
      contactPhone,
      boardingPoint: selectedBoarding,
      droppingPoint: selectedDropping,
      baseAmount,
      gstAmount,
      discountAmount,
      totalAmount,
      couponCode: couponCode || undefined,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    setConfirmedBookings(prev => [newBooking, ...prev]);
    setActivePnr(pnr);

    // Credit agent commission if agent session is active (₹19.34 per booking)
    if (agent) {
      setAgent(prev => {
        if (!prev) return null;
        const updated = {
          ...prev,
          totalBookingsCount: prev.totalBookingsCount + 1,
          totalEarnings: +(prev.totalEarnings + 19.34).toFixed(2),
          unpaidEarnings: +(prev.unpaidEarnings + 19.34).toFixed(2),
        };
        localStorage.setItem('safar_go_agent', JSON.stringify(updated));
        return updated;
      });
    }

    clearSelectedSeats();
    return newBooking;
  };

  const cancelBooking = (pnr: string): boolean => {
    const booking = confirmedBookings.find(b => b.pnr === pnr);
    if (!booking || booking.status === 'cancelled') return false;

    setConfirmedBookings(prev =>
      prev.map(b => (b.pnr === pnr ? { ...b, status: 'cancelled' } : b))
    );
    return true;
  };

  const getBookingByPnr = (pnr: string) => {
    return confirmedBookings.find(b => b.pnr === pnr);
  };

  const login = (phone: string, name?: string, email?: string) => {
    setUser({
      phone,
      name: name || 'Safar Traveler',
      email: email || `${phone}@safargo.in`
    });
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <BookingContext.Provider
      value={{
        fromCity,
        setFromCity,
        toCity,
        setToCity,
        journeyDate,
        setJourneyDate,
        swapCities,
        filters,
        setFilters,
        resetFilters,
        matchedBuses,
        selectedBus,
        setSelectedBus,
        selectedSeats,
        toggleSeat,
        clearSelectedSeats,
        selectedBoarding,
        setSelectedBoarding,
        selectedDropping,
        setSelectedDropping,
        passengers,
        setPassengers,
        contactPhone,
        setContactPhone,
        contactEmail,
        setContactEmail,
        couponCode,
        setCouponCode,
        discountAmount,
        applyCoupon,
        confirmedBookings,
        confirmCurrentBooking,
        cancelBooking,
        getBookingByPnr,
        user,
        login,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        agent,
        isAgentLoggedIn,
        registerAgent,
        loginAgent,
        logoutAgent,
        currentView,
        setCurrentView,
        activePnr,
        setActivePnr,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
