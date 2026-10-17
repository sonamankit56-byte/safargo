import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { BusSearchWidget } from '../../components/bus/BusSearchWidget';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AssistanceTimer } from '../../components/common/AssistanceTimer';
import { 
  Bus, 
  Clock, 
  MapPin, 
  Users, 
  Tag, 
  Check, 
  AlertCircle, 
  Search, 
  ArrowRight, 
  FileText, 
  Printer, 
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Info
} from 'lucide-react';
import { BusService, Booking, Passenger } from '../../lib/types';

export const BookPortal: React.FC = () => {
  const { state, store } = useStore();
  const { currentUser } = useAuth();

  // Navigation tabs within book portal
  const [activeTab, setActiveTab] = useState<'search' | 'my_bookings' | 'lookup' | 'cancellation'>('search');

  // Search state
  const [searchCriteria, setSearchCriteria] = useState<{
    origin: string;
    destination: string;
    date: string;
    passengers: number;
  }>({
    origin: 'Delhi',
    destination: 'Jaipur',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    passengers: 1,
  });

  // Filter & sort state
  const [selectedBusType, setSelectedBusType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'fare' | 'departure'>('fare');

  // Selected service for booking flow
  const [selectedService, setSelectedService] = useState<BusService | null>(null);
  const [selectedBoarding, setSelectedBoarding] = useState<string>('');
  const [selectedDropping, setSelectedDropping] = useState<string>('');
  const [seatPreference, setSeatPreference] = useState<string>('Lower Berth Window');

  // Passenger details
  const [passengersList, setPassengersList] = useState<Passenger[]>([
    { fullName: currentUser.fullName || '', age: 28, gender: 'male', seatPreference: 'Lower Berth Window' },
  ]);
  const [contactPhone, setContactPhone] = useState<string>(currentUser.phone || '+91-9856789012');
  const [contactEmail, setContactEmail] = useState<string>(currentUser.email || '');
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponApplied, setCouponApplied] = useState<boolean>(false);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Active / Submitted booking for live tracking view
  const [submittedBooking, setSubmittedBooking] = useState<Booking | null>(null);

  // Lookup state
  const [lookupRef, setLookupRef] = useState<string>('');
  const [lookupPhone, setLookupPhone] = useState<string>('');
  const [lookupResult, setLookupResult] = useState<Booking | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Cancellation state
  const [cancelRef, setCancelRef] = useState<string>('');
  const [cancelReason, setCancelReason] = useState<string>('Personal emergency - change of plan');
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState<string | null>(null);
  const [cancelErrorMsg, setCancelErrorMsg] = useState<string | null>(null);

  // Find route matching search
  const currentRoute = state.routes.find(
    (r) =>
      r.originCity.toLowerCase() === searchCriteria.origin.toLowerCase() &&
      r.destinationCity.toLowerCase() === searchCriteria.destination.toLowerCase() &&
      r.isActive
  );

  // Filter services
  let availableServices = state.services.filter(
    (s) => s.isActive && currentRoute && s.routeId === currentRoute.id
  );

  if (selectedBusType !== 'all') {
    availableServices = availableServices.filter((s) => s.busType.toLowerCase().includes(selectedBusType.toLowerCase()));
  }

  // Sort services
  availableServices.sort((a, b) => {
    if (sortBy === 'fare') return a.baseFare - b.baseFare;
    return a.departureTime.localeCompare(b.departureTime);
  });

  const handleStartBooking = (service: BusService) => {
    setSelectedService(service);
    setSelectedBoarding(service.boardingPoints[0]?.name ? `${service.boardingPoints[0].name} (${service.boardingPoints[0].time})` : '');
    setSelectedDropping(service.droppingPoints[0]?.name ? `${service.droppingPoints[0].name} (${service.droppingPoints[0].time})` : '');
  };

  const handleApplyCoupon = () => {
    setCouponError(null);
    if (!couponCode.trim()) return;

    const offer = state.offers.find(
      (o) => o.code.toUpperCase() === couponCode.trim().toUpperCase() && o.isActive
    );

    if (!offer) {
      setCouponError('Invalid or expired coupon code.');
      setCouponApplied(false);
      setCouponDiscount(0);
      return;
    }

    if (!selectedService) return;
    const baseTotal = selectedService.baseFare * passengersList.length;

    if (baseTotal < offer.minBookingAmount) {
      setCouponError(`Minimum booking amount of ₹${offer.minBookingAmount} required for this coupon.`);
      setCouponApplied(false);
      setCouponDiscount(0);
      return;
    }

    let discount = 0;
    if (offer.discountType === 'percentage') {
      discount = Math.min((baseTotal * offer.discountValue) / 100, offer.maxDiscount);
    } else {
      discount = Math.min(offer.discountValue, offer.maxDiscount);
    }

    setCouponDiscount(discount);
    setCouponApplied(true);
  };

  const handleAddPassenger = () => {
    if (passengersList.length >= 6) return;
    setPassengersList([
      ...passengersList,
      { fullName: '', age: 25, gender: 'male', seatPreference },
    ]);
  };

  const handleRemovePassenger = (index: number) => {
    if (passengersList.length <= 1) return;
    setPassengersList(passengersList.filter((_, i) => i !== index));
  };

  const handlePassengerChange = (index: number, field: keyof Passenger, value: any) => {
    const updated = [...passengersList];
    updated[index] = { ...updated[index], [field]: value };
    setPassengersList(updated);
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedService) return;

    for (const p of passengersList) {
      if (!p.fullName.trim()) {
        alert('Please enter complete name for all passengers.');
        return;
      }
    }

    if (!contactPhone.trim()) {
      alert('Please enter valid contact phone number.');
      return;
    }

    const res = store.createBooking({
      bookingChannel: 'customer_self',
      customerName: passengersList[0].fullName,
      customerPhone: contactPhone,
      customerEmail: contactEmail,
      serviceId: selectedService.id,
      boardingPoint: selectedBoarding,
      droppingPoint: selectedDropping,
      journeyDate: searchCriteria.date,
      passengers: passengersList,
      couponCode: couponApplied ? couponCode.toUpperCase() : undefined,
    });

    if (res.success && res.booking) {
      setSubmittedBooking(res.booking);
      setSelectedService(null);
    } else {
      alert(res.error || 'Failed to submit booking request.');
    }
  };

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    setLookupResult(null);

    const found = state.bookings.find(
      (b) =>
        b.bookingRef.toUpperCase() === lookupRef.trim().toUpperCase() &&
        b.customerPhone.replace(/[^0-9]/g, '').endsWith(lookupPhone.replace(/[^0-9]/g, ''))
    );

    if (found) {
      setLookupResult(found);
    } else {
      setLookupError('No booking found matching the provided Reference and Contact Number.');
    }
  };

  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCancelErrorMsg(null);
    setCancelSuccessMsg(null);

    const found = state.bookings.find((b) => b.bookingRef.toUpperCase() === cancelRef.trim().toUpperCase());
    if (!found) {
      setCancelErrorMsg('Invalid Booking Reference.');
      return;
    }

    const res = store.requestCancellation({
      bookingId: found.id,
      reason: cancelReason,
      requestedBy: currentUser.fullName || 'Customer Self',
    });

    if (res.success) {
      setCancelSuccessMsg(`Cancellation request submitted for ${found.bookingRef}. Operations will review in accordance with operator cancellation policies.`);
      setCancelRef('');
    } else {
      setCancelErrorMsg(res.error || 'Could not submit cancellation.');
    }
  };

  // Find user's own bookings
  const userBookings = state.bookings.filter(
    (b) => b.userId === currentUser.id || b.customerPhone === currentUser.phone
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Sub-portal Header Navigation */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>book.safargo.in</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 font-semibold">
              Customer Booking Portal
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search verified bus schedules, manage bookings, and track manual operator confirmations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setActiveTab('search'); setSelectedService(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'search' ? 'bg-safargo-navy text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Search Buses
          </button>
          <button
            onClick={() => setActiveTab('my_bookings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'my_bookings' ? 'bg-safargo-navy text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            My Bookings ({userBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('lookup')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'lookup' ? 'bg-safargo-navy text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Check Status by Ref
          </button>
          <button
            onClick={() => setActiveTab('cancellation')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'cancellation' ? 'bg-safargo-navy text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Cancel Booking
          </button>
        </div>
      </div>

      {/* TAB 1: SEARCH & BOOKING FLOW */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          
          {/* Search bar */}
          <BusSearchWidget
            compact
            onSearch={(criteria) => {
              setSearchCriteria(criteria);
              setSelectedService(null);
            }}
          />

          {/* ACTIVE ASSISTED BOOKING STATUS BANNER IF USER JUST SUBMITTED */}
          {submittedBooking && (
            <div className="p-6 rounded-2xl bg-white border-2 border-orange-400 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Booking Request Submitted Successfully!
                    </h3>
                    <div className="text-xs text-slate-500">
                      Internal Booking Reference: <strong className="font-mono text-safargo-navy">{submittedBooking.bookingRef}</strong>
                    </div>
                  </div>
                </div>
                <StatusBadge status={submittedBooking.status} size="lg" />
              </div>

              {/* 15-Minute Assistance Timer */}
              <AssistanceTimer
                startedAt={submittedBooking.assistanceStartedAt}
                status={submittedBooking.status}
                bookingRef={submittedBooking.bookingRef}
              />

              <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Route & Bus</span>
                  <strong>{submittedBooking.originCity} → {submittedBooking.destinationCity}</strong>
                  <div className="text-slate-500">{submittedBooking.operatorName} • {submittedBooking.busType}</div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Boarding & Journey</span>
                  <strong>{submittedBooking.journeyDate} at {submittedBooking.departureTime}</strong>
                  <div className="text-slate-500 truncate">{submittedBooking.boardingPoint}</div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Fare & Passengers</span>
                  <strong>₹{submittedBooking.finalAmount} ({submittedBooking.passengersCount} Passenger)</strong>
                  <div className="text-slate-500">{submittedBooking.passengers[0]?.fullName}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setSubmittedBooking(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  Dismiss Banner
                </button>
                <button
                  onClick={() => {
                    setLookupResult(submittedBooking);
                    setActiveTab('lookup');
                  }}
                  className="px-4 py-2 bg-safargo-navy text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                >
                  View Full Receipt & Details →
                </button>
              </div>
            </div>
          )}

          {/* BOOKING MODAL / FORM IF A SERVICE IS CLICKED */}
          {selectedService && (
            <div className="p-6 rounded-2xl bg-white border border-slate-300 shadow-xl space-y-6">
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div>
                  <span className="text-xs font-semibold text-safargo-orange uppercase">Booking Request Form</span>
                  <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                    {selectedService.operatorName} ({selectedService.busType})
                  </h3>
                  <div className="text-xs text-slate-500">
                    {searchCriteria.origin} → {searchCriteria.destination} • Journey Date: {searchCriteria.date}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedService(null)}
                  className="text-slate-400 hover:text-slate-700 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Operational Notice: No fake live seats */}
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-start space-x-3 text-xs text-blue-900">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Manual Booking Assistance Model:</strong> SafarGo does not pretend live inventory connections exist. Your seating preference will be recorded and manually verified with <strong>{selectedService.operatorName}</strong>. Official confirmation and genuine operator PNR are provided upon operator acceptance.
                </div>
              </div>

              <form onSubmit={handleSubmitBooking} className="space-y-6">
                
                {/* Boarding and Dropping Points */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Select Boarding Point ({selectedService.boardingPoints.length} available)
                    </label>
                    <select
                      value={selectedBoarding}
                      onChange={(e) => setSelectedBoarding(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-slate-50"
                      required
                    >
                      {selectedService.boardingPoints.map((bp) => (
                        <option key={bp.id} value={`${bp.name} (${bp.time})`}>
                          {bp.time} - {bp.name} {bp.landmark ? `(Near ${bp.landmark})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Select Dropping Point ({selectedService.droppingPoints.length} available)
                    </label>
                    <select
                      value={selectedDropping}
                      onChange={(e) => setSelectedDropping(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-slate-50"
                      required
                    >
                      {selectedService.droppingPoints.map((dp) => (
                        <option key={dp.id} value={`${dp.name} (${dp.time})`}>
                          {dp.time} - {dp.name} {dp.landmark ? `(Near ${dp.landmark})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Seating Preference */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    Preferred Seating Option (Subject to Operator Verification)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Lower Berth Window', 'Upper Berth Single', 'Aisle Seat Front', 'Back Row Seater'].map((pref) => (
                      <button
                        key={pref}
                        type="button"
                        onClick={() => setSeatPreference(pref)}
                        className={`p-2 rounded-lg text-xs font-medium border text-center transition-all ${
                          seatPreference === pref
                            ? 'bg-safargo-orange text-white border-safargo-orange shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {pref}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Passengers List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-700">Passenger Information</span>
                    <button
                      type="button"
                      onClick={handleAddPassenger}
                      className="text-xs text-safargo-orange font-semibold hover:underline"
                    >
                      + Add Another Passenger (Max 6)
                    </button>
                  </div>

                  {passengersList.map((passenger, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-5">
                        <label className="block text-[10px] text-slate-500 font-semibold mb-1">
                          Passenger {index + 1} Full Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramesh Patel"
                          value={passenger.fullName}
                          onChange={(e) => handlePassengerChange(index, 'fullName', e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-slate-500 font-semibold mb-1">Age</label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          required
                          value={passenger.age}
                          onChange={(e) => handlePassengerChange(index, 'age', parseInt(e.target.value) || 20)}
                          className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] text-slate-500 font-semibold mb-1">Gender</label>
                        <select
                          value={passenger.gender}
                          onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2 flex justify-end">
                        {passengersList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePassenger(index)}
                            className="text-xs text-rose-600 hover:text-rose-800 font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Contact Mobile Number (For Operator Verification & SMS)
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address (Optional, for Receipt)
                    </label>
                    <input
                      type="email"
                      placeholder="customer@example.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white"
                    />
                  </div>
                </div>

                {/* Coupon Code Section */}
                <div className="p-3.5 bg-orange-50/50 rounded-xl border border-orange-200">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Enter Coupon Code (e.g. SAFARPEHLA)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 p-2 border border-slate-300 rounded-lg text-xs uppercase font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-safargo-orange text-white font-bold text-xs rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {couponApplied && (
                    <div className="text-xs text-emerald-700 font-semibold mt-1.5 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Coupon applied! You saved ₹{couponDiscount}.</span>
                    </div>
                  )}
                  {couponError && (
                    <div className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{couponError}</span>
                    </div>
                  )}
                </div>

                {/* Price Breakdown & Submit */}
                <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-600 space-y-0.5">
                    <div>Base Fare: ₹{selectedService.baseFare} × {passengersList.length} = ₹{selectedService.baseFare * passengersList.length}</div>
                    {couponDiscount > 0 && <div className="text-emerald-600">Discount: -₹{couponDiscount}</div>}
                    <div className="text-base font-bold text-slate-900">
                      Total Payable: ₹{Math.max(0, selectedService.baseFare * passengersList.length - couponDiscount)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedService(null)}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-safargo-orange hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 flex items-center gap-2"
                    >
                      <span>Submit 15-Min Booking Request</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* RESULTS LISTING */}
          {!selectedService && (
            <div className="space-y-4">
              
              {/* Filter and sorting controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500 font-medium">Filter Bus Type:</span>
                  <select
                    value={selectedBusType}
                    onChange={(e) => setSelectedBusType(e.target.value)}
                    className="p-1.5 border border-slate-300 rounded-lg bg-slate-50"
                  >
                    <option value="all">All Types</option>
                    <option value="sleeper">Sleeper Only</option>
                    <option value="seater">Seater Only</option>
                    <option value="ac">AC Buses</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-slate-500 font-medium">Sort By:</span>
                  <button
                    onClick={() => setSortBy('fare')}
                    className={`px-2.5 py-1 rounded-lg ${
                      sortBy === 'fare' ? 'bg-safargo-navy text-white font-bold' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Lowest Fare
                  </button>
                  <button
                    onClick={() => setSortBy('departure')}
                    className={`px-2.5 py-1 rounded-lg ${
                      sortBy === 'departure' ? 'bg-safargo-navy text-white font-bold' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Earliest Departure
                  </button>
                </div>
              </div>

              {/* Service cards */}
              {availableServices.length > 0 ? (
                <div className="space-y-3">
                  {availableServices.map((service) => (
                    <div
                      key={service.id}
                      className="bg-white rounded-2xl border border-slate-200 hover:border-safargo-orange p-5 shadow-sm hover:shadow-md transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-base font-bold text-slate-900">{service.operatorName}</h3>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 font-medium text-slate-600 border border-slate-200">
                              {service.busType}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Last verified by Ops: {service.lastVerifiedTime}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xl font-black text-safargo-navy">₹{service.baseFare}</div>
                          <div className="text-[11px] text-slate-400">per passenger</div>
                        </div>
                      </div>

                      {/* Journey times */}
                      <div className="grid grid-cols-3 items-center py-2 px-3 bg-slate-50 rounded-xl text-center">
                        <div>
                          <div className="text-base font-bold text-slate-900">{service.departureTime}</div>
                          <div className="text-[11px] text-slate-500 font-medium">{searchCriteria.origin}</div>
                        </div>
                        <div className="text-xs text-slate-400 font-medium flex flex-col items-center">
                          <span>{service.durationText}</span>
                          <div className="w-16 h-0.5 bg-slate-300 my-1 relative">
                            <div className="w-1.5 h-1.5 rounded-full bg-safargo-orange absolute -top-0.5 right-0" />
                          </div>
                          <span>Assisted Route</span>
                        </div>
                        <div>
                          <div className="text-base font-bold text-slate-900">{service.arrivalTime}</div>
                          <div className="text-[11px] text-slate-500 font-medium">{searchCriteria.destination}</div>
                        </div>
                      </div>

                      {/* Amenities and Cancellation */}
                      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2 pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-700">Amenities:</span>
                          <span>{service.amenities.slice(0, 3).join(' • ')}</span>
                        </div>
                        <button
                          onClick={() => handleStartBooking(service)}
                          className="px-5 py-2 bg-safargo-orange hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
                        >
                          <span>Select & Request Booking</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                  <Bus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-800">No Configured Services Found</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    We only display routes and services that have been genuinely configured and verified by our operations team.
                  </p>
                  <button
                    onClick={() => {
                      setSearchCriteria({
                        origin: 'Delhi',
                        destination: 'Jaipur',
                        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                        passengers: 1,
                      });
                    }}
                    className="mt-4 px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700"
                  >
                    View Delhi → Jaipur (Configured Sample)
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: MY BOOKINGS LIST */}
      {activeTab === 'my_bookings' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">My SafarGo Booking Requests</h2>
          {userBookings.length > 0 ? (
            <div className="space-y-4">
              {userBookings.map((b) => (
                <div key={b.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-safargo-orange bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                        {b.bookingRef}
                      </span>
                      <span className="text-xs text-slate-500 ml-2">Booked on {new Date(b.createdAt).toLocaleDateString()}</span>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>

                  {/* Assistance timer if in pending state */}
                  {b.status === 'pending' && (
                    <AssistanceTimer
                      startedAt={b.assistanceStartedAt}
                      status={b.status}
                      bookingRef={b.bookingRef}
                    />
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Route</span>
                      <strong>{b.originCity} → {b.destinationCity}</strong>
                      <div className="text-slate-500">{b.operatorName} • {b.busType}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Departure</span>
                      <strong>{b.journeyDate} at {b.departureTime}</strong>
                      <div className="text-slate-500 truncate">{b.boardingPoint}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Operator PNR</span>
                      {b.operatorPnr ? (
                        <strong className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {b.operatorPnr}
                        </strong>
                      ) : (
                        <span className="text-slate-400 italic">Pending Operator Confirmation</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-900">Total: ₹{b.finalAmount}</span>
                    <button
                      onClick={() => {
                        setLookupResult(b);
                        setActiveTab('lookup');
                      }}
                      className="text-xs text-safargo-navy hover:text-safargo-orange font-semibold"
                    >
                      View Receipt / Ticket →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
              No bookings found for current profile. Use the search tab to place a verified booking request.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STATUS LOOKUP BY REFERENCE */}
      {activeTab === 'lookup' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Lookup Booking Status & Receipt</h3>
            <p className="text-xs text-slate-500">
              Enter your SafarGo internal booking reference and registered contact number to access verified status and receipt.
            </p>

            <form onSubmit={handleLookup} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Booking Reference
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SFG-2026-847291"
                    value={lookupRef}
                    onChange={(e) => setLookupRef(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-mono uppercase bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9856789012"
                    value={lookupPhone}
                    onChange={(e) => setLookupPhone(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-slate-50"
                  />
                </div>
              </div>

              {lookupError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                  {lookupError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-safargo-navy hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition-colors"
              >
                Verify & Retrieve Booking Details
              </button>
            </form>
          </div>

          {/* LOOKUP RECEIPT VIEW */}
          {lookupResult && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-slate-300 shadow-2xl space-y-6 print:border-none">
              
              {/* Receipt Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-black text-safargo-navy">SAFAR<span className="text-safargo-orange">GO</span></span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-600 border border-slate-200">
                      Official Receipt
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Assisted Bus Booking Network</div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900 font-mono">{lookupResult.bookingRef}</div>
                  <div className="text-[11px] text-slate-500">{new Date(lookupResult.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Status and Assistance State */}
              <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">Current Booking Status:</span>
                <StatusBadge status={lookupResult.status} size="lg" />
              </div>

              {lookupResult.status === 'pending' && (
                <AssistanceTimer
                  startedAt={lookupResult.assistanceStartedAt}
                  status={lookupResult.status}
                  bookingRef={lookupResult.bookingRef}
                />
              )}

              {/* Operator Verification Block */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                <div className="font-bold text-slate-800 uppercase tracking-wide text-[10px]">
                  Authorized Operator Confirmation
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 block">Bus Operator:</span>
                    <strong>{lookupResult.operatorName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Operator Genuine PNR:</span>
                    {lookupResult.operatorPnr ? (
                      <strong className="font-mono text-emerald-700 text-sm">{lookupResult.operatorPnr}</strong>
                    ) : (
                      <span className="text-slate-400 italic">Awaiting Operator Verification</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Journey Details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Origin & Departure</span>
                  <div className="font-bold text-slate-900 text-sm">{lookupResult.originCity}</div>
                  <div className="text-slate-600">{lookupResult.journeyDate} at {lookupResult.departureTime}</div>
                  <div className="text-slate-500 mt-1">Boarding: {lookupResult.boardingPoint}</div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Destination & Arrival</span>
                  <div className="font-bold text-slate-900 text-sm">{lookupResult.destinationCity}</div>
                  <div className="text-slate-600">{lookupResult.journeyDate} at {lookupResult.arrivalTime}</div>
                  <div className="text-slate-500 mt-1">Dropping: {lookupResult.droppingPoint}</div>
                </div>
              </div>

              {/* Passengers Table */}
              <div>
                <div className="text-xs font-bold uppercase text-slate-700 mb-2">Passengers Listed</div>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-600 font-semibold">
                      <tr>
                        <th className="p-2.5">Name</th>
                        <th className="p-2.5">Age</th>
                        <th className="p-2.5">Gender</th>
                        <th className="p-2.5">Seat Preference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {lookupResult.passengers.map((p, i) => (
                        <tr key={i}>
                          <td className="p-2.5 font-medium text-slate-800">{p.fullName}</td>
                          <td className="p-2.5 text-slate-600">{p.age}</td>
                          <td className="p-2.5 text-slate-600 capitalize">{p.gender}</td>
                          <td className="p-2.5 text-slate-600">{p.seatPreference || 'Any available'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-xs">
                <div>
                  <div className="text-slate-500">Contact: {lookupResult.customerPhone}</div>
                  <div className="text-slate-400 text-[10px]">Payment Status: Verified at Desk</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-500">Base Fare: ₹{lookupResult.totalFare}</div>
                  {lookupResult.discountAmount > 0 && (
                    <div className="text-emerald-600">Coupon Discount: -₹{lookupResult.discountAmount}</div>
                  )}
                  <div className="text-lg font-black text-safargo-navy">Final Amount: ₹{lookupResult.finalAmount}</div>
                </div>
              </div>

              {/* Print Action */}
              <div className="pt-2 flex justify-end gap-2 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CANCELLATION REQUEST */}
      {activeTab === 'cancellation' && (
        <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-rose-700 font-bold text-base">
            <RotateCcw className="w-5 h-5" />
            <h3>Request Booking Cancellation & Refund</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Submit your SafarGo booking reference for cancellation review. Refunds are subject to the verified operator cancellation policy and deduction terms.
          </p>

          {cancelSuccessMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
              {cancelSuccessMsg}
            </div>
          )}

          {cancelErrorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              {cancelErrorMsg}
            </div>
          )}

          <form onSubmit={handleCancelSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Booking Reference (e.g. SFG-2026-847291)
              </label>
              <input
                type="text"
                required
                placeholder="SFG-2026-XXXX"
                value={cancelRef}
                onChange={(e) => setCancelRef(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-mono uppercase bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Cancellation
              </label>
              <textarea
                required
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-slate-50"
              />
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 leading-relaxed">
              <strong>Operator Policy Notice:</strong> SafarGo does not charge arbitrary cancellation fees. Deductions correspond strictly to the bus operator's scheduled departure rules.
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition-colors"
            >
              Submit Cancellation for Operations Review
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
