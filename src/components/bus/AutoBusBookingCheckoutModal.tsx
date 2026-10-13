import React, { useState, useEffect } from 'react';
import { BusTrip, Booking, SeatCategory } from '../../types';
import { SelectedSeatItem } from './RedBusSeatMapModal';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { PrintTicketModal } from '../common/PrintTicketModal';
import {
  X,
  Bus,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Wallet,
  User,
  Phone,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  Printer,
  Share2
} from 'lucide-react';

interface AutoBusBookingCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: BusTrip;
  selectedSeats: SelectedSeatItem[];
  totalFare: number;
  seatCategory: SeatCategory;
  boardingPoint: string;
  dropPoint: string;
  onBookingSuccess: (booking: Booking) => void;
}

export const AutoBusBookingCheckoutModal: React.FC<AutoBusBookingCheckoutModalProps> = ({
  isOpen,
  onClose,
  trip,
  selectedSeats,
  totalFare,
  seatCategory,
  boardingPoint,
  dropPoint,
  onBookingSuccess,
}) => {
  const { currentUser, role } = useAuth();
  const { agentWalletBalance, createBooking, bookings } = useData();
  const { success, error } = useToast();

  const [modalStep, setModalStep] = useState<'form' | 'timer' | 'confirmed'>('form');
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(300); // 5-minute countdown = 300s
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const [customerName, setCustomerName] = useState(currentUser?.full_name || '');
  const [customerMobile, setCustomerMobile] = useState(currentUser?.mobile || '');
  const [customerAge, setCustomerAge] = useState('28');
  const [customerGender, setCustomerGender] = useState<'M' | 'F' | 'O'>('M');
  const [paymentOption, setPaymentOption] = useState<'wallet' | 'upi'>(
    role === 'agent' && agentWalletBalance >= totalFare ? 'wallet' : 'upi'
  );
  const [isProcessing, setIsProcessing] = useState(false);

  // 5-Minute Countdown Timer
  useEffect(() => {
    if (modalStep !== 'timer' || timerSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [modalStep, timerSeconds]);

  // Real-time listener: Watch if Admin accepted & confirmed the ticket
  useEffect(() => {
    if (modalStep === 'timer' && createdBooking) {
      const live = bookings.find((b) => b.id === createdBooking.id);
      if (live && live.status === 'confirmed') {
        setCreatedBooking(live);
        setModalStep('confirmed');
        onBookingSuccess(live);
        success('🎉 टिकट स्वीकृत व कन्फर्म!', `PNR: ${live.ticket_pnr || 'SFG-CONFIRMED'}`);
      }
    }
  }, [bookings, modalStep, createdBooking, onBookingSuccess, success]);

  if (!isOpen) return null;

  const seatsString = selectedSeats.map((s) => `${s.number} (${s.type === 'sleeper' ? 'स्लीपर' : 'सीटर'})`).join(', ');

  const handleInstantAutoBook = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanMobile = customerMobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      error('Invalid Mobile', 'कृपया सही 10-अंकों का यात्री मोबाइल नंबर दर्ज करें।');
      return;
    }

    if (!customerName.trim()) {
      error('Name Required', 'कृपया यात्री का पूरा नाम दर्ज करें।');
      return;
    }

    if (paymentOption === 'wallet' && agentWalletBalance < totalFare) {
      error('Insufficient Wallet Balance', `आपके वॉलेट में ₹${totalFare} नहीं हैं। कृपया पहले वॉलेट रिचार्ज करें या UPI चुनें।`);
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Create Base Booking via DataContext
      const newBooking = await createBooking({
        agent_id: currentUser?.id || 'guest-cust',
        agent_name: currentUser?.full_name || customerName.trim(),
        agent_mobile: currentUser?.mobile || cleanMobile,
        from_city: trip.source,
        to_city: trip.destination,
        journey_date: trip.journey_date || new Date().toISOString().split('T')[0],
        departure_time_pref: trip.departure_time,
        operator_preference: trip.operator_name,
        seat_category: seatCategory,
        seat_count: selectedSeats.length,
        passenger_count: selectedSeats.length,
        passenger_details: selectedSeats.map((s, idx) => ({
          id: `p-${idx + 1}`,
          name: idx === 0 ? customerName.trim() : `सह-यात्री ${idx + 1}`,
          age: parseInt(customerAge, 10) || 28,
          gender: (customerGender as 'male' | 'female' | 'other') || 'male',
          seat_number: s.number,
        })),
        customer_name: customerName.trim(),
        customer_mobile: cleanMobile,
        boarding_point: boardingPoint,
        drop_point: dropPoint,
        estimated_fare: totalFare,
        total_estimated_amount: totalFare,
        payment_mode: paymentOption === 'wallet' ? 'agent_wallet' : 'safargo_qr',
        payment_status: 'paid',
        payment_utr: paymentOption === 'wallet' ? `WALLET-${Date.now().toString().slice(-6)}` : `UPI-${Date.now().toString().slice(-6)}`,
        agent_notes: `[Instant Ticket Auto-Request] Seats: ${seatsString} • Boarding: ${boardingPoint} • Drop: ${dropPoint}`,
      });

      if (!newBooking) {
        error('Booking Error', 'बुकिंग प्रक्रिया में समस्या आई। कृपया पुनः प्रयास करें।');
        return;
      }

      setCreatedBooking(newBooking);
      setModalStep('timer');
      setTimerSeconds(300); // 5-minute timer
    } catch (err: any) {
      console.error('Instant auto booking failed:', err);
      error('Booking Failed', err.message || 'स्वचालित बुकिंग में समस्या आई।');
    } finally {
      setIsProcessing(false);
    }
  };

  const timerMinutes = Math.floor(timerSeconds / 60);
  const timerSecs = timerSeconds % 60;
  const timerFormatted = `${String(timerMinutes).padStart(2, '0')}:${String(timerSecs).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 my-8 max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-xs font-black">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-base sm:text-lg">
                {modalStep === 'form'
                  ? 'तत्काल बस टिकट चेकआउट'
                  : modalStep === 'timer'
                  ? '⚡ टिकट सत्यापन 5-मिनट टाइमर'
                  : '🎉 टिकट सफलतापूर्वक कन्फर्म!'}
              </h2>
              <p className="text-xs text-red-100 font-medium truncate max-w-[260px] sm:max-w-xs">
                {trip.operator_name} • {trip.source} ➔ {trip.destination}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP 1: PASSENGER FORM & PAYMENT CHOICE */}
        {modalStep === 'form' && (
          <form onSubmit={handleInstantAutoBook} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
            {/* Trip Summary Card */}
            <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200 space-y-2">
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1 font-bold">
                  <Calendar className="w-3.5 h-3.5 text-red-600" /> तारीख: {trip.journey_date || '2026-10-12'}
                </span>
                <span className="flex items-center gap-1 font-bold">
                  <Clock className="w-3.5 h-3.5 text-red-600" /> प्रस्थान: {trip.departure_time}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-red-200/60 text-[11px]">
                <div>
                  <span className="text-slate-500 block">बोर्डिंग पॉइंट:</span>
                  <strong className="text-slate-900">{boardingPoint}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">ड्रॉप पॉइंट:</span>
                  <strong className="text-slate-900">{dropPoint}</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-red-200/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">चयनित सीटें ({selectedSeats.length}):</span>
                  <strong className="text-red-700 font-bold">{seatsString}</strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">कुल किराया:</span>
                  <strong className="text-lg font-black text-slate-900 font-mono">₹{totalFare}</strong>
                </div>
              </div>
            </div>

            {/* Passenger Details */}
            <div className="space-y-3">
              <h3 className="font-black text-slate-900 flex items-center gap-1.5 text-xs">
                <User className="w-4 h-4 text-red-600" />
                मुख्य यात्री का विवरण (Lead Passenger)
              </h3>

              <div>
                <label className="block font-bold text-slate-700 mb-1">पूरा नाम (Full Name) *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="उदा. राहुल शर्मा"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-red-500 outline-none text-xs bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">मोबाइल नंबर *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    placeholder="10-अंकों का मोबाइल"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold font-mono focus:ring-2 focus:ring-red-500 outline-none text-xs bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">उम्र (Age)</label>
                    <input
                      type="number"
                      min={5}
                      max={99}
                      value={customerAge}
                      onChange={(e) => setCustomerAge(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-red-500 outline-none text-xs bg-white text-center font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">लिंग</label>
                    <select
                      value={customerGender}
                      onChange={(e) => setCustomerGender(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-red-500 outline-none text-xs bg-white"
                    >
                      <option value="M">पुरुष (M)</option>
                      <option value="F">महिला (F)</option>
                      <option value="O">अन्य (O)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2.5 pt-1">
              <h3 className="font-black text-slate-900 flex items-center gap-1.5 text-xs">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                भुगतान विधि (Payment Method)
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {/* Agent Wallet Option */}
                <button
                  type="button"
                  onClick={() => setPaymentOption('wallet')}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                    paymentOption === 'wallet'
                      ? 'border-emerald-500 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-400'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-slate-900 text-xs flex items-center gap-1">
                      <Wallet className="w-4 h-4 text-emerald-600" />
                      एजेंट वॉलेट
                    </span>
                    {paymentOption === 'wallet' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <span className="text-[10px] text-slate-500 block font-mono">
                    शेष: ₹{agentWalletBalance.toFixed(2)}
                  </span>
                  <span className="text-[9px] text-emerald-700 font-black mt-1">
                    ✓ +₹19 (₹19.34) एजेंट कमीशन
                  </span>
                </button>

                {/* Instant UPI QR */}
                <button
                  type="button"
                  onClick={() => setPaymentOption('upi')}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                    paymentOption === 'upi'
                      ? 'border-red-500 bg-red-50/80 shadow-xs ring-2 ring-red-400'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-slate-900 text-xs flex items-center gap-1">
                      <CreditCard className="w-4 h-4 text-red-600" />
                      UPI / QR कोड
                    </span>
                    {paymentOption === 'upi' && <CheckCircle2 className="w-4 h-4 text-red-600" />}
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    GPay / PhonePe / Paytm
                  </span>
                  <span className="text-[9px] text-emerald-700 font-black block mt-1">
                    ✓ +₹19 (₹19.34) एजेंट कमीशन
                  </span>
                </button>
              </div>

              {/* Agent Commission Guarantee Note */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center gap-2 text-[11px] text-emerald-900 font-bold">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  ऑटोमैटिक बस बुकिंग में भी एजेंट को प्रति बुकिंग <strong>₹19 (₹19.34) का गारंटीड कमीशन</strong> मिलेगा!
                </span>
              </div>
            </div>

            {/* Submit Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>प्रक्रियाधीन है...</span>
                ) : (
                  <>
                    <span>₹{totalFare} का भुगतान करें व टिकट बुक करें</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: 5-MINUTE COUNTDOWN TIMER (Admin Verification in Progress) */}
        {modalStep === 'timer' && createdBooking && (
          <div className="p-6 sm:p-8 space-y-6 text-center overflow-y-auto flex-1">
            <div className="w-20 h-20 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
              <Clock className="w-10 h-10 animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 bg-amber-100 text-amber-800 rounded-full inline-block border border-amber-300 shadow-2xs">
                अनुरोध एडमिन को भेजा गया ✓
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                आपकी टिकट बुकिंग रिक्वेस्ट प्राप्त हो गई है!
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 font-semibold max-w-md mx-auto leading-relaxed">
                ⚡ 5 मिनट के अंदर एडमिन द्वारा आपकी टिकट स्वीकृत व कन्फर्म कर दी जाएगी।
              </p>
            </div>

            {/* 5-Minute Countdown Clock Banner */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl p-5 border border-slate-800 shadow-xl space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>5-मिनट टाइमर (काउंटडाउन चालू):</span>
              </div>
              <div className="text-5xl font-black font-mono tracking-widest text-amber-400">
                {timerFormatted}
              </div>
              <p className="text-[11px] text-slate-300 pt-1">
                जैसे ही एडमिन टिकट स्वीकृत करेंगे, <strong>PNR व कन्फर्म टिकट स्वतः स्क्रीन पर आ जाएगी</strong>।
              </p>
            </div>

            {/* Booking Details Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>बुकिंग रेफरेंस:</span>
                <strong className="font-mono text-slate-900 font-bold">{createdBooking.booking_code}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>यात्री का नाम:</span>
                <strong className="text-slate-900 font-bold">{createdBooking.customer_name}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>मार्ग (Route):</span>
                <span className="font-bold text-slate-800">{createdBooking.from_city} ➔ {createdBooking.to_city}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>ऑपरेटर व सीटें:</span>
                <span className="font-bold text-slate-800">{createdBooking.operator_preference} ({seatsString})</span>
              </div>
              <div className="flex justify-between items-center text-emerald-700 font-bold">
                <span>एजेंट कमीशन (कन्फर्म होने पर):</span>
                <span>+₹19 (₹19.34) प्रति बुकिंग</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 pt-2 border-t border-slate-200">
                <span>कुल किराया:</span>
                <strong className="text-base font-black text-red-600 font-mono">₹{totalFare}</strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              <a
                href={`https://wa.me/919876543210?text=${encodeURIComponent(`नमस्ते SafarGo एडमिन, मैंने ऑटोमैटिक टिकट बुक की है (Ref: ${createdBooking.booking_code})। कृपया तुरंत टिकट कन्फर्म करें।`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md"
              >
                <Phone className="w-4 h-4" />
                <span>WhatsApp एडमिन सपोर्ट</span>
              </a>

              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                डैशबोर्ड पर जाएं
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CONFIRMED TICKET CELEBRATION SCREEN */}
        {modalStep === 'confirmed' && createdBooking && (
          <div className="p-6 sm:p-8 space-y-6 text-center overflow-y-auto flex-1">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 bg-emerald-500 text-white rounded-full inline-block shadow-sm">
                🎉 टिकट सफलतापूर्वक कन्फर्म हो गई!
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                PNR: {createdBooking.ticket_pnr || 'SFG-CONFIRMED'}
              </h2>
              <p className="text-xs text-slate-600">
                यात्री <strong>{createdBooking.customer_name}</strong> की सीटें आरक्षित हो चुकी हैं।
              </p>
            </div>

            {/* Confirmed Ticket Summary */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-700">
                <span>बस ऑपरेटर:</span>
                <strong className="text-slate-900">{createdBooking.actual_operator || createdBooking.operator_preference}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span>सीट नंबर:</span>
                <strong className="text-emerald-700 font-mono text-sm">{createdBooking.confirmed_seats || seatsString}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span>बोर्डिंग पॉइंट:</span>
                <strong className="text-slate-900">{createdBooking.actual_boarding_point || createdBooking.boarding_point}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span>ड्रॉप पॉइंट:</span>
                <strong className="text-slate-900">{createdBooking.actual_drop_point || createdBooking.drop_point}</strong>
              </div>
              <div className="flex justify-between items-center text-emerald-800 pt-2 border-t border-emerald-200 font-black">
                <span>एजेंट कमीशन क्रेडिटेड:</span>
                <span>+₹19.34 (₹19 प्रति बुकिंग) ✓</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-2.5">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(true)}
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>टिकट प्रिंट / डाउनलोड</span>
                </button>
                <a
                  href={`https://wa.me/91${createdBooking.customer_mobile}?text=${encodeURIComponent(`नमस्ते ${createdBooking.customer_name}, आपकी सफ़ारगो बस टिकट कन्फर्म हो गई है!\nPNR: ${createdBooking.ticket_pnr}\nमार्ग: ${createdBooking.from_city} से ${createdBooking.to_city}\nसीट: ${createdBooking.confirmed_seats || seatsString}\nशुभ यात्रा!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Share2 className="w-4 h-4" />
                  <span>WhatsApp पर भेजें</span>
                </a>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                डैशबोर्ड पर लौटें (Done)
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Print Ticket Modal */}
      {isPrintModalOpen && createdBooking && (
        <PrintTicketModal
          booking={createdBooking}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}
    </div>
  );
};
