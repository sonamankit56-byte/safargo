import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../common/StatusBadge';
import { CountdownTimer } from '../common/CountdownTimer';
import {
  Bus,
  Bike,
  Clock,
  MapPin,
  CheckCircle2,
  Phone,
  AlertCircle,
  ShoppingBag,
  ExternalLink,
  Printer,
  Calendar,
  DollarSign,
  User,
  ShieldCheck,
  PlusCircle,
  Eye,
  Camera,
  Check,
  ChevronRight,
  MessageSquare,
  Search,
  Sparkles,
  Award,
  Package
} from 'lucide-react';
import { MP_NETWORK_CITIES } from '../../lib/mockData';
import { FlipkartOrderTrackingView } from '../delivery/FlipkartOrderTrackingView';

interface CustomerPortalProps {
  onNavigateTab?: (tab: string) => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({ onNavigateTab }) => {
  const { currentUser, allProfiles, updateProfile } = useAuth();
  const { bookings, quickDeliveryOrders, customerConfirmDeliveryOrder } = useData();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<'bookings' | 'nearby_agents' | 'deliveries' | 'profile'>('bookings');
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<string | null>(null);
  const [trackingDeliveryId, setTrackingDeliveryId] = useState<string | null>(null);

  // Search & filter state for nearby agents
  const [agentSearchCity, setAgentSearchCity] = useState<string>('All');
  const [agentSearchQuery, setAgentSearchQuery] = useState('');

  // Profile edit state
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState(currentUser?.address || '');
  const [newCity, setNewCity] = useState(currentUser?.city || 'Indore');

  // Filter approved agents in MP
  const mpAgents = (allProfiles || []).filter((p) => p.role === 'agent' && p.agent_status === 'approved');
  const filteredAgents = mpAgents.filter((a) => {
    const aCity = (a.city || '').toLowerCase();
    const matchCity = agentSearchCity === 'All' || aCity === agentSearchCity.toLowerCase();
    const q = agentSearchQuery.toLowerCase().trim();
    const matchQ = !q ||
      (a.full_name || '').toLowerCase().includes(q) ||
      (a.shop_name && a.shop_name.toLowerCase().includes(q)) ||
      (a.mobile || '').includes(agentSearchQuery) ||
      aCity.includes(q);
    return matchCity && matchQ;
  });

  // Filter bookings for this customer
  const userMobileClean = currentUser?.mobile ? currentUser.mobile.replace(/\D/g, '') : '';
  const myBookings = (bookings || []).filter((b) => {
    const cMobile = b.customer_mobile ? b.customer_mobile.replace(/\D/g, '') : '';
    const aMobile = b.agent_mobile ? b.agent_mobile.replace(/\D/g, '') : '';
    return (userMobileClean && (cMobile === userMobileClean || aMobile === userMobileClean)) || (currentUser?.id && b.agent_id === currentUser.id);
  });

  // Filter quick deliveries for this customer
  const myDeliveries = quickDeliveryOrders.filter((o) => {
    const oMobile = o.customer_mobile.replace(/\D/g, '');
    return oMobile === userMobileClean || o.customer_name === currentUser?.full_name;
  });

  const activeDeliveriesCount = myDeliveries.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  ).length;

  const confirmedBookingsCount = myBookings.filter((b) => b.status === 'confirmed').length;

  const handleConfirmOrder = async (orderId: string) => {
    const ok = await customerConfirmDeliveryOrder(orderId);
    if (ok) {
      success('Order Confirmed!', 'आपने सामान व बिल फोटो स्वीकार कर लिया है। एजेंट 15 मिनट में डिलीवरी करेगा।');
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.trim()) {
      error('Address Required', 'कृपया अपना पूरा पता भरें।');
      return;
    }
    const ok = await updateProfile({
      address: newAddress.trim(),
      city: newCity.trim(),
    });
    if (ok) {
      setIsEditingAddress(false);
      success('Address Updated', 'डिलीवरी पता सुरक्षित हो गया है।');
    }
  };

