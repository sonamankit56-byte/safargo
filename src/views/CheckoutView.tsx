import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import {
  Bus,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building2,
  Banknote,
  ArrowLeft,
  CheckCircle2,
  Tag,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CheckoutView: React.FC = () => {
  const {
    selectedBus,
    selectedSeats,
    selectedBoarding,
    selectedDropping,
    journeyDate,
    passengers,
    setPassengers,
    contactEmail,
    setContactEmail,
    contactPhone,
    setContactPhone,
    couponCode,
    setCouponCode,
    discountAmount,
    applyCoupon,
    confirmCurrentBooking,
    setCurrentView,
  } = useBooking();

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'cash'>('upi');
  const [upiId, setUpiId] = useState('traveler@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 8920 1234 5678');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('890');
  const [hasInsurance, setHasInsurance] = useState(true);
  const [couponInput, setCouponInput] = useState(couponCode || '');
  const [couponMsg, setCouponMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!selectedBus || selectedSeats.length === 0 || !selectedBoarding || !selectedDropping) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">No Active Booking Session Found</h2>
        <p className="text-xs text-slate-500">Please choose a bus and select your seats to proceed to checkout.</p>
        <button
          onClick={() => setCurrentView('search')}
          className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold text-xs shadow-md"
        >
          Return to Bus Search
        </button>
      </div>
    );
  }

  const baseFare = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const gst = Math.round(baseFare * 0.05);
  const insuranceFare = hasInsurance ? selectedSeats.length * 15 : 0;
  const totalPayable = Math.max(0, baseFare + gst + insuranceFare - discountAmount);

  const handlePassengerChange = (index: number, field: string, value: string | number) => {
    setPassengers(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const success = applyCoupon(couponInput);
    if (success) {
      setCouponMsg(`✅ Applied! ₹${couponInput.toUpperCase() === 'FIRST50' ? 150 : 100} saved.`);
    } else {
      setCouponMsg('❌ Invalid coupon code. Try SAFAR100 or FIRST50.');
    }
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();

    // Verify passengers have names
    const missingName = passengers.some(p => !p.name || p.name.trim().length === 0);
    if (missingName) {
      alert('Please fill passenger names for all selected seats.');
      return;
    }

    if (!contactPhone || contactPhone.length < 10) {
      alert('Please enter a valid 10-digit contact mobile number.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const booking = confirmCurrentBooking();
      if (booking) {
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }
        setCurrentView('success');
      }
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top back button & title */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentView('search')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Bus Selection
        </button>
        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
          <Lock className="w-3.5 h-3.5 text-emerald-600" /> 256-Bit SSL Encrypted Checkout
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: PASSENGER & PAYMENT DETAILS */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. PASSENGER INFORMATION */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight flex items-center justify-between">
              <span>Passenger Information</span>
              <span className="text-xs text-red-600 bg-red-50 px-2.5 py-1 rounded-full font-bold">
                {selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'} Selected
              </span>
            </h3>

            <div className="space-y-4">
              {selectedSeats.map((seat, index) => {
                const p = passengers[index] || { name: '', age: 26, gender: 'male' };
                return (
                  <div
                    key={seat.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800">
                        Passenger {index + 1}
                      </span>
                      <span className="text-xs font-black text-white bg-slate-900 px-2.5 py-0.5 rounded-md">
                        Seat: {seat.number} ({seat.deck.toUpperCase()} • {seat.type.toUpperCase()})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-6">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={p.name}
                          onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                          Age
                        </label>
                        <input
                          type="number"
                          min="5"
                          max="99"
                          required
                          value={p.age}
                          onChange={(e) => handlePassengerChange(index, 'age', parseInt(e.target.value, 10) || 18)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                          Gender
                        </label>
                        <select
                          value={p.gender}
                          onChange={(e) => handlePassengerChange(index, 'gender', e.target.value as 'male' | 'female')}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. CONTACT DETAILS */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
              Contact Details (For E-Ticket & SMS Updates)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Mobile Number
                </label>
                <div className="flex items-center rounded-lg border border-slate-300 focus-within:border-red-500 overflow-hidden">
                  <span className="bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 border-r border-slate-300">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 focus:border-red-500"
                />
              </div>
            </div>

            {/* Travel Insurance Add-on */}
            <div className="pt-2">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-300 cursor-pointer bg-emerald-50/40">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Add Comprehensive Travel Insurance (₹15/passenger)
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Covers medical emergencies, baggage loss & trip cancellations up to ₹5,00,000
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={hasInsurance}
                  onChange={(e) => setHasInsurance(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
              </label>
            </div>
          </div>

          {/* 3. PAYMENT METHOD SELECTION */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
              Select Payment Method
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-red-600 bg-red-50 text-red-700 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Smartphone className="w-5 h-5 mb-1 text-red-600" />
                <span className="text-xs">UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  paymentMethod === 'card'
                    ? 'border-red-600 bg-red-50 text-red-700 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <CreditCard className="w-5 h-5 mb-1 text-slate-800" />
                <span className="text-xs">Cards</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  paymentMethod === 'netbanking'
                    ? 'border-red-600 bg-red-50 text-red-700 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Building2 className="w-5 h-5 mb-1 text-indigo-600" />
                <span className="text-xs">Net Banking</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-red-600 bg-red-50 text-red-700 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Banknote className="w-5 h-5 mb-1 text-emerald-600" />
                <span className="text-xs">Pay on Bus</span>
              </button>
            </div>

            {/* Payment Fields Simulation */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              {paymentMethod === 'upi' && (
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">
                    UPI ID / VPA
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="username@okhdfcbank"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800"
                  />
                  <p className="text-[10px] text-slate-400">
                    Supports Google Pay, PhonePe, Paytm, BHIM and any UPI app
                  </p>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4532 8920 1234 5678"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-800"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="12/28"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="890"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">
                    Select Your Bank
                  </label>
                  <select className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-800">
                    <option>HDFC Bank</option>
                    <option>State Bank of India (SBI)</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                    <option>Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              {paymentMethod === 'cash' && (
                <div className="text-xs text-slate-600 space-y-1">
                  <p className="font-bold text-slate-800">Pay directly to Bus Conductor</p>
                  <p className="text-[11px] text-slate-500">
                    You can pay the fare in cash or through UPI directly at the boarding counter.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: JOURNEY SUMMARY & FARE BREAKDOWN */}
        <div className="lg:col-span-5 space-y-6">
          {/* Journey Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
              Trip Details
            </h3>

            <div className="space-y-3 text-left">
              <div>
                <span className="text-base font-extrabold text-slate-900">
                  {selectedBus.operator.name}
                </span>
                <p className="text-xs text-slate-500">{selectedBus.operator.busType}</p>
              </div>

              <div className="flex items-center justify-between text-xs py-2 bg-slate-50 px-3 rounded-xl border border-slate-200">
                <div>
                  <div className="font-bold text-slate-800">{selectedBus.fromCity}</div>
                  <div className="text-[10px] text-slate-500">{selectedBoarding.location}</div>
                  <div className="font-black text-red-600">{selectedBoarding.time}</div>
                </div>
                <div className="text-slate-400 font-bold text-[10px]">
                  → {selectedBus.duration} →
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-800">{selectedBus.toCity}</div>
                  <div className="text-[10px] text-slate-500">{selectedDropping.location}</div>
                  <div className="font-black text-emerald-600">{selectedDropping.time}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <span>Date of Journey:</span>
                <span className="font-bold text-slate-900">
                  {new Date(journeyDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Selected Seats:</span>
                <span className="font-black text-red-600">
                  {selectedSeats.map(s => s.number).join(', ')}
                </span>
              </div>
            </div>
          </div>

          {/* Promo Code Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <Tag className="w-4 h-4 text-red-600" /> Apply Promo Code
            </div>

            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Try SAFAR100 or FIRST50"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold uppercase focus:border-red-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                APPLY
              </button>
            </form>
            {couponMsg && (
              <p className="text-xs font-bold">{couponMsg}</p>
            )}
          </div>

          {/* Fare Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
              Fare Breakdown
            </h3>

            <div className="flex justify-between text-slate-600">
              <span>Base Fare ({selectedSeats.length} Seats)</span>
              <span className="font-bold text-slate-900">₹{baseFare}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Goods & Services Tax (5% GST)</span>
              <span className="font-bold text-slate-900">₹{gst}</span>
            </div>

            {hasInsurance && (
              <div className="flex justify-between text-slate-600">
                <span>Travel Insurance</span>
                <span className="font-bold text-slate-900">₹{insuranceFare}</span>
              </div>
            )}

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Promo Discount ({couponCode})</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
              <span className="font-black text-sm text-slate-900">Total Amount Payable</span>
              <span className="text-2xl font-black text-red-600">₹{totalPayable}</span>
            </div>
          </div>

          {/* FINAL SUBMIT BUTTON */}
          <button
            type="button"
            onClick={handlePayment}
            disabled={isProcessing}
            className={`w-full py-4 rounded-2xl text-base font-black shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
              isProcessing
                ? 'bg-slate-400 text-white cursor-wait'
                : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-red-200'
            }`}
          >
            {isProcessing ? (
              <span>Securing Your Seats & Booking Ticket...</span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>PAY ₹{totalPayable} & CONFIRM BOOKING</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
