import React, { useState, useId } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { SeatCategory, Passenger, Booking } from '../../types';
import { BookingSuccessModal } from './BookingSuccessModal';
import { WalletRechargeModal } from './WalletRechargeModal';
import {
  Bus,
  User,
  Phone,
  Users,
  MapPin,
  Calendar,
  Clock,
  Send,
  AlertTriangle,
  Info,
  DollarSign,
  QrCode,
  Wallet,
  Smartphone,
  Upload,
  Check,
  Copy,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';


export const ManualBookingForm: React.FC = () => {
  const { isApprovedAgent, isAdmin } = useAuth();
  const { createBooking, agentWalletBalance, settings } = useData();
  const { error, warning, success } = useToast();

  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [journeyDate, setJourneyDate] = useState(() => {
    // Default to tomorrow
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [departureTimePref, setDepartureTimePref] = useState('Evening (06:00 PM - 10:00 PM)');
  const [operatorPreference, setOperatorPreference] = useState('');
  const [seatCategory, setSeatCategory] = useState<SeatCategory>('ac_sleeper');
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [passengers, setPassengers] = useState<Passenger[]>([
    { id: 'p-1', name: '', age: 28, gender: 'male' },
  ]);
  const [boardingPoint, setBoardingPoint] = useState('');
  const [dropPoint, setDropPoint] = useState('');
  const [estimatedFare, setEstimatedFare] = useState<number>(850);
  const [agentNotes, setAgentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  // Advance Payment Mode States (SafarGo QR vs Agent Wallet Min ₹2,000)
  const [paymentMode, setPaymentMode] = useState<'safargo_qr' | 'agent_wallet'>('safargo_qr');
  const [paymentUtr, setPaymentUtr] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState('');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);


  // Generate an idempotency key per form session to prevent double submits
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => `idemp-${Date.now()}`);

  // Minimum date today
  const todayStr = new Date().toISOString().split('T')[0];

  const handlePassengerCountChange = (count: number) => {
    setPassengerCount(count);
    const updated: Passenger[] = [];
    for (let i = 0; i < count; i++) {
      updated.push(
        passengers[i] || {
          id: `p-${i + 1}`,
          name: i === 0 ? customerName : '',
          age: 25,
          gender: 'male',
        }
      );
    }
    setPassengers(updated);
  };

  const updatePassenger = (index: number, field: keyof Passenger, value: any) => {
    setPassengers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const totalAmount = estimatedFare * passengerCount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isApprovedAgent && !isAdmin) {
      warning(
        'Account Pending Approval',
        'Your agent account must be approved by SafarGo admin before you can submit manual bookings.'
      );
      return;
    }

    // Validation: 10 digit Indian phone number
    const cleanMobile = customerMobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      error('Invalid Mobile Number', 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    // Date validation: no past dates
    if (journeyDate < todayStr) {
      error('Invalid Journey Date', 'Journey date cannot be in the past.');
      return;
    }

    if (!customerName.trim() || !fromCity.trim() || !toCity.trim() || !boardingPoint.trim()) {
      error('Missing Information', 'Please fill in all mandatory customer and journey fields.');
      return;
    }

    if (estimatedFare <= 0) {
      error('Invalid Fare', 'Estimated fare must be greater than zero.');
      return;
    }

    // Payment method validation
    if (paymentMode === 'safargo_qr') {
      if (!paymentUtr.trim() || paymentUtr.trim().length < 8) {
        error(
          'Payment UTR Required',
          'कृपया SafarGo QR Code / UPI ID पर भुगतान करने के बाद 12-अंकों का बैंक UTR / UPI Ref Number दर्ज करें।'
        );
        return;
      }
    } else {
      if (agentWalletBalance < totalAmount) {
        error(
          'अपर्याप्त वॉलेट बैलेंस (Insufficient Wallet Balance)',
          `टिकट बुक करने हेतु ₹${totalAmount.toLocaleString('en-IN')} चाहिए, आपके वॉलेट में ₹${agentWalletBalance.toLocaleString('en-IN')} हैं। कृपया वॉलेट में न्यूनतम ₹2,000 जोड़ें।`
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const saved = await createBooking({
        agent_id: '', // Filled in context
        customer_name: customerName.trim(),
        customer_mobile: cleanMobile,
        passenger_count: passengerCount,
        passenger_details: passengers,
        from_city: fromCity.trim(),
        to_city: toCity.trim(),
        journey_date: journeyDate,
        departure_time_pref: departureTimePref,
        operator_preference: operatorPreference.trim() || 'Any Verified Operator',
        seat_category: seatCategory,
        seat_count: passengerCount,
        boarding_point: boardingPoint.trim(),
        drop_point: dropPoint.trim() || `${toCity.trim()} Main Stand`,
        estimated_fare: estimatedFare,
        total_estimated_amount: totalAmount,
        agent_notes: agentNotes.trim(),
        idempotency_key: idempotencyKey,
        payment_mode: paymentMode,
        payment_utr: paymentMode === 'safargo_qr' ? paymentUtr.trim() : undefined,
        payment_screenshot_url: paymentScreenshot || undefined,
      });

      if (saved) {
        setCreatedBooking(saved);
        // Reset idempotency key for next booking
        setIdempotencyKey(`idemp-${Date.now()}`);
        // Reset form
        setCustomerName('');
        setCustomerMobile('');
        setFromCity('');
        setToCity('');
        setBoardingPoint('');
        setDropPoint('');
        setAgentNotes('');
        setPaymentUtr('');
        setPaymentScreenshot('');
        setPassengerCount(1);
        setPassengers([{ id: 'p-1', name: '', age: 28, gender: 'male' }]);
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Important Disclaimer Banner */}
      <div className="space-y-3 mb-6">
        <div className="bg-emerald-950/90 text-white border-2 border-emerald-500/50 rounded-2xl p-5 flex items-start gap-4 shadow-lg">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <Phone className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded bg-emerald-500 text-slate-900">
                अनिवार्य सूचना (Mandatory Rule)
              </span>
            </div>
            <h2 className="font-black text-white text-base">
              15 मिनट के टाइमर में एजेंट को WhatsApp पर एक्टिव रहना होगा!
            </h2>
            <p className="text-xs text-emerald-200 leading-relaxed font-medium">
              बुकिंग सबमिट करने के बाद <strong>SafarGo की टीम आपसे WhatsApp पर ही बस ऑपरेटर सीट और टिकट की डिटेल मांगेगी</strong>। कृपया इस 15 मिनट की विंडो में अपना WhatsApp चेक करते रहें और SafarGo सपोर्ट को रिप्लाई दें।
            </p>
          </div>
        </div>

        <div className="bg-blue-900/10 border border-blue-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-700 leading-relaxed">
            यह ऑफलाइन मैन्युअल बस बुकिंग पोर्टल है। एडमिन द्वारा बस ऑपरेटर से सीट कन्फर्म होने पर <strong>₹19.34 कमीशन स्वतः क्रेडिट</strong> होगा।
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Form Header */}
        <div className="bg-slate-900 text-white p-6 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Manual Booking Request</span>
              <h1 className="text-2xl font-black mt-0.5">नया बस टिकट बुक करें</h1>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Eligible Commission</span>
              <span className="text-lg font-black text-emerald-400">₹19.34</span>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Section 1: Customer Details */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold text-lg border-b border-slate-100 pb-2">
              <User className="w-5 h-5 text-orange-500" />
              <span>1. Customer Details (ग्राहक की जानकारी)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (passengers.length > 0 && passengers[0].name === '') {
                        updatePassenger(0, 'name', e.target.value);
                      }
                    }}
                    placeholder="e.g. Ramesh Kumar Patel"
                    className="w-full pl-3 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Mobile Number (10 Digits) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-sm font-semibold">
                    +91
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm outline-none transition font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Journey Details */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold text-lg border-b border-slate-100 pb-2">
              <Bus className="w-5 h-5 text-orange-500" />
              <span>2. Journey Details (सफर का विवरण)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  From City (कहाँ से) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fromCity}
                  onChange={(e) => setFromCity(e.target.value)}
                  placeholder="e.g. Lucknow / Sitapur / Delhi"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  To City (कहाँ तक) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={toCity}
                  onChange={(e) => setToCity(e.target.value)}
                  placeholder="e.g. Delhi / Jaipur / Varanasi"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Journey Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={journeyDate}
                  onChange={(e) => setJourneyDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preferred Departure Time
                </label>
                <select
                  value={departureTimePref}
                  onChange={(e) => setDepartureTimePref(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm outline-none bg-white transition"
                >
                  <option value="Morning (06:00 AM - 12:00 PM)">Morning (06:00 AM - 12:00 PM)</option>
                  <option value="Afternoon (12:00 PM - 05:00 PM)">Afternoon (12:00 PM - 05:00 PM)</option>
                  <option value="Evening (05:00 PM - 09:00 PM)">Evening (05:00 PM - 09:00 PM)</option>
                  <option value="Night (09:00 PM - 12:00 AM)">Night (09:00 PM - 12:00 AM)</option>
                  <option value="Late Night (12:00 AM - 05:00 AM)">Late Night (12:00 AM - 05:00 AM)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bus Operator Preference (Optional)
                </label>
                <input
                  type="text"
                  value={operatorPreference}
                  onChange={(e) => setOperatorPreference(e.target.value)}
                  placeholder="e.g. Hans, Gujarat Travels, Any AC"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Seat Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={seatCategory}
                  onChange={(e) => setSeatCategory(e.target.value as SeatCategory)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm outline-none bg-white font-medium transition"
                >
                  <option value="ac_sleeper">AC Sleeper (स्लीपर एसी)</option>
                  <option value="non_ac_sleeper">Non-AC Sleeper (स्लीपर नॉन-एसी)</option>
                  <option value="ac_seater">AC Seater (सीटर एसी)</option>
                  <option value="non_ac_seater">Non-AC Seater (सीटर नॉन-एसी)</option>
                  <option value="semi_sleeper">Semi-Sleeper (सेमी-स्लीपर)</option>
                  <option value="sleeper">General Sleeper</option>
                  <option value="seater">General Seater</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Boarding Point (बैठने का स्थान) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={boardingPoint}
                  onChange={(e) => setBoardingPoint(e.target.value)}
                  placeholder="e.g. Alambagh Bus Stand / Bypass Chauraha"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Drop Point (उतरने का स्थान)
                </label>
                <input
                  type="text"
                  value={dropPoint}
                  onChange={(e) => setDropPoint(e.target.value)}
                  placeholder="e.g. Anand Vihar / ISBT Kashmere Gate"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Passenger Count & Passenger Names */}
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <Users className="w-5 h-5 text-orange-500" />
                <span>3. Passengers (यात्रियों की संख्या: {passengerCount})</span>
              </div>

              {/* Passenger Count Selector */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handlePassengerCountChange(num)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                      passengerCount === num
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {passengers.map((p, idx) => (
                <div
                  key={p.id}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs"
                >
                  <div className="sm:col-span-1 font-bold text-slate-500">
                    #{idx + 1}
                  </div>
                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      required
                      placeholder={`Passenger ${idx + 1} Name`}
                      value={p.name}
                      onChange={(e) => updatePassenger(idx, 'name', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      placeholder="Age"
                      value={p.age}
                      onChange={(e) => updatePassenger(idx, 'age', Number(e.target.value))}
                      className="w-full px-2 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <select
                      value={p.gender}
                      onChange={(e) => updatePassenger(idx, 'gender', e.target.value)}
                      className="w-full px-2 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                    >
                      <option value="male">Male (पुरुष)</option>
                      <option value="female">Female (महिला)</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Fare Calculation & Agent Notes */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold text-base">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>4. Fare & Special Requests</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimated Ticket Fare Per Seat (₹)
                </label>
                <input
                  type="number"
                  min={1}
                  value={estimatedFare}
                  onChange={(e) => setEstimatedFare(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 outline-none text-sm font-semibold bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Seats / Passengers Count
                </label>
                <div className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700">
                  {passengerCount} Seat(s)
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Estimated Booking Amount
                </label>
                <div className="px-3 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-base font-black text-emerald-700">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Special Preference / Notes for SafarGo Desk (e.g. Lower Berth, Window Seat, Specific Bus No.)
              </label>
              <textarea
                rows={2}
                value={agentNotes}
                onChange={(e) => setAgentNotes(e.target.value)}
                placeholder="Prefer lower berth for elderly passenger..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 outline-none text-sm bg-white"
              />
            </div>
          </div>

          {/* Section 5: Advance Online Payment (Mandatory Online Payment) */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 border-2 border-orange-500/40 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-md">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>5. अग्रिम ऑनलाइन भुगतान (Advance Payment)</span>
                    <span className="text-[10px] uppercase font-bold bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded border border-orange-500/30">
                      अनिवार्य
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    SafarGo में टिकट बुक करने से पहले भुगतान होना अनिवार्य है (QR कोड या एजेंट वॉलेट)
                  </p>
                </div>
              </div>

              {/* Payment Mode Selector Tabs */}
              <div className="inline-flex p-1 bg-slate-800 rounded-2xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setPaymentMode('safargo_qr')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    paymentMode === 'safargo_qr'
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>SafarGo QR / UPI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('agent_wallet')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    paymentMode === 'agent_wallet'
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  <span>एजेंट वॉलेट (₹{agentWalletBalance.toFixed(2)})</span>
                </button>
              </div>
            </div>

            {/* Mode 1: SafarGo QR Code / UPI ID */}
            {paymentMode === 'safargo_qr' && (
              <div className="space-y-5 animate-in fade-in">
                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 flex flex-col md:flex-row items-center gap-6">
                  {/* Dynamic or Custom Uploaded QR Code */}
                  <div className="bg-white p-3 rounded-2xl shrink-0 flex flex-col items-center border-2 border-orange-400 shadow-md">
                    <img
                      src={
                        settings.safargo_qr_image_url ||
                        `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                          `upi://pay?pa=${encodeURIComponent(
                            settings.safargo_upi_id || 'safargo.booking@icici'
                          )}&pn=${encodeURIComponent(settings.safargo_payee_name || 'SafarGo Bus')}&am=${totalAmount}&cu=INR&tn=Booking%20Fare`
                        )}`
                      }
                      alt="SafarGo Booking Fare QR"
                      className="w-36 h-36 rounded-lg object-contain"
                    />
                    <span className="text-[11px] font-black text-slate-900 mt-1">
                      Scan to Pay ₹{totalAmount.toLocaleString('en-IN')}
                    </span>
                    {settings.safargo_payee_name && (
                      <span className="text-[10px] font-semibold text-slate-500">
                        {settings.safargo_payee_name}
                      </span>
                    )}
                  </div>

                  {/* Instructions & UPI Copy */}
                  <div className="space-y-3.5 w-full text-xs">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider block">
                        कस्टमर या एजेंट SafarGo UPI पर भुगतान करें:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-white bg-slate-900 px-3 py-2 rounded-xl border border-slate-700 select-all block w-full truncate">
                          {settings.safargo_upi_id || 'safargo.booking@icici'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(settings.safargo_upi_id || 'safargo.booking@icici');
                            setCopiedUpi(true);
                            success('UPI ID Copied', 'पेमेंट ऐप में पेस्ट करें');
                            setTimeout(() => setCopiedUpi(false), 3000);
                          }}
                          className="px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold flex items-center gap-1 transition shrink-0"
                        >
                          {copiedUpi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    {/* GPay, PhonePe, Paytm Quick Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {settings.safargo_phonepe_number && (
                        <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-700 flex items-center justify-between">
                          <div className="truncate">
                            <span className="text-[10px] text-purple-400 font-bold block">PhonePe</span>
                            <span className="font-mono text-white text-[11px] truncate">{settings.safargo_phonepe_number}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(settings.safargo_phonepe_number || '');
                              success('PhonePe Copied', 'PhonePe में पेस्ट करें');
                            }}
                            className="p-1 text-slate-400 hover:text-white"
                            title="Copy PhonePe"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {settings.safargo_gpay_number && (
                        <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-700 flex items-center justify-between">
                          <div className="truncate">
                            <span className="text-[10px] text-blue-400 font-bold block">Google Pay (GPay)</span>
                            <span className="font-mono text-white text-[11px] truncate">{settings.safargo_gpay_number}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(settings.safargo_gpay_number || '');
                              success('GPay Copied', 'GPay में पेस्ट करें');
                            }}
                            className="p-1 text-slate-400 hover:text-white"
                            title="Copy GPay"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {settings.safargo_paytm_number && (
                        <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-700 flex items-center justify-between">
                          <div className="truncate">
                            <span className="text-[10px] text-sky-400 font-bold block">Paytm</span>
                            <span className="font-mono text-white text-[11px] truncate">{settings.safargo_paytm_number}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(settings.safargo_paytm_number || '');
                              success('Paytm Copied', 'Paytm में पेस्ट करें');
                            }}
                            className="p-1 text-slate-400 hover:text-white"
                            title="Copy Paytm"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* WhatsApp 15-Minute Mandate */}
                    <div className="bg-emerald-950/80 border border-emerald-500/60 rounded-xl p-3 flex items-start gap-2.5 text-[11px] text-emerald-200">
                      <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <strong className="text-white block">जरूरी नियम: 15 मिनट टाइमर में WhatsApp पर स्क्रीनशॉट भेजें!</strong>
                        <span>
                          भुगतान करने के बाद नीचे UTR दर्ज करें और <strong>15 मिनट के अंदर SafarGo WhatsApp (+91 {settings.support_whatsapp}) पर भी पेमेंट स्क्रीनशॉट अवश्य भेजें</strong> ताकि सीट तुरंत कन्फर्म की जा सके।
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* UTR Input & File Upload */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200 block">
                      12-अंकों का बैंक UTR / UPI Reference No. <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required={paymentMode === 'safargo_qr'}
                      value={paymentUtr}
                      onChange={(e) => setPaymentUtr(e.target.value.trim())}
                      placeholder="उदा. 429381029384 या UTR-123456"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-mono text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <p className="text-[10px] text-slate-400">Google Pay / PhonePe / Paytm रसीद पर लिखा 12 अंकों का UTR</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200 block">
                      पेमेंट स्क्रीनशॉट अपलोड करें (Optional Proof)
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition">
                        <Upload className="w-4 h-4 text-orange-400" />
                        <span>फोटो चुनें</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => setPaymentScreenshot(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      {paymentScreenshot && (
                        <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> स्क्रीनशॉट संलग्न!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mode 2: Agent Prepaid Wallet Deduction (Min ₹2,000 Model) */}
            {paymentMode === 'agent_wallet' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 block font-medium">आपका वर्तमान एजेंट वॉलेट बैलेंस</span>
                    <span className="text-3xl font-black text-emerald-400">
                      ₹{agentWalletBalance.toFixed(2)}
                    </span>
                    <p className="text-[11px] text-slate-300">
                      टिकट किराया: <strong className="text-white">₹{totalAmount.toLocaleString('en-IN')}</strong>
                    </p>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsWalletModalOpen(true)}
                      className="px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2 active:scale-95"
                    >
                      <Wallet className="w-4 h-4" />
                      <span>वॉलेट रिचार्ज करें (+₹2,000 न्यूनतम)</span>
                    </button>
                    <span className="text-[10px] text-slate-400 font-medium">
                      (एजेंट न्यूनतम ₹2,000 जोड़कर कभी भी तुरंत टिकट बुक कर सकते हैं)
                    </span>
                  </div>
                </div>

                {/* Balance validation alert */}
                {agentWalletBalance >= totalAmount ? (
                  <div className="p-3.5 bg-emerald-950/70 border border-emerald-500/50 rounded-2xl flex items-center justify-between text-xs text-emerald-200">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        पर्याप्त बैलेंस उपलब्ध! बुकिंग सबमिट करते ही ₹{totalAmount.toLocaleString('en-IN')} सीधे वॉलेट से कट जाएंगे।
                      </span>
                    </div>
                    <span className="font-mono font-bold text-emerald-300">
                      बचेगा: ₹{(agentWalletBalance - totalAmount).toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-950/80 border border-amber-500/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-200">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-amber-100 block">अपर्याप्त वॉलेट बैलेंस!</strong>
                        <span>
                          इस टिकट के लिए ₹{totalAmount.toLocaleString('en-IN')} चाहिए, परन्तु वॉलेट में केवल ₹{agentWalletBalance.toFixed(2)} हैं।
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsWalletModalOpen(true)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition shrink-0"
                    >
                      अभी ₹2,000+ जोड़ें
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || (paymentMode === 'agent_wallet' && agentWalletBalance < totalAmount)}
              className="w-full py-4 px-6 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-orange-500/25 flex items-center justify-center gap-3 transition active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-5 h-5" />
              {isSubmitting
                ? 'Saving Booking Request...'
                : paymentMode === 'agent_wallet'
                ? `वॉलेट से ₹${totalAmount.toLocaleString('en-IN')} भुगतान करें एवं सबमिट करें (+ ₹19.34 कमीशन)`
                : 'रिक्वेस्ट सबमिट करें और WhatsApp पर स्क्रीनशॉट भेजें (+ ₹19.34 कमीशन)'}
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              Protected by idempotency control. Submitting begins your 15-minute response window.
            </p>
          </div>
        </div>
      </form>

      {/* WhatsApp Success Modal */}
      {createdBooking && (
        <BookingSuccessModal
          booking={createdBooking}
          onClose={() => setCreatedBooking(null)}
        />
      )}

      {/* Agent Wallet Recharge Modal */}
      {isWalletModalOpen && (
        <WalletRechargeModal
          onClose={() => setIsWalletModalOpen(false)}
        />
      )}
    </div>
  );
};

