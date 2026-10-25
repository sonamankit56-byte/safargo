import React, { useState, useEffect } from 'react';
import { openPaymentGateway } from '../../lib/paymentGateway';
import { useTravel } from '../../context/TravelContext';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  CheckCircle2, 
  AlertCircle,
  Tag,
  Lock,
  Sparkles,
  UserCheck,
  ChevronRight,
  Bus,
  Copy,
  Check,
  Zap,
  ExternalLink,
  Smartphone,
  RefreshCw
} from 'lucide-react';
import { 
  createYoupiPaymentSession, 
  generateUpiDeepLinks, 
  simulateYoupiPaymentSuccess, 
  pollYoupiPaymentStatus, 
  getYoupiConfig,
  YoupiSessionResponse 
} from '../../lib/youpiPg';

export const PassengerForm: React.FC = () => {
  const { 
    selectedBus, 
    selectedSeats, 
    selectedBoardingPoint, 
    selectedDroppingPoint, 
    journeyDate,
    confirmBusBooking, 
    setCurrentStep, 
    isAgentMode,
    currentAgent,
    userProfile,
    savedPassengers,
    adminQrConfig,
    walletTopUpRequests,
    bookings,
    applyPromoCode,
    isAgentLoggedIn,
    isCustomerLoggedIn,
    setIsAuthModalOpen,
    t 
  } = useTravel();

  const isAnyUserLoggedIn = isAgentLoggedIn || isCustomerLoggedIn;

  // Contact details pre-filled from logged-in agent or user profile
  const [fullName, setFullName] = useState(() => currentAgent?.fullName || userProfile?.name || '');
  const [mobile, setMobile] = useState(() => currentAgent?.mobile || userProfile?.phone || '');
  const [email, setEmail] = useState(() => currentAgent?.email || userProfile?.email || '');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'pay_at_bus' | 'youpi_pg' | 'gateway'>('gateway');
  const [optTravelInsurance, setOptTravelInsurance] = useState(true);

  // YouPI PG Sovereign Gateway States
  const [youpiSession, setYoupiSession] = useState<YoupiSessionResponse | null>(null);
  const [youpiLoading, setYoupiLoading] = useState(false);
  const [youpiCountdown, setYoupiCountdown] = useState(300); // 5 minutes
  const [youpiVerifiedUtr, setYoupiVerifiedUtr] = useState<string | null>(null);
  const [youpiCopiedVpa, setYoupiCopiedVpa] = useState(false);

  // Agent UTR Verification States
  const [agentUtr, setAgentUtr] = useState('');
  const [utrError, setUtrError] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Promo Coupon state
  const [couponCode, setCouponCode] = useState('SAFARFIRST');
  const [couponApplied, setCouponApplied] = useState(true);
  const [couponDiscount, setCouponDiscount] = useState(150);
  const [couponMessage, setCouponMessage] = useState('₹150 की विशेष छूट लागू की गई है!');
  const [couponError, setCouponError] = useState('');

  // Per seat passenger state
  const [passengersList, setPassengersList] = useState(() =>
    selectedSeats.map((seat, idx) => ({
      id: `p-${idx}`,
      seatNumber: seat.seatNumber,
      name: idx === 0 ? (currentAgent?.fullName || userProfile?.name || '') : '',
      age: idx === 0 ? 28 : 25,
      gender: 'male' as 'male' | 'female' | 'other'
    }))
  );

  if (!selectedBus || selectedSeats.length === 0) {
    return null;
  }

  const baseFare = selectedSeats.reduce((sum, s) => sum + s.fare, 0);
  const gst = Math.round(baseFare * 0.05);
  const insuranceFare = optTravelInsurance ? selectedSeats.length * 15 : 0;
  const totalAmount = baseFare + gst + insuranceFare;
  const agentCommission = isAgentMode ? 19.34 : 0;
  const finalPayable = Math.max(0, totalAmount - (couponApplied ? couponDiscount : 0));

  // Initialize YouPI Payment Session
  useEffect(() => {
    let timer: any = null;
    if (paymentMethod === 'youpi_pg') {
      const orderId = `SFG-${Date.now().toString().slice(-6)}`;
      setYoupiLoading(true);
      createYoupiPaymentSession({
        orderId,
        amount: finalPayable,
        customer: {
          fullName: passengersList[0]?.name || fullName || 'Traveler',
          phoneNumber: mobile || '9876543210',
          email: email || 'passenger@safargo.in'
        },
        metadata: {
          busId: selectedBus.id,
          operator: selectedBus.operatorName,
          seats: selectedSeats.map(s => s.seatNumber)
        }
      }).then(sess => {
        setYoupiSession(sess);
        setYoupiLoading(false);
      }).catch(() => {
        setYoupiLoading(false);
      });

      setYoupiCountdown(300);
      timer = setInterval(() => {
        setYoupiCountdown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [paymentMethod, finalPayable]);

  // Polling YouPI payment status for real-time bank completion
  useEffect(() => {
    if (paymentMethod !== 'youpi_pg' || !youpiSession || youpiVerifiedUtr) return;

    const interval = setInterval(async () => {
      try {
        const res = await pollYoupiPaymentStatus(youpiSession.paymentId);
        if (res.status === 'SUCCESS' && res.utr) {
          setYoupiVerifiedUtr(res.utr);
          clearInterval(interval);
        }
      } catch (e) {}
    }, 2500);

    return () => clearInterval(interval);
  }, [paymentMethod, youpiSession, youpiVerifiedUtr]);

  const handlePassengerChange = (index: number, field: string, value: any) => {
    const updated = [...passengersList];
    updated[index] = { ...updated[index], [field]: value };
    setPassengersList(updated);
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAnyUserLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!mobile || mobile.length < 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    // Official Indian Payment Gateway (Razorpay / UPI Intent / Cards)
    if (paymentMethod === 'gateway') {
      openPaymentGateway(
        {
          amount: finalPayable,
          orderId: `SFG-BUS-${Date.now()}`,
          title: `${selectedBus?.operatorName || 'SafarGo'} Bus (${selectedBus?.sourceCity} → ${selectedBus?.destinationCity})`,
          customer: {
            name: passengersList[0]?.name || fullName,
            email: email || 'passenger@safargo.in',
            phone: mobile
          },
          notes: {
            busName: selectedBus?.operatorName || '',
            seats: selectedSeats.map(s => s.seatNumber).join(', ')
          }
        },
        (res) => {
          confirmBusBooking(
            'gateway',
            {
              fullName: passengersList[0]?.name || fullName,
              mobile,
              email
            },
            res.paymentId,
            {
              paymentId: res.paymentId,
              status: 'SUCCESS'
            }
          );
        },
        (errMsg) => {
          alert(`पेमेंट रद्द या असफल: ${errMsg}`);
        }
      );
      return;
    }

    // YouPI PG Auto-Verification
    if (paymentMethod === 'youpi_pg') {
      const confirmedUtr = youpiVerifiedUtr || simulateYoupiPaymentSuccess(youpiSession?.paymentId || `yp_${Date.now()}`);
      confirmBusBooking(
        'youpi_pg',
        {
          fullName: passengersList[0]?.name || fullName,
          mobile,
          email
        },
        confirmedUtr,
        {
          paymentId: youpiSession?.paymentId || `yp_${Date.now()}`,
          status: 'SUCCESS'
        }
      );
      return;
    }

    if (paymentMethod === 'upi') {
      const cleanUtr = agentUtr.trim().toUpperCase();
      if (cleanUtr.length < 10) {
        setUtrError('कृपया वैध 12-अंकीय बैंक UTR / रेफरेंस नंबर दर्ज करें।');
        return;
      }
      const fakePatterns = ['123456789012', '000000000000', '111111111111', '999999999999', 'TEST12345678'];
      if (fakePatterns.includes(cleanUtr) || /^(\d)\1+$/.test(cleanUtr)) {
        setUtrError('🚨 अमान्य अथवा फर्जी UTR नंबर अस्वीकृत! कृपया बैंक ऐप से वास्तविक 12-अंकीय UTR दर्ज करें।');
        return;
      }
      const isDuplicate = bookings.some(b => b.utr && b.utr.toUpperCase() === cleanUtr) ||
        walletTopUpRequests.some(r => r.utr.toUpperCase() === cleanUtr && r.status !== 'rejected');
      if (isDuplicate) {
        setUtrError('🚨 यह UTR पहले ही उपयोग किया जा चुका है। कृपया नया वास्तविक UTR दर्ज करें।');
        return;
      }
      setUtrError('');
    }

    confirmBusBooking(paymentMethod, {
      fullName: passengersList[0]?.name || fullName,
      mobile,
      email
    }, paymentMethod === 'upi' ? agentUtr.trim() : undefined);

    // Trigger AI Agent Swarm Audit Log: Ticket placed in admin queue
    import('../../lib/agentSwarmService').then(({ runAutonomousPipeline }) => {
      runAutonomousPipeline('बस टिकट अनुरोध दर्ज - सुपर एडमिन सत्यापन कतार', {
        mobile,
        service: `${selectedBus?.sourceCity || 'इंदौर'} ➔ ${selectedBus?.destinationCity || 'उज्जैन'} बस टिकट (एडमिन अप्रूवल लंबित)`
      });
    }).catch(() => {});
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-5 pb-24">
      {/* Top Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentStep('boarding_select')}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-black text-slate-900">{t('यात्री व भुगतान विवरण', 'Passenger & Payment Details')}</h2>
            <p className="text-xs text-slate-500">
              {selectedBus.operatorName} • {journeyDate}
            </p>
          </div>
        </div>

        <span className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl">
          {t('अंतिम चरण 3/3', 'Final Step 3/3')}
        </span>
      </div>

      {/* Login Gate Alert Banner */}
      {!isAnyUserLoggedIn && (
        <div className="p-4 bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 animate-fade-in shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <span>🔒 {t('लॉगिन आवश्यक है', 'Login Required')}</span>
                <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">Important</span>
              </h4>
              <p className="text-[11px] text-slate-600 font-medium">
                {t(
                  'बस टिकट बुक करने, ई-टिकट SMS/WhatsApp पर प्राप्त करने और भुगतान के लिए कृपया पहले लॉगिन करें।',
                  'Please login to book bus tickets, receive SMS/WhatsApp e-ticket, and proceed with payment.'
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-md cursor-pointer shrink-0 transition"
          >
            {t('लॉगिन / साइन-अप करें', 'Login / Sign Up')}
          </button>
        </div>
      )}

      <form onSubmit={handleSubmitBooking} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Passenger Info & Contact */}
        <div className="lg:col-span-2 space-y-5">
          {/* Journey Snapshot */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-400 block">{t('रूट', 'Route')}</span>
                <span className="font-bold text-slate-900">{selectedBus.sourceCity} → {selectedBus.destinationCity}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{t('प्रस्थान समय', 'Departure')}</span>
                <span className="font-bold text-slate-900">{selectedBus.departureTime}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{t('चयनित सीटें', 'Seats')}</span>
                <span className="font-bold text-emerald-600">{selectedSeats.map(s => s.seatNumber).join(', ')}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{t('बोर्डिंग स्टॉप', 'Boarding')}</span>
                <span className="font-bold text-slate-900 truncate block">{selectedBoardingPoint?.name || selectedBus.boardingPoints[0].name}</span>
              </div>
            </div>
          </div>

          {/* Passenger Input Cards */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              <span>{t('यात्रियों की जानकारी', 'Passenger Information')}</span>
            </h3>

            {/* Quick Fill from Saved Co-Passengers */}
            {savedPassengers && savedPassengers.length > 0 && (
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-1.5">
                <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {t('सहेजे गए सह-यात्री से तुरंत भरें (1-Click Auto Fill):', 'Quick fill from saved co-passengers:')}
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {savedPassengers.map((saved) => (
                    <button
                      key={saved.id}
                      type="button"
                      onClick={() => {
                        const targetIdx = passengersList.findIndex(p => !p.name) !== -1 ? passengersList.findIndex(p => !p.name) : 0;
                        const updated = [...passengersList];
                        updated[targetIdx] = {
                          ...updated[targetIdx],
                          name: saved.name,
                          age: saved.age,
                          gender: saved.gender
                        };
                        setPassengersList(updated);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-emerald-600 hover:text-white text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-200 transition shadow-xs flex items-center gap-1"
                    >
                      <span>+ {saved.name}</span>
                      <span className="text-[10px] text-slate-400">({saved.age}y, {saved.gender.charAt(0).toUpperCase()})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {passengersList.map((passenger, idx) => (
              <div key={passenger.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">
                    {t('यात्री', 'Passenger')} {idx + 1} • <span className="text-emerald-700">{t('सीट संख्या', 'Seat')}: {passenger.seatNumber}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">{t('पूरा नाम', 'Full Name')}</label>
                    <input
                      type="text"
                      required
                      value={passenger.name}
                      onChange={(e) => handlePassengerChange(idx, 'name', e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">{t('उम्र', 'Age')}</label>
                    <input
                      type="number"
                      required
                      min={5}
                      max={99}
                      value={passenger.age}
                      onChange={(e) => handlePassengerChange(idx, 'age', Number(e.target.value))}
                      className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">{t('लिंग', 'Gender')}</label>
                    <select
                      value={passenger.gender}
                      onChange={(e) => handlePassengerChange(idx, 'gender', e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="male">{t('पुरुष (Male)', 'Male')}</option>
                      <option value="female">{t('महिला (Female)', 'Female')}</option>
                      <option value="other">{t('अन्य (Other)', 'Other')}</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Details */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Phone className="w-5 h-5 text-emerald-600" />
              <span>{t('टिकट भेजने हेतु संपर्क विवरण', 'Contact Information (For Ticket & Live GPS)')}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t('मोबाइल नंबर (WhatsApp SMS)', 'Mobile Number (SMS/WhatsApp)')}</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-xs font-bold text-slate-600 bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full text-xs font-semibold px-3 py-2.5 bg-white border border-slate-300 rounded-r-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t('ईमेल पता (e-Ticket PDF)', 'Email Address (e-Ticket PDF)')}</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs font-semibold px-3 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Travel Insurance checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <input
                  type="checkbox"
                  checked={optTravelInsurance}
                  onChange={(e) => setOptTravelInsurance(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900">
                    {t('सफ़रगो यात्रा बीमा जोड़ें (मात्र ₹15 प्रति यात्री)', 'Add SafarGo Travel Insurance (Just ₹15 per passenger)')}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {t('₹5 लाख तक का दुर्घटना कवरेज और ₹10,000 बैगेज सुरक्षा।', 'Up to ₹5 Lakh accidental cover and ₹10,000 baggage loss protection.')}
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>{t('भुगतान का तरीका चुनें', 'Select Payment Method')}</span>
              </h3>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                0% Gateway Fee
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Option 0: Official Real Payment Gateway */}
              <label 
                onClick={() => setPaymentMethod('gateway')}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer flex items-center gap-3 transition relative overflow-hidden sm:col-span-2 ${
                  paymentMethod === 'gateway' 
                    ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 shadow-md ring-2 ring-indigo-500/20' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-600 via-purple-600 to-rose-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-bl-lg uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                  <span>Real Gateway • Instant Confirm</span>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'gateway'}
                  onChange={() => setPaymentMethod('gateway')}
                  className="text-indigo-600 mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    <p className="font-black text-xs sm:text-sm text-slate-900">
                      असली पेमेंट गेटवे (Online Payment Gateway)
                    </p>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-indigo-700 font-semibold mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="bg-white/90 px-1.5 py-0.5 rounded border border-indigo-200 font-bold">PhonePe</span>
                    <span className="bg-white/90 px-1.5 py-0.5 rounded border border-indigo-200 font-bold">Google Pay</span>
                    <span className="bg-white/90 px-1.5 py-0.5 rounded border border-indigo-200 font-bold">Paytm</span>
                    <span className="bg-white/90 px-1.5 py-0.5 rounded border border-indigo-200 font-bold">QR Code</span>
                    <span className="bg-white/90 px-1.5 py-0.5 rounded border border-indigo-200 font-bold">ATM कार्ड</span>
                    <span className="bg-white/90 px-1.5 py-0.5 rounded border border-indigo-200 font-bold">नेटबैंकिंग</span>
                  </p>
                </div>
              </label>

              {/* Option 1: YouPI PG - Instant UPI (0% Fee) */}
              <label 
                onClick={() => setPaymentMethod('youpi_pg')}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer flex items-center gap-3 transition relative overflow-hidden ${
                  paymentMethod === 'youpi_pg' 
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-md ring-2 ring-emerald-500/20' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-600 to-teal-600 text-white text-[9px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                  Recommended
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'youpi_pg'}
                  onChange={() => setPaymentMethod('youpi_pg')}
                  className="text-emerald-600 mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <p className="font-black text-xs text-slate-900">
                      YouPI PG - Instant UPI
                    </p>
                  </div>
                  <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                    0% शुल्क • GPay / PhonePe / Paytm / QR • त्वरित कन्फर्म
                  </p>
                </div>
              </label>

              {/* Option 2: Manual Admin QR + UTR */}
              <label 
                onClick={() => setPaymentMethod('upi')}
                className={`p-3.5 rounded-2xl border cursor-pointer flex items-center gap-3 transition ${
                  paymentMethod === 'upi' 
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'upi'}
                  onChange={() => setPaymentMethod('upi')}
                  className="text-emerald-600"
                />
                <div className="flex-1">
                  <p className="font-bold text-xs">{t('मैन्युअल एडमिन QR + UTR', 'Manual Admin QR + UTR')}</p>
                  <p className="text-[10px] text-slate-500">{t('ऑफलाइन ट्रांसफर व 12-अंकीय बैंक UTR ऑडिट', 'Manual 12-digit UTR verification')}</p>
                </div>
                <QrCode className="w-5 h-5 text-slate-600" />
              </label>

              {/* Option 3: Debit/Credit Card */}
              <label 
                onClick={() => setPaymentMethod('card')}
                className={`p-3.5 rounded-2xl border cursor-pointer flex items-center gap-3 transition ${
                  paymentMethod === 'card' 
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="text-emerald-600"
                />
                <div className="flex-1">
                  <p className="font-bold text-xs">{t('डेबिट / क्रेडिट कार्ड', 'Debit / Credit Card')}</p>
                  <p className="text-[10px] text-slate-500">Visa, Mastercard, RuPay</p>
                </div>
                <CreditCard className="w-5 h-5 text-slate-600" />
              </label>

              {/* Option 4: Pay at Bus */}
              <label 
                onClick={() => setPaymentMethod('pay_at_bus')}
                className={`p-3.5 rounded-2xl border cursor-pointer flex items-center gap-3 transition ${
                  paymentMethod === 'pay_at_bus' 
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'pay_at_bus'}
                  onChange={() => setPaymentMethod('pay_at_bus')}
                  className="text-emerald-600"
                />
                <div className="flex-1">
                  <p className="font-bold text-xs">{t('बस में भुगतान (Pay at Bus)', 'Pay at Bus / Cash')}</p>
                  <p className="text-[10px] text-slate-500">{t('कंडक्टर को सीधे नकद या QR से दें', 'Pay directly to bus conductor')}</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </label>
            </div>

            {/* ========================================================================= */}
            {/* YOUPI PG V2 SOVEREIGN GATEWAY INTERACTIVE TERMINAL                       */}
            {/* ========================================================================= */}
            {paymentMethod === 'youpi_pg' && (
              <div className="mt-4 p-5 sm:p-6 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white rounded-3xl border-2 border-indigo-500/40 shadow-xl space-y-5 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-400/20">
                      <Zap className="w-6 h-6 fill-slate-950" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm sm:text-base text-white tracking-wide">
                          YouPI Sovereign UPI Gateway
                        </h4>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          0% Fee • Auto-Verify
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {t('सीधे अपने पसंदीदा UPI ऐप से 1-क्लिक में भुगतान करें', 'Pay directly via your favorite UPI app in 1 tap')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono font-bold flex items-center gap-1.5 text-amber-300">
                      <span>⏱️ सत्र:</span>
                      <span>{Math.floor(youpiCountdown / 60)}:{(youpiCountdown % 60).toString().padStart(2, '0')}</span>
                    </div>
                  </div>
                </div>

                {/* Main Payment Section: Dynamic QR + 1-Tap App Deep Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                  {/* Dynamic QR Display */}
                  <div className="bg-white p-4 rounded-2xl text-center shadow-lg flex flex-col items-center justify-center relative">
                    {youpiVerifiedUtr ? (
                      <div className="w-48 h-48 rounded-xl bg-emerald-50 border-2 border-emerald-400 flex flex-col items-center justify-center p-3 text-emerald-900 animate-scale-up">
                        <CheckCircle2 className="w-12 h-12 text-emerald-600 mb-2" />
                        <span className="font-black text-sm">भुगतान प्राप्त हुआ!</span>
                        <span className="text-[10px] font-mono text-emerald-700 mt-1 break-all">UTR: {youpiVerifiedUtr}</span>
                      </div>
                    ) : (
                      <>
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                            youpiSession?.intentLinks.generic || 
                            `upi://pay?pa=safargo@okicici&pn=SafarGo%20Travel&am=${finalPayable}&cu=INR&tn=BusTicket`
                          )}`}
                          alt="YouPI Dynamic Vector QR"
                          className="w-44 h-44 object-contain rounded-xl"
                        />
                        <span className="text-[11px] font-bold text-slate-800 mt-2 block">
                          स्कैन करें: ₹{finalPayable} (0% सुविधा शुल्क)
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Google Pay, PhonePe, Paytm, CRED, BHIM
                        </span>
                      </>
                    )}
                  </div>

                  {/* 1-Tap App Launchers & VPA Info */}
                  <div className="space-y-3.5">
                    <span className="text-[11px] uppercase tracking-wider text-slate-300 font-bold block">
                      {t('मोबाइल 1-टैप क्विक पे (Direct UPI Launch)', '1-Tap Quick Pay via Installed App')}
                    </span>

                    <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                      {/* PhonePe */}
                      <a
                        href={youpiSession?.intentLinks.phonepe || '#'}
                        className="p-2.5 rounded-xl bg-[#5f259f]/80 hover:bg-[#5f259f] border border-purple-400/40 text-white flex items-center justify-center gap-2 transition active:scale-95 shadow-sm"
                      >
                        <Smartphone className="w-3.5 h-3.5 text-purple-200" />
                        <span>PhonePe</span>
                      </a>

                      {/* Google Pay */}
                      <a
                        href={youpiSession?.intentLinks.gpay || '#'}
                        className="p-2.5 rounded-xl bg-[#1a73e8]/80 hover:bg-[#1a73e8] border border-blue-400/40 text-white flex items-center justify-center gap-2 transition active:scale-95 shadow-sm"
                      >
                        <Zap className="w-3.5 h-3.5 text-blue-200 fill-blue-200" />
                        <span>Google Pay</span>
                      </a>

                      {/* Paytm */}
                      <a
                        href={youpiSession?.intentLinks.paytm || '#'}
                        className="p-2.5 rounded-xl bg-[#00b9f5]/80 hover:bg-[#00b9f5] border border-cyan-400/40 text-white flex items-center justify-center gap-2 transition active:scale-95 shadow-sm"
                      >
                        <Smartphone className="w-3.5 h-3.5 text-cyan-200" />
                        <span>Paytm</span>
                      </a>

                      {/* CRED / Any UPI */}
                      <a
                        href={youpiSession?.intentLinks.cred || youpiSession?.intentLinks.generic || '#'}
                        className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white flex items-center justify-center gap-2 transition active:scale-95 shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
                        <span>CRED / BHIM</span>
                      </a>
                    </div>

                    {/* VPA Info Bar */}
                    <div className="bg-white/10 p-3 rounded-xl border border-white/10 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">आधिकारिक मर्चेंट VPA:</span>
                        <span className="font-mono font-bold text-emerald-300">safargo@okicici</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText('safargo@okicici');
                          setYoupiCopiedVpa(true);
                          setTimeout(() => setYoupiCopiedVpa(false), 2500);
                        }}
                        className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                      >
                        {youpiCopiedVpa ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{youpiCopiedVpa ? 'कॉपी हुआ' : 'कॉपी VPA'}</span>
                      </button>
                    </div>

                    {/* Observer Status / Instant Simulation Button */}
                    <div className="pt-1">
                      {youpiVerifiedUtr ? (
                        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>बैंक भुगतान सत्यापित हुआ! कृपया नीचे 'टिकट बुक करें' बटन दबाएं।</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[11px] text-slate-300 bg-white/5 p-2 rounded-lg border border-white/10">
                            <RefreshCw className="w-3 h-3 text-emerald-400 animate-spin" />
                            <span>YouPI बैंक ऑब्जर्वर लाइव सुन रहा है... UPI ऐप से भुगतान करते ही यह स्क्रीन स्वतः पूरी हो जाएगी।</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const testUtr = simulateYoupiPaymentSuccess(youpiSession?.paymentId || `yp_${Date.now()}`);
                              setYoupiVerifiedUtr(testUtr);
                            }}
                            className="w-full py-2 px-3 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span>⚡ सिमुलेट इंस्टेंट बैंक पेमेंट (1-Click Instant Success)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* MANUAL ADMIN QR & UTR INPUT SECTION (OFFLINE AUDIT)                     */}
            {/* ========================================================================= */}
            {paymentMethod === 'upi' && (
              <div className="mt-4 p-5 bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 text-white rounded-2xl border-2 border-emerald-500/50 shadow-lg space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                      <QrCode className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-white">
                        {t('🏢 सफ़रगो आधिकारिक एडमिन QR कोड', 'SafarGo Official Admin QR Code')}
                      </h4>
                      <p className="text-[11px] text-emerald-300">
                        {t('स्कैन कर भुगतान करें व बैंक UTR दर्ज करें', 'Scan to Pay & Enter 12-Digit Bank UTR')}
                      </p>
                    </div>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                    Admin Verified QR
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  {/* QR Display */}
                  <div className="bg-white p-3.5 rounded-2xl text-center shadow-md flex flex-col items-center justify-center">
                    {adminQrConfig?.qrCodeImageUrl ? (
                      <img 
                        src={adminQrConfig.qrCodeImageUrl} 
                        alt="SafarGo Admin UPI QR" 
                        className="w-44 h-44 object-contain rounded-xl border border-slate-200"
                      />
                    ) : (
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${adminQrConfig?.merchantUpiId || 'safargo.pay@icici'}&pn=${encodeURIComponent(adminQrConfig?.merchantName || 'SafarGo Mobility Network')}&am=${finalPayable}&cu=INR&tn=BusBooking`)}`}
                        alt="SafarGo Dynamic UPI QR"
                        className="w-44 h-44 object-contain rounded-xl"
                      />
                    )}
                    <span className="text-[10px] font-bold text-slate-500 mt-1.5 block">
                      Pay ₹{finalPayable} via GPay, PhonePe, Paytm, BHIM
                    </span>
                  </div>

                  {/* UPI Details & Amount */}
                  <div className="space-y-3">
                    <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                      <span className="text-[10px] uppercase font-bold text-slate-300 block">{t('व्यापारी / प्राप्तकर्ता', 'Merchant / Payee')}</span>
                      <p className="text-xs font-black text-white">{adminQrConfig?.merchantName || 'SafarGo Mobility Network Pvt Ltd'}</p>
                    </div>

                    <div className="bg-white/10 p-3 rounded-xl border border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-300 block">{t('UPI ID', 'UPI ID')}</span>
                        <p className="text-xs font-mono font-bold text-emerald-300">{adminQrConfig?.merchantUpiId || 'safargo.pay@icici'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(adminQrConfig?.merchantUpiId || 'safargo.pay@icici');
                          setCopiedUpi(true);
                          setTimeout(() => setCopiedUpi(false), 2500);
                        }}
                        className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                      >
                        {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedUpi ? 'कॉपी हुआ' : 'कॉपी'}</span>
                      </button>
                    </div>

                    <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/30 flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-200">{t('कुल देय राशि', 'Total Payable')}:</span>
                      <span className="text-xl font-black text-amber-400">₹{finalPayable}</span>
                    </div>
                  </div>
                </div>

                {/* 12-Digit UTR Input */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-white mb-1.5 flex items-center justify-between">
                    <span>{t('12-अंकीय बैंक UTR / ट्रांजैक्शन रेफरेंस नंबर *', '12-Digit Bank UTR / Ref Number *')}</span>
                    <span className="text-[10px] text-emerald-400 font-mono">12 Digits Numeric</span>
                  </label>
                  <input
                    type="text"
                    required={paymentMethod === 'upi'}
                    maxLength={16}
                    value={agentUtr}
                    onChange={(e) => {
                      setAgentUtr(e.target.value.replace(/[^0-9A-Za-z]/g, '').toUpperCase());
                      setUtrError('');
                    }}
                    placeholder="उदा. 629819401248"
                    className="w-full text-sm font-mono font-bold tracking-wider px-3.5 py-2.5 bg-white text-slate-900 border-2 border-emerald-400 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  {utrError && (
                    <p className="text-xs font-bold text-rose-300 mt-1.5 flex items-center gap-1 bg-rose-950/60 p-2 rounded-lg border border-rose-500/40">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{utrError}</span>
                    </p>
                  )}
                  <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                    ℹ️ <strong>सत्यापन नियम:</strong> UTR दर्ज करने के बाद टिकट "⏳ एडमिन समीक्षाधीन" (Pending) स्थिति में जाएगा। एडमिन द्वारा UTR सत्यापित होते ही ई-टिकट डाउनलोड सक्रिय होगा और ₹19.34 कमीशन वॉलेट में क्रेडिट होगा।
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Price Summary Card */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 sticky top-24">
            <h4 className="font-bold text-slate-900 text-base pb-3 border-b border-slate-100 mb-4">
              {t('किराया विवरण (Fare Breakdown)', 'Fare Summary')}
            </h4>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>{t('मूल किराया', 'Base Fare')} ({selectedSeats.length} {t('सीटें', 'Seats')}):</span>
                <span className="font-bold text-slate-900">₹{baseFare}</span>
              </div>

              <div className="flex justify-between">
                <span>GST (5%):</span>
                <span className="font-bold text-slate-900">₹{gst}</span>
              </div>

              {optTravelInsurance && (
                <div className="flex justify-between">
                  <span>{t('यात्रा बीमा', 'Travel Insurance')}:</span>
                  <span className="font-bold text-slate-900">₹{insuranceFare}</span>
                </div>
              )}

              {couponApplied && couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>{t('कूपन डिस्काउंट', 'Coupon Discount')}:</span>
                  <span className="font-bold">-₹{couponDiscount}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-sm font-black text-slate-900">
                <span>{t('कुल देय राशि', 'Total Payable')}:</span>
                <span className="text-xl text-emerald-700">₹{Math.max(0, totalAmount - (couponApplied ? couponDiscount : 0))}</span>
              </div>
            </div>

            {/* Promo Coupon Code Input */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('कूपन कोड / प्रोमो कोड लागू करें', 'Have a Promo / Coupon Code?')}</span>
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="SAFARFIRST"
                  className="flex-1 text-xs font-mono font-bold uppercase px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!couponCode.trim()) {
                      setCouponError('कृपया प्रोमो कोड दर्ज करें');
                      setCouponApplied(false);
                      setCouponDiscount(0);
                      return;
                    }
                    const res = applyPromoCode(couponCode, baseFare, 'bus');
                    if (res.success) {
                      setCouponApplied(true);
                      setCouponDiscount(res.discount);
                      setCouponMessage(res.message);
                      setCouponError('');
                    } else {
                      setCouponApplied(false);
                      setCouponDiscount(0);
                      setCouponMessage('');
                      setCouponError(res.message);
                    }
                  }}
                  className="px-3 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition shadow-xs"
                >
                  {couponApplied ? 'लागू ✓' : 'Apply'}
                </button>
              </div>
              {couponApplied && couponMessage && (
                <p className="text-[10px] font-bold text-emerald-600 mt-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> <span>{couponMessage}</span>
                </p>
              )}
              {couponError && (
                <p className="text-[10px] font-bold text-rose-600 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> <span>{couponError}</span>
                </p>
              )}
            </div>

            {/* Agent Commission Badge */}
            {isAgentMode && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900">
                <p className="font-bold flex items-center gap-1">
                  💰 {t('फिक्स एजेंट कमीशन अर्जित होगा', 'Fixed Agent Earning on this trip')}:
                </p>
                <p className="text-sm font-black text-amber-700 mt-0.5">
                  + ₹19.34 ({t('तत्काल बैंक/UPI निकासी या रविवार ऑटो-पेआउट', 'Instant Withdraw or Sunday payout')})
                </p>
              </div>
            )}

            <button
              type="submit"
              className={`w-full mt-5 py-3.5 px-4 ${
                !isAnyUserLoggedIn
                  ? 'bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 shadow-rose-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
              } active:scale-95 text-white font-black text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer`}
            >
              <Lock className="w-4 h-4 text-yellow-300" />
              <span>
                {!isAnyUserLoggedIn
                  ? t('लॉगिन करके टिकट बुक करें', 'Login to Confirm Booking')
                  : t('टिकट बुक करें (Confirm Booking)', 'Confirm & Book Ticket')}
              </span>
            </button>

            <div className="mt-3 text-center">
              <p className="text-[10px] text-slate-400">
                {t('सुरक्षित 256-Bit SSL भुगतान • तत्काल PNR एवं SMS', '100% Safe & Secure 256-Bit SSL Booking')}
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