  if (trackingDeliveryId) {
    return (
      <FlipkartOrderTrackingView
        orderId={trackingDeliveryId}
        onBack={() => setTrackingDeliveryId(null)}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* 1. Customer Welcome Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-orange-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-500 text-white flex items-center gap-1.5 shadow-sm">
                <User className="w-3.5 h-3.5" />
                सफ़ारगो ग्राहक खाता (Customer Account)
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/10 text-slate-300">
                +91 {currentUser?.mobile}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                शहर: {currentUser?.city || 'Madhya Pradesh'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black">
              नमस्ते, {currentUser?.full_name || 'यात्री मित्र'}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              आपकी सभी बस टिकटें, लाइव PNR स्टेटस एवं 15-मिनट लोकल क्विक डिलीवरी ऑर्डर एक ही सुरक्षित जगह पर।
            </p>

            <div className="flex items-center gap-2 text-xs text-orange-200/90 pt-1">
              <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span className="truncate max-w-lg">
                डिफ़ॉल्ट पता: {currentUser?.address || 'पता दर्ज नहीं है'}
              </span>
            </div>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap md:flex-col gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab ? onNavigateTab('quick-delivery') : undefined}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs shadow-lg transition flex items-center justify-center gap-2"
            >
              <Bike className="w-4 h-4" />
              <span>15-मिनट सामान मंगवाएं</span>
            </button>
            <button
              onClick={() => setActiveTab('nearby_agents')}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition flex items-center justify-center gap-2"
            >
              <Bus className="w-4 h-4 text-orange-400" />
              <span>नजदीकी एजेंट से बस बुक कराएं</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold">मेरी बस टिकटें</div>
            <div className="text-2xl font-black text-slate-900">{myBookings.length}</div>
            <div className="text-[11px] text-emerald-600 font-bold">
              {confirmedBookingsCount} कन्फर्म टिकट
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Bike className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold">15-मिनट क्विक डिलीवरी</div>
            <div className="text-2xl font-black text-slate-900">{myDeliveries.length}</div>
            <div className="text-[11px] text-emerald-600 font-bold">
              {activeDeliveriesCount > 0 ? `${activeDeliveriesCount} लाइव ऑर्डर सक्रिय` : 'कोई सक्रिय ऑर्डर नहीं'}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold">खाता सुरक्षा स्थिति</div>
            <div className="text-lg font-black text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>सत्यापित ग्राहक</span>
            </div>
            <div className="text-[11px] text-slate-500">
              100% सुरक्षित एवं डायरेक्ट बुकिंग
            </div>
          </div>
        </div>
      </div>

      {/* 3. Section Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition shrink-0 ${
            activeTab === 'bookings'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bus className="w-4 h-4" />
          <span>मेरी बस टिकटें ({myBookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('nearby_agents')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition shrink-0 ${
            activeTab === 'nearby_agents'
              ? 'border-orange-500 text-orange-600 bg-orange-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Phone className="w-4 h-4 text-orange-500" />
          <span>🚌 बस बुक करें (नजदीकी एजेंट - {mpAgents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('deliveries')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition shrink-0 ${
            activeTab === 'deliveries'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bike className="w-4 h-4" />
          <span>मेरी 15-मिनट डिलीवरी ({myDeliveries.length})</span>
          {activeDeliveriesCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition shrink-0 ${
            activeTab === 'profile'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>प्रोफ़ाइल व डिलीवरी पता</span>
        </button>
      </div>

      {/* ========================================================== */}
      {/* TAB 1: MY BUS BOOKINGS                                      */}
      {/* ========================================================== */}
      {activeTab === 'bookings' && (
        <div className="space-y-5">
          {/* 🚌 Crucial SafarGo Customer Bus Booking Notice Banner */}
          <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white text-orange-600 flex items-center justify-center shrink-0 font-black shadow-md">
                  <Bus className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full border border-white/20">
                      MP अधिकृत मॉडल (Assisted Bus Booking)
                    </span>
                    <span className="text-[10px] font-bold bg-black/20 px-2 py-0.5 rounded-full">
                      100% कन्फर्म सीट व PNR गारंटी
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black leading-snug">
                    बस बुकिंग के लिए अपने नजदीकी SafarGo एजेंट से संपर्क करें!
                  </h3>
                  <p className="text-xs text-orange-100 max-w-2xl leading-relaxed">
                    SafarGo ग्रामीण मध्य प्रदेश का अधिकृत बस नेटवर्क है। बिना एजेंट के सीधी ऑनलाइन बुकिंग में ग्रामीण यात्रियों को अक्सर सीट छूटने की परेशानी होती है। SafarGo में आपके गांव-शहर के अधिकृत CSC एजेंट सीधे ऑपरेटर से बात करके आपकी सीट कन्फर्म करते हैं।
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('nearby_agents')}
                className="px-5 py-3 bg-white hover:bg-orange-50 text-orange-600 font-black text-xs rounded-2xl shadow-lg transition shrink-0 flex items-center gap-2 self-start md:self-auto active:scale-95"
              >
                <Phone className="w-4 h-4" />
                <span>नजदीकी एजेंट लिस्ट देखें व WhatsApp करें</span>
              </button>
            </div>

            {/* 🛡️ Boarding Sathi Service Highlight Card */}
            <div className="bg-black/25 backdrop-blur-xs rounded-2xl p-3.5 border border-white/25 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛡️</span>
                <span><strong>बोर्डिंग साथी सेवा (+₹33):</strong> जब तक बस नहीं आएगी, एजेंट आपके साथ बस स्टॉप पर उपस्थित रहेगा और आपको बस में सुरक्षित बैठाकर आएगा!</span>
              </div>
              <span className="text-[11px] font-bold text-amber-200 bg-black/30 px-2.5 py-1 rounded-full shrink-0">
                सुरक्षित प्रस्थान सहायता
              </span>
            </div>
          </div>

          {myBookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                <Bus className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800">अभी कोई पूर्व बस टिकट नहीं है</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  मध्य प्रदेश के इंदौर, भोपाल, विदिशा, सिरोंज, गुना, अशोक नगर, बीना एवं अन्य सभी शहरों के लिए अपने नजदीकी अधिकृत SafarGo एजेंट से तत्काल टिकट बुक करवाएं।
                </p>
              </div>
              <button
                onClick={() => setActiveTab('nearby_agents')}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 mx-auto"
              >
                <Phone className="w-4 h-4" />
                <span>नजदीकी एजेंट से टिकट बुक कराएं</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {b.booking_code}
                        </span>
                        <StatusBadge status={b.status} />
                      </div>
                      <h4 className="text-base font-black text-slate-900 mt-1">
                        {b.from_city} ➔ {b.to_city}
                      </h4>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-400">किराया (Fare)</div>
                      <div className="text-lg font-black text-orange-600">
                        ₹{b.actual_fare || b.total_estimated_amount}
                      </div>
                    </div>
                  </div>

                  {/* Trip Details Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl">
                    <div>
                      <span className="text-slate-400 block text-[10px]">यात्रा तिथि:</span>
                      <strong className="text-slate-800">{b.journey_date}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">सीट संख्या:</span>
                      <strong className="text-slate-800">{b.confirmed_seats || `${b.seat_count} सीट (${b.seat_category})`}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">बस ऑपरेटर:</span>
                      <strong className="text-slate-800">{b.actual_operator || b.operator_preference || 'Hans Travels'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">यात्री का नाम:</span>
                      <strong className="text-slate-800">{b.customer_name}</strong>
                    </div>
                  </div>

                  {/* Boarding Sathi Service Status */}
                  {b.boarding_sathi_opted && (
                    <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-amber-900 font-bold">
                        <span className="text-base">🛡️</span>
                        <div>
                          <span>बोर्डिंग साथी सेवा सक्रिय (+₹33)</span>
                          <span className="text-[10px] text-amber-700 block font-normal">
                            एजेंट बस आने तक स्टॉप पर आपके साथ रहेगा और बस में सुरक्षित बैठाकर आएगा।
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 shrink-0">
                        सुरक्षित प्रस्थान ✓
                      </span>
                    </div>
                  )}

                  {/* PNR and Status Alert */}
                  {b.ticket_pnr && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="text-emerald-800 text-[10px] block">अधिकृत टिकट PNR:</span>
                        <strong className="text-emerald-950 font-mono text-sm tracking-wider">{b.ticket_pnr}</strong>
                      </div>
                      <button
                        onClick={() => window.print()}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-emerald-700 transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>प्रिंट टिकट</span>
                      </button>
                    </div>
                  )}

                  {b.status === 'awaiting_operator_confirmation' && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-900">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-spin" />
                      <span>ऑपरेटर से सीट कन्फर्मेशन जारी है (15-मिनट विंडो)</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 2: NEARBY SAFARGO AGENTS DIRECTORY                     */}
      {/* ========================================================== */}
      {activeTab === 'nearby_agents' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header & Instructions */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                  अधिकृत जन सेवा केंद्र (CSC) बस बुकिंग नेटवर्क
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  बस बुकिंग के लिए अपने नजदीकी SafarGo एजेंट से संपर्क करें
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  मध्य प्रदेश के 19 शहरों एवं कस्बों में अधिकृत एजेंट उपलब्ध। सीधे 1-क्लिक WhatsApp से अपनी बस टिकट व बोर्डिंग साथी बुक कराएं।
                </p>
              </div>

              {/* 🛡️ Boarding Sathi Pill */}
              <div className="bg-amber-50 border border-amber-300 p-3 rounded-2xl flex items-center gap-3 shrink-0">
                <span className="text-2xl">🛡️</span>
                <div className="text-xs">
                  <strong className="text-amber-950 block font-black">बोर्डिंग साथी सेवा (+₹33)</strong>
                  <span className="text-amber-800 text-[11px]">बस आने तक सुरक्षित बैठाने की सेवा</span>
                </div>
              </div>
            </div>

            {/* City Filters & Search Bar */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={agentSearchQuery}
                  onChange={(e) => setAgentSearchQuery(e.target.value)}
                  placeholder="एजेंट का नाम, दुकान/सीएससी का नाम या मोबाइल नंबर खोजें..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* MP City Quick Filter Chips */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 block mb-2">शहर अनुसार फ़िल्टर करें (MP Cities):</span>
                <div className="flex flex-wrap gap-1.5">
                  {['All', ...MP_NETWORK_CITIES].map((c) => (
                    <button
                      key={c}
                      onClick={() => setAgentSearchCity(c)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                        agentSearchCity === c
                          ? 'bg-orange-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {c === 'All' ? 'सभी शहर (All)' : c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Agents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgents.map((agent) => (
              <div
                key={agent.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-orange-400 hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-900 text-sm">{agent.full_name}</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                          Verified ✓
                        </span>
                      </div>
                      <p className="text-xs font-bold text-orange-600 mt-0.5">{agent.shop_name || 'अधिकृत बस बुकिंग केंद्र'}</p>
                    </div>

                    <span className="text-[10px] font-black bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                      {agent.city}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 flex items-start gap-1.5 bg-slate-50 p-2.5 rounded-xl">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{agent.address || `${agent.city}, मध्य प्रदेश`}</span>
                  </div>

                  {/* Boarding Sathi Support Badge */}
                  <div className="flex items-center justify-between text-[11px] bg-amber-50/70 border border-amber-200/80 px-2.5 py-1.5 rounded-xl text-amber-900">
                    <span className="flex items-center gap-1 font-bold">
                      <span>🛡️</span>
                      <span>बोर्डिंग साथी सेवा उपलब्ध</span>
                    </span>
                    <span className="font-extrabold text-amber-950">+₹33</span>
                  </div>
                </div>

                {/* Contact Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <a
                    href={`https://wa.me/91${agent.mobile}?text=${encodeURIComponent(`नमस्ते ${agent.full_name} जी, मैं SafarGo से बस टिकट बुक करवाना चाहता हूँ। कृपया मुझे बस व सीट की जानकारी दें।`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 text-center active:scale-95"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp से बस बुक करें</span>
                  </a>

                  <a
                    href={`tel:${agent.mobile}`}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                    title="एजेंट को कॉल करें"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {filteredAgents.length === 0 && (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 text-xs text-slate-500">
              इस शहर में अभी कोई अधिकृत एजेंट नहीं मिला। कृपया 'सभी शहर' चुनें या दूसरा शहर खोजें।
            </div>
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 2: MY 15-MINUTE QUICK DELIVERIES                        */}
      {/* ========================================================== */}
      {activeTab === 'deliveries' && (
        <div className="space-y-4">
          {myDeliveries.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Bike className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800">अभी कोई डिलीवरी ऑर्डर नहीं है</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  सफ़ारगो 15-मिनट डिलीवरी सेवा से नजदीकी किराना, दवाई या डेयरी से सामान मंगवाएं। एजेंट 5 मिनट में सामान फोटो भेजेगा और 15 मिनट में डिलीवरी करेगा!
                </p>
              </div>
              <button
                onClick={() => onNavigateTab ? onNavigateTab('quick-delivery') : undefined}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                15-मिनट सामान ऑर्डर करें
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myDeliveries.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded">
                          {order.order_code}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                          order.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'photo_price_uploaded'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : order.status === 'out_for_delivery'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          {order.status === 'delivered'
                            ? 'डिलीवर हुआ (Delivered)'
                            : order.status === 'photo_price_uploaded'
                            ? '⚠️ फोटो व बिल स्वीकार करें (Action Required)'
                            : order.status === 'out_for_delivery'
                            ? 'रास्ते में है (Out for Delivery - 15m)'
                            : order.status === 'agent_assigned'
                            ? 'एजेंट सामान ले रहा है'
                            : 'ऑर्डर दर्ज हुआ'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">
                        {order.items_description}
                      </h4>
                    </div>

                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-[10px] text-slate-400 block">दूरी व डिलीवरी शुल्क:</span>
                        <strong className="text-xs text-slate-800">
                          {order.distance_km} km | ₹{order.delivery_fee}
                        </strong>
                      </div>
                      {order.total_order_amount && (
                        <div>
                          <span className="text-[10px] text-slate-400 block">कुल देय राशि:</span>
                          <strong className="text-sm font-black text-emerald-600">
                            ₹{order.total_order_amount}
                          </strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Visual 5-Minute Photo & Price Approval Box for Customer */}
                  {order.status === 'photo_price_uploaded' && order.item_photo_url && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                        <Camera className="w-5 h-5 text-amber-600" />
                        <span>एजेंट ने दुकान से सामान व बिल फोटो अपलोड कर दी है!</span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <img
                          src={order.item_photo_url}
                          alt="Item and bill photo"
                          onClick={() => setSelectedPhotoModal(order.item_photo_url || null)}
                          className="w-32 h-32 object-cover rounded-xl border-2 border-amber-300 shadow cursor-pointer hover:opacity-90"
                        />
                        <div className="flex-1 space-y-1 text-xs">
                          <p className="text-slate-700">
                            दुकान का वास्तविक सामान मूल्य: <strong>₹{order.actual_item_price}</strong>
                          </p>
                          <p className="text-slate-700">
                            डिलीवरी शुल्क ({order.distance_km} किमी): <strong>₹{order.delivery_fee}</strong>
                          </p>
                          <div className="text-base font-black text-slate-900 pt-1">
                            कुल भुगतान राशि: ₹{order.total_order_amount}
                          </div>
                          <p className="text-[11px] text-amber-800">
                            यदि सामान और बिल सही है, तो कृपया नीचे दिए बटन से तुरंत पुष्टि करें। पुष्टि करते ही 15 मिनट में डिलीवरी शुरू होगी!
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleConfirmOrder(order.id)}
                        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>सामान व बिल फोटो सही है - ऑर्डर स्वीकार करें (Confirm Order)</span>
                      </button>
                    </div>
                  )}

                  {/* Live 15-Minute Countdown for Customer */}
                  {order.status === 'out_for_delivery' && (
                    <div className="bg-emerald-950 text-white rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                          <Bike className="w-5 h-5 animate-bounce" />
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-emerald-200">
                            एजेंट आपके पते की ओर निकल चुका है!
                          </h5>
                          <p className="text-xs text-emerald-100">
                            डिलीवरी एजेंट: <strong>{order.agent_name}</strong> (+91 {order.agent_mobile})
                          </p>
                        </div>
                      </div>

                      <div className="bg-emerald-900/80 px-4 py-2 rounded-xl border border-emerald-700 text-center">
                        <div className="text-[10px] text-emerald-300 uppercase font-black">15-मिनट गारंटी समय</div>
                        <div className="text-lg font-mono font-black text-white">
                          ⚡ 15:00 मिनट
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Delivery Address & Shop Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                    <div>
                      <span className="text-slate-400 block text-[10px]">डिलीवरी पता:</span>
                      <strong className="text-slate-800">{order.customer_address}, {order.city}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">दुकान / स्रोत:</span>
                      <strong className="text-slate-800">{order.partner_shop_name || 'नजदीकी लोकल दुकान'}</strong>
                    </div>
                  </div>

                  {/* SafarGo Live Tracking CTA */}
                  <button
                    onClick={() => setTrackingDeliveryId(order.id)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                  >
                    <Package className="w-3.5 h-3.5 text-amber-400" />
                    <span>📦 SafarGo लाइव ऑर्डर ट्रैक करें (Full 5-Step View)</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 3: PROFILE & DELIVERY ADDRESS                           */}
      {/* ========================================================== */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">
              ग्राहक प्रोफ़ाइल व पता विवरण
            </h3>
            <button
              onClick={() => setIsEditingAddress(!isEditingAddress)}
              className="text-xs font-bold text-orange-600 hover:text-orange-700"
            >
              {isEditingAddress ? 'रद्द करें' : 'पता बदलें'}
            </button>
          </div>

          {!isEditingAddress ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">पूरा नाम:</span>
                  <strong className="text-slate-900">{currentUser?.full_name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">मोबाइल नंबर:</span>
                  <strong className="text-slate-900 font-mono">+91 {currentUser?.mobile}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">शहर (City):</span>
                  <strong className="text-slate-900">{currentUser?.city}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">डिलीवरी पता:</span>
                  <strong className="text-slate-900 text-right max-w-xs">{currentUser?.address}</strong>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-emerald-900 text-xs">
                  आपकी जानकारी सुरक्षित है। 15-मिनट क्विक डिलीवरी के समय यह पता ऑटो-भर जाएगा।
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  शहर (City) *
                </label>
                <input
                  type="text"
                  required
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  पूरा डिलीवरी पता (मकान नं, वार्ड, लैंडमार्क) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(false)}
                  className="w-1/3 py-2.5 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow"
                >
                  सुरक्षित करें
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Photo Preview Modal */}
      {selectedPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-w-xl w-full bg-white rounded-3xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">दुकान सामान एवं बिल फोटो</h4>
              <button
                onClick={() => setSelectedPhotoModal(null)}
                className="text-slate-400 hover:text-slate-800 text-sm font-bold"
              >
                ✕ बंद करें
              </button>
            </div>
            <img
              src={selectedPhotoModal}
              alt="Bill large view"
              className="w-full max-h-[70vh] object-contain rounded-2xl border"
            />
          </div>
        </div>
      )}

    </div>
  );
};
