import React, { useState } from 'react';
import { BusTrip, Booking, SeatCategory } from '../../types';
import { SelectedSeatItem } from './RedBusSeatMapModal';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
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
  AlertCircle
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
  const { agentWalletBalance, createBooking, confirmBooking } = useData();
  const { success, error, warning } = useToast();

  const [customerName, setCustomerName] = useState(currentUser?.full_name || '');
  const [customerMobile, setCustomerMobile] = useState(currentUser?.mobile || '');
  const [customerAge, setCustomerAge] = useState('28');
  const [customerGender, setCustomerGender] = useState<'M' | 'F' | 'O'>('M');
  const [paymentOption, setPaymentOption] = useState<'wallet' | 'upi'>(
    role === 'agent' && agentWalletBalance >= totalFare ? 'wallet' : 'upi'
  );
  const [isProcessing, setIsProcessing] = useState(false);

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
        payment_utr: `AUTOPAY-${Date.now().toString().slice(-8)}`,
        agent_notes: `RedBus Automatic Instant Booking • Seats: ${seatsString} • Boarding: ${boardingPoint}`,
      });

      if (!newBooking) {
        error('Booking Error', 'बुकिंग प्रक्रिया में समस्या आई। कृपया पुनः प्रयास करें।');
        return;
      }

      // 2. Automatically Confirm with Real Generated PNR
      const autoPnr = `SFG-${Math.floor(100000 + Math.random() * 900000)}`;
      await confirmBooking(newBooking.id, {
        actual_fare: totalFare,
        confirmed_seats: selectedSeats.map((s) => s.number).join(', '),
        actual_operator: trip.operator_name,
        actual_boarding_point: boardingPoint,
        actual_drop_point: dropPoint,
        ticket_pnr: autoPnr,
        admin_notes: 'RedBus Instant Automatic Confirmation',
      });

      const confirmedObj: Booking = {
        ...newBooking,
        status: 'confirmed',
        ticket_pnr: autoPnr,
        actual_fare: totalFare,
        confirmed_seats: selectedSeats.map((s) => s.number).join(', '),
        actual_operator: trip.operator_name,
        actual_boarding_point: boardingPoint,
        actual_drop_point: dropPoint,
      };

      success(
        '🎉 टिकट सफलतापूर्वक कन्फर्म हुई!',
        `PNR: ${autoPnr} • ${selectedSeats.length} सीटें आरक्षित हो गई हैं।`
      );

      onBookingSuccess(confirmedObj);
      onClose();
    } catch (err: any) {
      console.error('Instant auto booking failed:', err);
      error('Booking Failed', err.message || 'स्वचालित बुकिंग में समस्या आई।');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-scaleUp max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center font-bold">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white text-red-600 px-2 py-0.5 rounded-full">
                  RedBus Inspired Instant Booking
                </span>
                <span className="text-xs text-red-100 font-bold">⚡ ऑटोमैटिक कन्फर्मेशन</span>
              </div>
              <h2 className="text-lg font-black text-white mt-0.5">
                {trip.operator_name} • {trip.source} ➔ {trip.destination}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
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

            <div className="pt-1 border-t border-red-200/60 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[10px]">चयनित सीटें:</span>
                <strong className="text-red-700 font-mono text-xs">{seatsString}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[10px]">कुल किराया:</span>
                <strong className="text-slate-950 font-black text-base font-mono">₹{totalFare}</strong>
              </div>
            </div>
          </div>

          {/* Passenger Information */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-slate-900 flex items-center gap-1.5 text-sm">
              <User className="w-4 h-4 text-red-600" />
              <span>यात्री विवरण (Passenger Information)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">यात्री का पूरा नाम *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="उदा. राहुल शर्मा"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">मोबाइल नंबर *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    placeholder="10 अंकों का नंबर"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">आयु (Age) *</label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  required
                  value={customerAge}
                  onChange={(e) => setCustomerAge(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">लिंग (Gender) *</label>
                <select
                  value={customerGender}
                  onChange={(e) => setCustomerGender(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-red-500 outline-none bg-white"
                >
                  <option value="M">पुरुष (Male)</option>
                  <option value="F">महिला (Female)</option>
                  <option value="O">अन्य (Other)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-slate-900 flex items-center gap-1.5 text-sm">
              <CreditCard className="w-4 h-4 text-red-600" />
              <span>भुगतान विधि चुनें (Payment Method)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {role === 'agent' && (
                <label
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition flex items-center gap-3 ${
                    paymentOption === 'wallet'
                      ? 'border-emerald-500 bg-emerald-50/70'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payOpt"
                    checked={paymentOption === 'wallet'}
                    onChange={() => setPaymentOption('wallet')}
                    className="text-emerald-600"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Wallet className="w-4 h-4 text-emerald-600" />
                      <strong className="text-slate-900">एजेंट प्रीपेड वॉलेट</strong>
                    </div>
                    <span className="text-[11px] text-slate-500 block">
                      बैलेंस: ₹{agentWalletBalance.toFixed(2)}
                    </span>
                  </div>
                </label>
              )}

              <label
                className={`p-3 rounded-2xl border-2 cursor-pointer transition flex items-center gap-3 ${
                  paymentOption === 'upi'
                    ? 'border-red-500 bg-red-50/70'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="payOpt"
                  checked={paymentOption === 'upi'}
                  onChange={() => setPaymentOption('upi')}
                  className="text-red-600"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <strong className="text-slate-900">ऑनलाइन UPI / QR</strong>
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    GooglePay / PhonePe / Paytm
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Commission Note for Agents */}
          {role === 'agent' && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 flex items-center justify-between">
              <span className="font-bold">एजेंट सुरक्षित कमीशन:</span>
              <strong className="text-emerald-700 text-sm font-black">+₹19.34 तुरंत लेज़र में क्रेडिट</strong>
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm shadow-xl shadow-red-600/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? (
              <span>सीट व PNR जनरेट हो रहा है...</span>
            ) : (
              <>
                <span>₹{totalFare} — तुरंत सीट बुक व टिकट जारी करें</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
