import React, { useState } from 'react';
import { useTravel } from '../../context/TravelContext';
import { TravelBooking, SupportTicket, AgentReferral } from '../../types/travel';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Printer, 
  XCircle, 
  CheckCircle2, 
  AlertCircle, 
  Bus, 
  Building2, 
  Car, 
  PhoneCall, 
  X,
  Compass,
  Ticket,
  HelpCircle,
  Share2,
  Gift,
  Copy,
  Check,
  Plus,
  Send,
  MessageSquare,
  Sparkles,
  Users,
  Award,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Lock,
  Wallet
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const MyTripsScreen: React.FC = () => {
  const { 
    bookings, 
    cancelBooking, 
    setActiveService, 
    setCurrentStep, 
    currentAgent,
    userProfile,
    supportTickets,
    createSupportTicket,
    closeSupportTicket,
    resolveSupportTicket,
    agentReferrals,
    creditReferralBonus,
    isAgentLoggedIn,
    setIsAuthModalOpen,
    t 
  } = useTravel();

  // Main Section Switcher: Bookings vs Support Tickets vs Refer & Earn
  const [mainTab, setMainTab] = useState<'bookings' | 'support' | 'refer'>('bookings');

  // Bookings Filter: All | Confirmed/Success | Pending | Cancelled
  const [bookingFilter, setBookingFilter] = useState<'all' | 'confirm' | 'pending' | 'cancel'>('all');

  // Live GPS Route Tracker Modal
  const [activeTrackingBooking, setActiveTrackingBooking] = useState<TravelBooking | null>(null);

  // Support Ticket States
  const [ticketFilter, setTicketFilter] = useState<'all' | 'pending' | 'resolved' | 'closed'>('all');
  const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState(false);
  const [ticketPnr, setTicketPnr] = useState('');
  const [ticketCategory, setTicketCategory] = useState<SupportTicket['category']>('bus_booking');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketToast, setTicketToast] = useState('');

  // Refer & Earn States
  const [copiedLink, setCopiedLink] = useState(false);
  const refCode = currentAgent?.id || 'SFG-AGENT-2026-9041';
  const referralUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/?ref=${encodeURIComponent(refCode)}`
    : `http://54.206.67.134/?ref=${encodeURIComponent(refCode)}`;

  const totalReferralEarnings = agentReferrals.reduce((sum, r) => sum + r.totalEarned, 0);
  const verifiedCount = agentReferrals.filter(r => r.isVerified).length;
  const fiveBookingsCount = agentReferrals.filter(r => r.completedBookings >= 5).length;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleShareWhatsApp = () => {
    const text = `नमस्ते! SafarGo Travel Super App पर एजेंट पार्टनर बनें और हर बस/होटल टिकट बुकिंग पर फ्लैट ₹19.34 फिक्स कमीशन पाएं। 24x7 तत्काल बैंक विथड्रॉल।\n\nमेरे आधिकारिक रेफरल लिंक से 5-Step रजिस्ट्रेशन करें:\n${referralUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) {
      alert('कृपया विषय और समस्या का विवरण भरें।');
      return;
    }

    createSupportTicket({
      bookingPnr: ticketPnr || undefined,
      category: ticketCategory,
      subject: ticketSubject.trim(),
      description: ticketDescription.trim()
    });

    confetti({ particleCount: 60, spread: 60, origin: { y: 0.5 } });
    setTicketToast('✅ आपका सपोर्ट टिकट सफलतापूर्वक दर्ज हो गया है! हमारी टीम शीघ्र समीक्षा करेगी।');
    setTimeout(() => setTicketToast(''), 5000);

    setTicketPnr('');
    setTicketSubject('');
    setTicketDescription('');
    setIsCreateTicketModalOpen(false);
  };

  // Filter Bookings
  const filteredBookings = bookings.filter(b => {
    if (bookingFilter === 'confirm') return b.status === 'confirmed' || b.status === 'boarding_soon' || b.status === 'completed';
    if (bookingFilter === 'pending') return b.status === 'pending';
    if (bookingFilter === 'cancel') return b.status === 'cancelled';
    return true;
  });

  // Filter Support Tickets
  const filteredTickets = supportTickets.filter(t => {
    if (ticketFilter === 'pending') return t.status === 'pending';
    if (ticketFilter === 'resolved') return t.status === 'resolved';
    if (ticketFilter === 'closed') return t.status === 'closed';
    return true;
  });

  if (!isAgentLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12 px-4 animate-fade-in text-center">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 space-y-5">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-50 to-rose-50 border border-slate-200 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8 text-rose-600" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 px-3 py-1 rounded-full border border-rose-200">
              लॉगिन आवश्यक है • Login Required
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-3">
              {t('अपनी बुकिंग्स देखने के लिए लॉगिन करें', 'Login to View Your Bookings')}
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {t(
                'आपकी सभी बस टिकट, लाइव GPS ट्रैकिंग, और रिफंड स्टेटस आपके मोबाइल अकाउंट से सुरक्षित रूप से जुड़े हुए हैं।',
                'Your bus tickets, live GPS tracking, and refunds are securely linked to your account.'
              )}
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{t('लॉगिन / साइन-अप करें', 'Login / Sign Up Now')}</span>
            </button>
            <button
              onClick={() => setActiveService('bus')}
              className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 font-bold transition cursor-pointer"
            >
              {t('होम पेज पर वापस जाएं', 'Back to Home')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28 space-y-6">
      {/* Toast Notification */}
      {ticketToast && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-400 text-emerald-950 text-xs sm:text-sm font-bold rounded-2xl shadow-md flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{ticketToast}</span>
          </div>
          <button onClick={() => setTicketToast('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Top Header Strip */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
            <Ticket className="w-3.5 h-3.5 text-rose-600" />
            SafarGo Booking & Service Desk
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{t('मेरी बुकिंग व सेवा केंद्र', 'My Bookings & Help Desk')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t(
              'अपनी सभी बस व होटल बुकिंग्स प्रबंधित करें, सपोर्ट टिकट दर्ज करें, या एजेंट रेफर करके ₹60 प्रति एजेंट कमाएं।',
              'Manage your bus bookings, create customer support tickets, or earn ₹60 per agent referral.'
            )}
          </p>
        </div>

        <button
          onClick={() => {
            setActiveService('bus');
            setCurrentStep('search');
          }}
          className="self-start sm:self-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition active:scale-95 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{t('नई बुकिंग करें', 'Book New Ticket')}</span>
        </button>
      </div>

      {/* Main 3 Section Tabs Switcher */}
      <div className="bg-slate-200/80 p-1.5 rounded-2xl flex flex-wrap gap-1 text-xs font-bold border border-slate-300">
        <button
          onClick={() => setMainTab('bookings')}
          className={`flex-1 py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 ${
            mainTab === 'bookings'
              ? 'bg-white text-slate-900 shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Ticket className="w-4 h-4 text-emerald-600" />
          <span>{t('मेरी बुकिंग (My Bookings)', 'My Bookings')}</span>
          <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-full font-mono">{bookings.length}</span>
        </button>

        <button
          onClick={() => setMainTab('support')}
          className={`flex-1 py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 ${
            mainTab === 'support'
              ? 'bg-white text-slate-900 shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-indigo-600" />
          <span>{t('सपोर्ट टिकट (Help Desk)', 'Support Tickets')}</span>
          <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.2 rounded-full font-mono">
            {supportTickets.filter(t => t.status === 'pending').length}
          </span>
        </button>

        <button
          onClick={() => setMainTab('refer')}
          className={`flex-1 py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 ${
            mainTab === 'refer'
              ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-md font-black'
              : 'text-slate-700 hover:text-slate-950'
          }`}
        >
          <Gift className="w-4 h-4 text-slate-950" />
          <span>{t('🎁 रेफर एवं कमाएं (Refer & Earn)', 'Refer & Earn')}</span>
          <span className="text-[10px] bg-white/40 text-slate-950 px-1.5 py-0.2 rounded-full font-mono font-black">₹60/agent</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. MY BOOKINGS VIEW (CONFIRM / PENDING / CANCEL FILTERS)                   */}
      {/* ========================================================================= */}
      {mainTab === 'bookings' && (
        <div className="space-y-4">
          {/* Status Filter Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              {[
                { id: 'all', label: t('सभी बुकिंग', 'All Bookings'), count: bookings.length },
                { id: 'confirm', label: t('✅ कन्फर्म (Success)', 'Confirmed'), count: bookings.filter(b => b.status === 'confirmed' || b.status === 'boarding_soon' || b.status === 'completed').length },
                { id: 'pending', label: t('⏳ पेंडिंग (Pending)', 'Pending'), count: bookings.filter(b => b.status === 'pending').length },
                { id: 'cancel', label: t('❌ रद्द (Cancelled)', 'Cancelled'), count: bookings.filter(b => b.status === 'cancelled').length }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setBookingFilter(f.id as any)}
                  className={`py-1.5 px-3 rounded-lg transition flex items-center gap-1.5 ${
                    bookingFilter === f.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className="text-[10px] bg-slate-200/70 text-slate-700 px-1.5 py-0.2 rounded-full font-mono">{f.count}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setTicketCategory('bus_booking');
                setIsCreateTicketModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-indigo-400 text-indigo-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t('बुकिंग समस्या सहायता', 'Need Help with a Booking?')}</span>
            </button>
          </div>

          {/* Bookings List Cards */}
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
              <Bus className="w-16 h-16 mx-auto text-slate-300" />
              <h3 className="text-lg font-bold text-slate-800">{t('इस फ़िल्टर में कोई बुकिंग नहीं मिली', 'No Bookings Found in this filter')}</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {t('अपनी पसंदीदा बस या होटल टिकट अभी सबसे कम किराए पर बुक करें।', 'Book your verified bus ticket with 100% money-back guarantee!')}
              </p>
              <button
                onClick={() => {
                  setActiveService('bus');
                  setCurrentStep('search');
                }}
                className="px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition shadow-md"
              >
                {t('बस टिकट बुक करें', 'Book Bus Ticket')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => {
                const isBus = booking.bookingType === 'bus';
                const isHotel = booking.bookingType === 'hotel';
                const isCancelled = booking.status === 'cancelled';
                const isPending = booking.status === 'pending';

                return (
                  <div
                    key={booking.id}
                    className={`bg-white rounded-3xl border transition shadow-sm overflow-hidden ${
                      isCancelled
                        ? 'border-red-200 opacity-75 bg-red-50/10'
                        : isPending
                        ? 'border-amber-300 bg-amber-50/10'
                        : 'border-slate-200 hover:border-emerald-500 hover:shadow-md'
                    }`}
                  >
                    {/* Top Status Strip */}
                    <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800">
                          PNR: <span className="text-emerald-700 font-black">{booking.pnr}</span>
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">{t('यात्रा तिथि', 'Travel Date')}: <strong>{booking.travelDate}</strong></span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {booking.utr && (
                          <span className="bg-slate-100 text-slate-700 font-mono font-bold text-[10px] px-2 py-0.5 rounded border border-slate-200">
                            UTR: {booking.utr}
                          </span>
                        )}
                        {isCancelled ? (
                          <span className="bg-red-100 text-red-800 font-bold px-2.5 py-0.5 rounded-full text-[11px] border border-red-200 flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-red-600" /> {t('रद्द किया गया (Cancelled)', 'Cancelled')}
                          </span>
                        ) : isPending ? (
                          <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full text-[11px] border border-amber-200 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600 animate-pulse" /> {t('एडमिन समीक्षाधीन (Pending)', 'Admin Pending')}
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full text-[11px] border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {t('कन्फर्म / सफल (Confirmed)', 'Confirmed')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Booking Content Body */}
                    <div className="p-5">
                      {isBus && booking.busDetails && (
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <Bus className="w-5 h-5 text-emerald-600" />
                                <h3 className="font-bold text-slate-900 text-base">{booking.busDetails.bus.operatorName}</h3>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {booking.busDetails.bus.sourceCity} → {booking.busDetails.bus.destinationCity} • {booking.busDetails.bus.busType}
                              </p>
                            </div>

                            <div className="text-left sm:text-right">
                              <span className="text-xl font-black text-slate-900">₹{booking.totalAmount}</span>
                              <span className="text-[11px] text-slate-400 block">{t('कुल भुगतान किया गया', 'Total Paid')}</span>
                            </div>
                          </div>

                          {/* Stops & Seats */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs">
                            <div>
                              <span className="text-slate-400 block font-medium">{t('बोर्डिंग स्टॉप', 'Boarding Stop')}</span>
                              <span className="font-bold text-slate-900 block truncate">{booking.busDetails.boardingPoint.name}</span>
                              <span className="text-emerald-700 font-semibold">{booking.busDetails.boardingPoint.time}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-medium">{t('ड्रॉपिंग स्टॉप', 'Dropping Stop')}</span>
                              <span className="font-bold text-slate-900 block truncate">{booking.busDetails.droppingPoint.name}</span>
                              <span className="text-indigo-700 font-semibold">{booking.busDetails.droppingPoint.time}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-medium">{t('सीटें व यात्री', 'Seats & Passenger')}</span>
                              <span className="font-black text-emerald-600 block">{booking.busDetails.selectedSeats.join(', ')}</span>
                              <span className="text-slate-600 truncate block">{booking.passengerDetails.fullName}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {isHotel && booking.hotelDetails && (
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-indigo-600" />
                                <h3 className="font-bold text-slate-900 text-base">{booking.hotelDetails.hotel.name}</h3>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {booking.hotelDetails.hotel.city} • {booking.hotelDetails.roomType}
                              </p>
                            </div>

                            <div className="text-right">
                              <span className="text-xl font-black text-slate-900">₹{booking.totalAmount}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions Toolbar */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {!isCancelled && isBus && !isPending && (
                            <button
                              type="button"
                              onClick={() => setActiveTrackingBooking(booking)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/30 active:scale-95"
                            >
                              <Navigation className="w-3.5 h-3.5 animate-pulse" />
                              <span>{t('लाइव GPS बस ट्रैक करें', 'Track Live GPS Bus')}</span>
                            </button>
                          )}

                          {isPending ? (
                            <button
                              type="button"
                              disabled
                              className="px-3.5 py-2 bg-amber-50 text-amber-800 border border-amber-300 font-bold text-xs rounded-xl cursor-not-allowed flex items-center gap-1.5 opacity-90 shadow-xs"
                              title="🔒 एडमिन द्वारा UTR व टिकट सत्यापन के पश्चात ई-टिकट डाउनलोड अनलॉक होगा"
                            >
                              <Lock className="w-3.5 h-3.5 text-amber-600" />
                              <span>{t('🔒 ई-टिकट लॉक (समीक्षाधीन)', '🔒 e-Ticket Locked (Pending)')}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => window.print()}
                              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5 active:scale-95 shadow-xs"
                            >
                              <Printer className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{t('ई-टिकट डाउनलोड / प्रिंट', 'Download / Print e-Ticket')}</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setTicketPnr(booking.pnr);
                              setTicketSubject(`समस्या टिकट - PNR ${booking.pnr}`);
                              setTicketCategory(isBus ? 'bus_booking' : 'hotel_booking');
                              setIsCreateTicketModalOpen(true);
                            }}
                            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-xl transition flex items-center gap-1.5 border border-indigo-200"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>{t('सपोर्ट टिकट बनाएं', 'Raise Support Ticket')}</span>
                          </button>
                        </div>

                        {!isCancelled && (
                          <button
                            type="button"
                            onClick={() => cancelBooking(booking.pnr)}
                            className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
                          >
                            {t('टिकट रद्द करें (Cancel Ticket)', 'Cancel Ticket & Refund')}
                          </button>
                        )}
                      </div>

                      {isPending && (
                        <div className="mt-3.5 p-3 bg-amber-50/90 rounded-xl border border-amber-300 text-xs text-amber-900 flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div className="leading-relaxed">
                            <span className="font-bold block">🔒 एडमिन समीक्षाधीन (Verification in Progress)</span>
                            <span className="text-[11px] text-amber-800">
                              यह टिकट सुपर एडमिन समीक्षा में है। बैंक UTR (<strong>{booking.utr || 'जांच जारी'}</strong>) सत्यापित होते ही ई-टिकट डाउनलोड बटन स्वतः सक्रिय होगा।
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SUPPORT TICKETS SYSTEM VIEW                                            */}
      {/* ========================================================================= */}
      {mainTab === 'support' && (
        <div className="space-y-6">
          {/* Support Ticket Header & CTA */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-indigo-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                24x7 Customer & Agent Resolution Desk
              </div>
              <h3 className="text-xl font-black">सफ़रगो सहायता एवं सपोर्ट टिकट केंद्र</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-lg">
                बुकिंग, रिफंड, बस ऑपरेटर शिकायत या वॉलेट से संबंधित कोई भी समस्या हो, तुरंत टिकट दर्ज करें। हमारी समर्पित टीम 15 मिनट में समाधान करती है।
              </p>
            </div>

            <button
              onClick={() => {
                setTicketPnr('');
                setTicketSubject('');
                setTicketDescription('');
                setIsCreateTicketModalOpen(true);
              }}
              className="px-5 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-400/20 transition flex items-center justify-center gap-2 self-start sm:self-auto active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{t('➕ नया टिकट बनाएं (Create Ticket)', 'Create New Ticket')}</span>
            </button>
          </div>

          {/* Ticket Filter Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'all', label: t('सभी टिकट', 'All Tickets'), count: supportTickets.length },
              { id: 'pending', label: t('⏳ पेंडिंग टिकट (Pending)', 'Pending'), count: supportTickets.filter(t => t.status === 'pending').length },
              { id: 'resolved', label: t('✅ समाधानित (Resolved)', 'Resolved'), count: supportTickets.filter(t => t.status === 'resolved').length },
              { id: 'closed', label: t('🔒 बंद (Closed)', 'Closed'), count: supportTickets.filter(t => t.status === 'closed').length }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setTicketFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  ticketFilter === f.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <span>{f.label}</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-mono">{f.count}</span>
              </button>
            ))}
          </div>

          {/* Tickets Cards List */}
          {filteredTickets.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
              <MessageSquare className="w-14 h-14 mx-auto text-slate-300" />
              <h4 className="font-bold text-slate-800 text-base">इस श्रेणी में कोई टिकट नहीं है</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                यदि आपको किसी बुकिंग, रिफंड या वॉलेट में कोई समस्या है, तो आप ऊपर दिए गए बटन से नया टिकट बना सकते हैं।
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map(ticket => (
                <div
                  key={ticket.id}
                  className={`bg-white rounded-3xl p-5 sm:p-6 shadow-sm border transition-all space-y-4 ${
                    ticket.status === 'pending'
                      ? 'border-amber-300 bg-amber-50/10'
                      : ticket.status === 'resolved'
                      ? 'border-emerald-300 bg-emerald-50/10'
                      : 'border-slate-200 bg-slate-50/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs text-white shadow-sm ${
                        ticket.status === 'pending'
                          ? 'bg-amber-500'
                          : ticket.status === 'resolved'
                          ? 'bg-emerald-600'
                          : 'bg-slate-600'
                      }`}>
                        #
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-slate-900 text-xs sm:text-sm">{ticket.id}</span>
                          {ticket.bookingPnr && (
                            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-mono">
                              PNR: {ticket.bookingPnr}
                            </span>
                          )}
                          <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {ticket.category.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          दर्ज तिथि: {ticket.createdAt} • अंतिम अपडेट: {ticket.lastUpdated}
                        </p>
                      </div>
                    </div>

                    <div>
                      {ticket.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>⏳ समीक्षाधीन (Pending)</span>
                        </span>
                      ) : ticket.status === 'resolved' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>✅ समाधानित (Resolved)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                          <span>🔒 बंद टिकट (Closed)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-black text-slate-900 text-sm">{ticket.subject}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{ticket.description}</p>
                  </div>

                  {/* Resolution Note if available */}
                  {ticket.resolutionNote && (
                    <div className="p-3 bg-white rounded-2xl border border-slate-200 text-xs flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 block">सफ़रगो सपोर्ट टीम का उत्तर:</span>
                        <p className="text-slate-600 mt-0.5">{ticket.resolutionNote}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons for Ticket */}
                  {ticket.status !== 'closed' && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                      {ticket.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => {
                            resolveSupportTicket(ticket.id, 'आपकी समस्या का सफलतापूर्वक समाधान कर दिया गया है।');
                            confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
                            setTicketToast(`✅ टिकट ${ticket.id} को समाधानित मार्क किया गया!`);
                            setTimeout(() => setTicketToast(''), 4000);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                        >
                          ✅ समस्या सुलझ गई (Mark Resolved)
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          closeSupportTicket(ticket.id);
                          setTicketToast(`🔒 टिकट ${ticket.id} बंद कर दिया गया।`);
                          setTimeout(() => setTicketToast(''), 4000);
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                      >
                        टिकट बंद करें (Close)
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. AGENT REFER & EARN PROGRAM VIEW (₹10 ON VERIFY + ₹50 ON 5 BOOKINGS)     */}
      {/* ========================================================================= */}
      {mainTab === 'refer' && (
        <div className="space-y-6">
          {/* Main Referral Hero Banner */}
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-amber-400/40 relative overflow-hidden space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> SafarGo Partner Affiliate • ₹60 per Agent
                </div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                  {t('एजेंट रेफर करें और कमाएं कुल ₹60 प्रति पार्टनर!', 'Refer Travel Agents & Earn ₹60 per Partner!')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  {t(
                    'अपने दोस्तों, सीएससी / ऑनलाइन कियोस्क संचालकों को SafarGo पर आमंत्रित करें। आईडी सक्रिय होते ही ₹10 और 5 बस बुकिंग पूरी करने पर ₹50 सीधे आपके वॉलेट में क्रेडिट होंगे!',
                    'Invite CSC operators, cyber cafes or agents to SafarGo. Get ₹10 instantly when their ID is verified, and ₹50 bonus when they complete 5 bookings!'
                  )}
                </p>
              </div>

              {/* Total Referral Earnings Metric Box */}
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 text-center self-start md:self-auto min-w-[180px]">
                <span className="text-[11px] uppercase font-bold text-amber-300 tracking-wider block">कुल रेफरल कमाई</span>
                <div className="text-3xl font-black text-white mt-1">₹{totalReferralEarnings}</div>
                <p className="text-[10px] text-emerald-400 font-semibold mt-1">वॉलेट में जमा • तुरंत निकासी योग्य</p>
              </div>
            </div>

            {/* Unique Referral Link & Share Buttons */}
            <div className="mt-4 pt-4 border-t border-white/10 bg-black/30 p-4 rounded-2xl border border-amber-400/20">
              <span className="text-xs font-bold text-slate-300 block mb-2">
                आपका यूनीक एजेंट रेफरल लिंक (Your Unique Onboarding Link):
              </span>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="w-full sm:flex-1 bg-white/10 px-3.5 py-2.5 rounded-xl border border-white/20 font-mono text-xs text-amber-300 truncate">
                  {referralUrl}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleCopyReferral}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-700" />}
                    <span>{copiedLink ? 'लिंक कॉपी हो गया!' : 'कॉपी लिंक'}</span>
                  </button>

                  <button
                    onClick={handleShareWhatsApp}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>WhatsApp पर भेजें</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* How Referral Rewards Work (2 Simple Steps) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-lg shrink-0">
                ₹10
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-sm">चरण 1: एजेंट आईडी एक्टिव होते ही ₹10</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  जैसे ही रेफर्ड एजेंट 5-Step ऑनबोर्डिंग पूरी करता है और 24-घंटे सत्यापन में उसकी आईडी अप्रूव होती है, तुरंत ₹10 आपके वॉलेट में जमा हो जाएंगे।
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-black text-lg shrink-0">
                ₹50
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-sm">चरण 2: 5 बस बुकिंग पूरी करने पर ₹50</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  जब रेफर्ड एजेंट अपने ग्राहकों के लिए 5 बस टिकट सफलतापूर्वक बुक कर लेता है, तो ₹50 का अतिरिक्त बोनस आपके वॉलेट में सीधे क्रेडिट हो जाएगा!
                </p>
              </div>
            </div>
          </div>

          {/* Referral Statistics Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">कुल आमंत्रित एजेंट</span>
              <div className="text-3xl font-black text-slate-900 mt-1">{agentReferrals.length}</div>
              <p className="text-[10px] text-slate-400 mt-0.5">आपके लिंक से रजिस्टर हुए</p>
            </div>

            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 shadow-sm">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">सत्यापित एजेंट (₹10 प्राप्त)</span>
              <div className="text-3xl font-black text-emerald-950 mt-1">{verifiedCount}</div>
              <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">आईडी एक्टिव व सक्रिय</p>
            </div>

            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 shadow-sm">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">5 बुकिंग पूर्ण (₹50 बोनस)</span>
              <div className="text-3xl font-black text-amber-950 mt-1">{fiveBookingsCount}</div>
              <p className="text-[10px] text-amber-700 font-semibold mt-0.5">टारगेट पूरा करने वाले एजेंट</p>
            </div>
          </div>

          {/* Invited Agents Live Status Tracking Table */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-black text-slate-900 text-base">आमंत्रित एजेंटों की लाइव स्थिति (Referral Status Tracker)</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  यहाँ देखें कि किस एजेंट की आईडी सत्यापित हुई है और उसने कितनी बुकिंग पूरी की हैं।
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {agentReferrals.map(ref => (
                <div
                  key={ref.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm text-white ${
                      ref.isVerified ? 'bg-emerald-600' : 'bg-amber-500'
                    }`}>
                      {ref.referredName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{ref.referredName}</span>
                        <span className="text-slate-400 font-mono text-[11px]">({ref.referredMobile})</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {ref.referredShop} • तारीख: {ref.date}
                      </p>
                    </div>
                  </div>

                  {/* Verification Status & 5 Bookings Progress */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Verification Status */}
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">सत्यापन स्थिति</span>
                      {ref.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>सत्यापित (+₹10 प्राप्त)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-bold mt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>24-घंटे सत्यापन पेंडिंग</span>
                        </span>
                      )}
                    </div>

                    {/* Booking Progress Tracker */}
                    <div className="min-w-[140px]">
                      <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                        <span>बुकिंग प्रगति:</span>
                        <span className={ref.completedBookings >= 5 ? 'text-emerald-700' : 'text-indigo-600'}>
                          {ref.completedBookings} / 5 पूरी
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            ref.completedBookings >= 5 ? 'bg-emerald-500' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${Math.min(100, (ref.completedBookings / 5) * 100)}%` }}
                        />
                      </div>
                      {ref.completedBookings >= 5 ? (
                        <span className="text-[10px] font-bold text-emerald-600 mt-0.5 block">
                          🎉 ₹50 बोनस प्राप्त हुआ!
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          {5 - ref.completedBookings} बुकिंग शेष (+₹50 हेतु)
                        </span>
                      )}
                    </div>

                    {/* Total Earned Badge */}
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">कुल अर्जित</span>
                      <span className="text-base font-black text-emerald-700">₹{ref.totalEarned}</span>
                    </div>

                    {/* Interactive button to test booking reward */}
                    {ref.isVerified && ref.completedBookings < 5 && (
                      <button
                        type="button"
                        onClick={() => {
                          creditReferralBonus(ref.id, 'booking_five');
                          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
                          setTicketToast(`🎉 ${ref.referredName} ने 5 बुकिंग पूरी की! आपके वॉलेट में ₹50 बोनस जमा हुआ!`);
                          setTimeout(() => setTicketToast(''), 5000);
                        }}
                        className="px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-[11px] rounded-lg transition"
                      >
                        ⚡ 5 बुकिंग पूर्ण (+₹50)
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE SUPPORT TICKET                                              */}
      {/* ========================================================================= */}
      {isCreateTicketModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scale-up space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                <span>नया सहायता / सपोर्ट टिकट बनाएं</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateTicketModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  समस्या श्रेणी (Issue Category) *
                </label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value as any)}
                  className="w-full font-semibold px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="bus_booking">बस टिकट / सीट संबंधित सहायता</option>
                  <option value="hotel_booking">होटल बुकिंग व चेक-इन सहायता</option>
                  <option value="payment_wallet">वॉलेट टॉप-अप / UTR पेमेंट ऑडिट</option>
                  <option value="cancellation_refund">कैंसलेशन एवं रिफंड स्थिति</option>
                  <option value="agent_commission">एजेंट कमीशन व पेआउट पूछताछ</option>
                  <option value="other">अन्य सामान्य तकनीकी सहायता</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  संबंधित PNR नंबर (यदि उपलब्ध हो):
                </label>
                <input
                  type="text"
                  value={ticketPnr}
                  onChange={(e) => setTicketPnr(e.target.value.toUpperCase())}
                  placeholder="e.g. SFG-749201"
                  className="w-full font-mono font-semibold px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  समस्या का मुख्य विषय (Subject) *
                </label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="उदा. बस लेट हो गई / सीट नंबर सही नहीं मिला"
                  className="w-full font-semibold px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  विस्तार से विवरण दें (Description) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  placeholder="कृपया अपनी समस्या के बारे में विस्तार से बताएं..."
                  className="w-full font-semibold p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateTicketModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md transition active:scale-95"
                >
                  टिकट सबमिट करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: LIVE GPS ROUTE TRACKER MODAL                                       */}
      {/* ========================================================================= */}
      {activeTrackingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Navigation className="w-5 h-5 animate-pulse" />
                </span>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">{t('सफ़रगो लाइव GPS ट्रैकर', 'SafarGo Live Bus Tracker')}</h3>
                  <p className="text-xs text-slate-500">
                    PNR: {activeTrackingBooking.pnr} • {activeTrackingBooking.busDetails?.bus.operatorName}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTrackingBooking(null)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Live GPS Map Graphic */}
            <div className="relative rounded-2xl bg-slate-900 p-5 text-white overflow-hidden shadow-inner">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
              
              <div className="relative z-10 space-y-4">
                {/* Live Speed and Status */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{t('लाइव ऑन-रूट', 'LIVE ON ROUTE')}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black font-mono text-emerald-400">68 <span className="text-xs font-normal text-white">KM/H</span></span>
                    <p className="text-[10px] text-slate-400">{t('वर्तमान गति (Speed)', 'Current Speed')}</p>
                  </div>
                </div>

                {/* Route Milestones Progress */}
                <div className="space-y-4 pt-2">
                  {/* Origin */}
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-slate-950">
                      ✓
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{activeTrackingBooking.busDetails?.bus.sourceCity} (Departed on time)</p>
                      <p className="text-[11px] text-slate-400">{activeTrackingBooking.busDetails?.boardingPoint.name} • 10:30 PM</p>
                    </div>
                  </div>

                  {/* Current Real-time Location Indicator */}
                  <div className="flex items-start gap-3 pl-0.5">
                    <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-slate-950 animate-bounce">
                      <Bus className="w-3 h-3" />
                    </div>
                    <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 w-full">
                      <p className="text-xs font-bold text-amber-300">
                        {t('वर्तमान स्थान: बहरोड़ हाईवे (NH-48)', 'Current Location: Behror Highway Flyover (NH-48)')}
                      </p>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        {t('अगला स्टॉप: सफ़रगो हाईवे मिडवे प्लाजा (अगले 28 मिनट में)', 'Next Stop: SafarGo Food Plaza in 28 mins')}
                      </p>
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-slate-600 bg-slate-800 flex items-center justify-center text-[10px] text-slate-400">
                      •
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-300">{activeTrackingBooking.busDetails?.bus.destinationCity} (Destination)</p>
                      <p className="text-[11px] text-slate-500">Estimated Arrival: {activeTrackingBooking.busDetails?.bus.arrivalTime} (On Time)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Driver & Support Contact */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-900">{t('चालक व बस स्टाफ संपर्क', 'Bus Captain / Crew Contact')}</p>
                <p className="text-[11px] text-slate-500">Manoj Singh (Bus Pilot) • 9829XXXXXX</p>
              </div>

              <a
                href="tel:18002008899"
                className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-1.5 hover:bg-emerald-700 transition"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{t('कॉल करें', 'Call Crew')}</span>
              </a>
            </div>

            <button
              onClick={() => setActiveTrackingBooking(null)}
              className="w-full mt-4 py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs transition"
            >
              {t('ट्रैकर बंद करें', 'Close Tracker')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
