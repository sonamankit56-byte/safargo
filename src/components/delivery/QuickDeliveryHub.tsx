import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { MP_NETWORK_CITIES } from '../../lib/mockData';
import { QuickDeliveryOrder } from '../../types';
import {
  Bike,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle2,
  Phone,
  Search,
  Store,
  DollarSign,
  TrendingUp,
  Camera,
  FileCheck,
  AlertCircle,
  ShoppingBag,
  Plus,
  ArrowRight,
  ShieldCheck,
  Zap,
  Check,
  X,
  Package
} from 'lucide-react';
import { OrderPlacedCelebrationModal } from './OrderPlacedCelebrationModal';
import { FlipkartOrderTrackingView } from './FlipkartOrderTrackingView';

interface QuickDeliveryHubProps {
  onOpenAuth?: (tab?: 'login' | 'register') => void;
}

export const QuickDeliveryHub: React.FC<QuickDeliveryHubProps> = ({ onOpenAuth }) => {
  const { currentUser } = useAuth();
  const {
    quickDeliveryOrders,
    createDeliveryOrder,
    customerConfirmDeliveryOrder,
    partnerShops,
  } = useData();
  const { success, error, info } = useToast();

  const [orderMode, setOrderMode] = useState<'concierge' | 'partner_shop'>('partner_shop');
  const [selectedShopId, setSelectedShopId] = useState<string>(partnerShops[0]?.id || '');

  // Form State
  const [customerName, setCustomerName] = useState(currentUser?.full_name || '');
  const [customerMobile, setCustomerMobile] = useState(currentUser?.mobile || '');
  const [customerAddress, setCustomerAddress] = useState(currentUser?.address || '');
  const [selectedCity, setSelectedCity] = useState(currentUser?.city || 'Sironj');
  const [customItemsText, setCustomItemsText] = useState('');
  const [distanceKm, setDistanceKm] = useState<number>(1.5);
  const [cartItems, setCartItems] = useState<{ id: string; name: string; price: number; qty: number }[]>([]);

  // Celebration Modal & Dedicated Flipkart Tracking State
  const [celebrationOrder, setCelebrationOrder] = useState<QuickDeliveryOrder | null>(null);
  const [isTrackingViewOpen, setIsTrackingViewOpen] = useState(false);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);

  // Distance Fee Calculator Helper
  const calculatePricing = (km: number) => {
    const d = Math.max(0.1, Number(km) || 1);
    if (d <= 2) return { fee: 25, agent: 18, platform: 7 };
    if (d <= 4) return { fee: 45, agent: 34, platform: 11 };
    if (d <= 6) return { fee: 65, agent: 50, platform: 15 };
    const extra = Math.ceil(d - 6);
    return {
      fee: 65 + extra * 10,
      agent: 50 + extra * 8,
      platform: 15 + extra * 2,
    };
  };

  const currentPricing = calculatePricing(distanceKm);

  const selectedShop = partnerShops.find((s) => s.id === selectedShopId);

  // Cart operations
  const handleAddToCart = (item: { id: string; name: string; price: number }) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      error('Login Required', '15-मिनट क्विक डिलीवरी ऑर्डर करने के लिए कृपया SafarGo में लॉगिन करें।');
      if (onOpenAuth) onOpenAuth('login');
      return;
    }
    if (!customerName.trim() || customerMobile.replace(/\D/g, '').length !== 10) {
      error('Invalid Details', 'कृपया अपना नाम और 10-अंकों का मोबाइल नंबर दर्ज करें।');
      return;
    }
    if (!customerAddress.trim()) {
      error('Missing Address', 'कृपया डिलीवरी का सही पता व मकान/वार्ड नंबर भरें।');
      return;
    }

    let itemsDesc = '';
    if (orderMode === 'partner_shop') {
      if (cartItems.length === 0) {
        error('Empty Cart', 'कृपया दुकान से कम से कम 1 सामान चुनें या कस्टम लिस्ट भरें।');
        return;
      }
      itemsDesc = cartItems.map((i) => `${i.name} (${i.qty}x)`).join(', ');
    } else {
      if (!customItemsText.trim()) {
        error('Missing Items', 'कृपया आवश्यक सामानों की सूची दर्ज करें।');
        return;
      }
      itemsDesc = customItemsText.trim();
    }

    const order = await createDeliveryOrder({
      customer_name: customerName,
      customer_mobile: customerMobile,
      customer_address: customerAddress,
      city: selectedCity,
      items_description: itemsDesc,
      distance_km: distanceKm,
      pickup_mode: orderMode === 'partner_shop' ? 'partner_shop' : 'local_concierge',
      partner_shop_id: orderMode === 'partner_shop' ? selectedShop?.id : undefined,
      partner_shop_name: orderMode === 'partner_shop' ? selectedShop?.shop_name : undefined,
    });

    if (order) {
      setCustomItemsText('');
      setCartItems([]);
      setCelebrationOrder(order);
    }
  };

  if (isTrackingViewOpen) {
    return (
      <FlipkartOrderTrackingView
        orderId={activeTrackingOrderId}
        onBack={() => setIsTrackingViewOpen(false)}
        onSelectOrder={(id) => setActiveTrackingOrderId(id)}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Hero Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-900/50 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-sm">
                <Zap className="w-4 h-4" />
                ब्लिंकिट का ग्रामीण विकल्प (Rural Blinkit)
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-300 border border-white/10">
                15-मिनट त्वरित डिलीवरी सेवा
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              सफ़ारगो 15-मिनट लोकल डिलीवरी हब
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              सिरोंज, कुरवाई, लटेरी, चंदेरी, गुना, बीना, विदिशा, शिवपुरी - जहाँ ब्लिंकिट, ज़ेप्टो या इंस्टामार्ट नहीं पहुँचते, वहाँ आपके नजदीकी SafarGo एजेंट 5 मिनट में लोकल दुकान से सामान खरीदकर 15 मिनट में आपके घर पहुँचाते हैं!
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shrink-0 text-center md:text-right min-w-[220px]">
            <div className="text-xs text-emerald-300 font-bold uppercase tracking-wider flex items-center justify-center md:justify-end gap-1">
              <Clock className="w-4 h-4 text-emerald-400" />
              15 मिनट गारंटी
            </div>
            <div className="text-2xl font-black text-white mt-1">
              शुरुआत मात्र ₹25
            </div>
            <div className="text-[11px] text-slate-300 mt-1">
              फोटो व बिल देखकर ही भुगतान करें!
            </div>
          </div>
        </div>
      </div>

      {/* 2. Transparent Pricing & Split Model */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              पारदर्शी दूरी-आधारित डिलीवरी दर एवं कमाई विभाजन (Win-Win Split)
            </h3>
            <p className="text-xs text-slate-500">
              ग्राहक से केवल दूरी के हिसाब से वाजिब शुल्क, एजेंट को उचित पारिश्रमिक और प्लेटफॉर्म की उचित कमाई।
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
            100% पारदर्शी दरें
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">0 से 2 KM</span>
              <span className="text-base font-black text-indigo-700">₹25 कुल</span>
            </div>
            <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1 border-t border-slate-200/60">
              <span className="text-emerald-700 font-bold">एजेंट: ₹18</span>
              <span className="text-slate-500">सफ़ारगो: ₹7</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">2 से 4 KM</span>
              <span className="text-base font-black text-indigo-700">₹45 कुल</span>
            </div>
            <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1 border-t border-slate-200/60">
              <span className="text-emerald-700 font-bold">एजेंट: ₹34</span>
              <span className="text-slate-500">सफ़ारगो: ₹11</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">4 से 6 KM</span>
              <span className="text-base font-black text-indigo-700">₹65 कुल</span>
            </div>
            <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1 border-t border-slate-200/60">
              <span className="text-emerald-700 font-bold">एजेंट: ₹50</span>
              <span className="text-slate-500">सफ़ारगो: ₹15</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">6 KM से अधिक</span>
              <span className="text-base font-black text-indigo-700">+₹10 / KM</span>
            </div>
            <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1 border-t border-slate-200/60">
              <span className="text-emerald-700 font-bold">एजेंट: +₹8/KM</span>
              <span className="text-slate-500">सफ़ारगो: +₹2/KM</span>
            </div>
          </div>
        </div>

        {/* 5-Minute Safety Workflow */}
        <div className="bg-emerald-50/70 rounded-xl p-3 border border-emerald-200/60 flex items-start gap-2.5 text-xs text-emerald-950">
          <Camera className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>5-मिनट फोटो व बिल सत्यापन मॉडल:</strong> ऑर्डर लगने के 5 मिनट के अंदर एजेंट नजदीकी दुकान पर पहुँचकर सामान व वास्तविक बिल की फोटो अपलोड करता है। ग्राहक अपनी स्क्रीन पर बिल देखकर "स्वीकार करें" दबाता है, जिसके बाद 15-मिनट का डिलीवरी टाइमर शुरू होता है!
          </div>
        </div>
      </div>

      {/* Animated SafarGo Quick Delivery Login Banner for Unauthenticated Users */}
      {!currentUser && (
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 border-2 border-emerald-500/50 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-5 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/40 animate-bounce">
              <Bike className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                  🔒 लॉगिन आवश्यक
                </span>
                <span className="text-xs text-emerald-300 font-bold">
                  SafarGo 15-Minute Rural Express
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                क्विक डिलीवरी का लाभ लेने के लिए लॉगिन करें!
              </h3>
              <p className="text-xs text-emerald-200/90 max-w-xl">
                सीधे अपने मोबाइल नंबर से लॉगिन करें ताकि राइडर आपका सामान 15 मिनट में आपके पते पर पहुंचा सके।
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenAuth ? onOpenAuth('login') : undefined}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/30 transition flex items-center gap-2 shrink-0 active:scale-95 cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>SafarGo क्विक डिलीवरी — लॉगिन करें</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Order Placement Desk & Live Tracking Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Place 15-Minute Order (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Bike className="w-5 h-5 text-emerald-600" />
                15-मिनट सामान ऑर्डर करें
              </h2>
              <p className="text-xs text-slate-500">
                किराना, दूध-दही, दवाइयां, बेकरी या कोई भी जरूरी सामान
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setOrderMode('partner_shop')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  orderMode === 'partner_shop'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                पार्टनर दुकान से
              </button>
              <button
                type="button"
                onClick={() => setOrderMode('concierge')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  orderMode === 'concierge'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                कस्टम लिस्ट (लिखकर)
              </button>
            </div>
          </div>

          <form onSubmit={handlePlaceOrder} className="space-y-4">
            {/* Step 1: Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  आपका नाम *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="उदा. कैलाश शर्मा"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  मोबाइल नंबर (WhatsApp) *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={customerMobile}
                  onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-अंकों का मोबाइल नंबर"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  शहर / कस्बा *
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  {MP_NETWORK_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  डिलीवरी दूरी (KM) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.5"
                    max="10"
                    step="0.5"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <span className="font-bold text-xs text-slate-800 shrink-0 w-14 text-right">
                    {distanceKm} KM
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  डिलीवरी का पता (वार्ड नं., गली या लैंडमार्क) *
                </label>
                <input
                  type="text"
                  required
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="उदा. मकान नं. 14, तहसील कॉलोनी, पुरानी कचहरी के पास"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Step 2: Items Picker */}
            {orderMode === 'partner_shop' ? (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    पार्टनर दुकान चुनें:
                  </label>
                  <select
                    value={selectedShopId}
                    onChange={(e) => {
                      setSelectedShopId(e.target.value);
                      setCartItems([]);
                    }}
                    className="px-3 py-1 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                  >
                    {partnerShops.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.shop_name} ({s.city})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedShop && selectedShop.catalog_items && selectedShop.catalog_items.length > 0 ? (
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase mb-2">
                      दुकान में उपलब्ध सामान:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {selectedShop.catalog_items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-900 truncate max-w-[150px]">{item.name}</div>
                            <div className="text-[11px] text-emerald-700 font-bold">₹{item.price} <span className="text-slate-400 font-normal">/ {item.unit}</span></div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddToCart(item)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[11px] transition flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            जोड़ें
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">इस दुकान का कैटलॉग अभी अपडेट हो रहा है। आप कस्टम लिस्ट विकल्प चुन सकते हैं।</p>
                )}

                {/* Cart summary */}
                {cartItems.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 space-y-1.5">
                    <div className="text-xs font-bold text-slate-800">
                      चुने गए सामान ({cartItems.length}):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {cartItems.map((c) => (
                        <span
                          key={c.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 shadow-sm"
                        >
                          <span>{c.name} ({c.qty}x)</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(c.id)}
                            className="text-slate-400 hover:text-rose-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  आवश्यक सामानों की सूची यहाँ लिखें *
                </label>
                <textarea
                  rows={3}
                  required
                  value={customItemsText}
                  onChange={(e) => setCustomItemsText(e.target.value)}
                  placeholder="उदा. आशीर्वाद आटा 5kg, टाटा नमक 1 पैकेट, डोलो 650 2 पत्ता, ब्रेड और दूध 2 पैकेट"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  एजेंट नजदीकी दुकान पर जाकर आपका सामान खरीदेगा और 5 मिनट में बिल व फोटो आपको भेजेगा।
                </p>
              </div>
            )}

            {/* Price Preview Card */}
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div>
                <div className="text-xs text-emerald-900 font-bold">
                  दूरी: {distanceKm} KM (15 मिनट डिलीवरी)
                </div>
                <div className="text-[11px] text-emerald-700 mt-0.5">
                  डिलीवरी शुल्क: ₹{currentPricing.fee} (एजेंट: ₹{currentPricing.agent} + सफ़ारगो: ₹{currentPricing.platform})
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 font-medium">डिलीवरी चार्ज</div>
                <div className="text-2xl font-black text-emerald-700">₹{currentPricing.fee}</div>
              </div>
            </div>

            {!currentUser ? (
              <button
                type="button"
                onClick={() => onOpenAuth ? onOpenAuth('login') : undefined}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-slate-950 font-black text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer animate-pulse"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>🔑 SafarGo क्विक डिलीवरी — लॉगिन कर ऑर्डर करें</span>
              </button>
            ) : (
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-indigo-700 hover:from-emerald-700 hover:to-indigo-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>15-मिनट डिलीवरी ऑर्डर बुक करें (Place Order)</span>
              </button>
            )}
          </form>
        </div>

        {/* Right Column: Live Orders & 15-Minute Tracker (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              लाइव डिलीवरी ट्रैकर ({quickDeliveryOrders.length})
            </h3>
            <span className="text-xs text-slate-500">रियल-टाइम स्टेटस</span>
          </div>

          <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
            {quickDeliveryOrders.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400">
                <ShoppingBag className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-medium">अभी कोई सक्रिय ऑर्डर नहीं है</p>
              </div>
            ) : (
              quickDeliveryOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-700">
                      {order.order_code}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      order.status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'out_for_delivery'
                        ? 'bg-purple-100 text-purple-800 animate-pulse'
                        : order.status === 'photo_price_uploaded'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status === 'placed' && '⏳ एजेंट पिकअप 5 मिनट'}
                      {order.status === 'agent_assigned' && '🚴 एजेंट दुकान पर रवाना'}
                      {order.status === 'photo_price_uploaded' && '📸 बिल व फोटो आ गई'}
                      {order.status === 'out_for_delivery' && '⚡ 15-मिनट रास्ते में'}
                      {order.status === 'delivered' && '✓ डिलीवर संपन्न'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 space-y-0.5">
                    <div><strong>ग्राहक:</strong> {order.customer_name} ({order.customer_mobile})</div>
                    <div><strong>सामान:</strong> {order.items_description}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{order.customer_address}, {order.city} ({order.distance_km} KM)</span>
                    </div>
                  </div>

                  {/* 5-Min Photo & Actual Price Card */}
                  {order.item_photo_url && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1">
                          <Camera className="w-3.5 h-3.5 text-indigo-600" />
                          दुकानदार का बिल व सामान
                        </span>
                        <span className="text-indigo-700 font-mono">
                          सामान: ₹{order.actual_item_price}
                        </span>
                      </div>

                      <img
                        src={order.item_photo_url}
                        alt="Item & Bill"
                        className="w-full h-28 object-cover rounded-lg border border-slate-200"
                      />

                      <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-slate-200">
                        <span>कुल देय (सामान + डिलीवरी ₹{order.delivery_fee}):</span>
                        <span className="text-emerald-700 text-sm">
                          ₹{order.total_order_amount}
                        </span>
                      </div>

                      {order.status === 'photo_price_uploaded' && (
                        <button
                          type="button"
                          onClick={() => customerConfirmDeliveryOrder(order.id)}
                          className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>बिल सही है, डिलीवरी स्वीकार करें (Confirm)</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Agent Details & 15-Minute Countdown */}
                  {order.agent_name && (
                    <div className="bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-indigo-950 flex items-center gap-1">
                          <Bike className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{order.agent_name}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">{order.agent_mobile}</div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                          एजेंट कमाई: +₹{order.agent_payout}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Dedicated Flipkart Tracker CTA */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTrackingOrderId(order.id);
                      setIsTrackingViewOpen(true);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                  >
                    <Package className="w-3.5 h-3.5 text-amber-400" />
                    <span>📦 फ्लिपकार्ट स्टाइल लाइव ट्रैक करें (Full Tracking)</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Big Order Placed Celebration Modal */}
      <OrderPlacedCelebrationModal
        isOpen={!!celebrationOrder}
        order={celebrationOrder}
        onClose={() => setCelebrationOrder(null)}
        onTrackOrder={(id) => {
          setActiveTrackingOrderId(id);
          setIsTrackingViewOpen(true);
        }}
      />

    </div>
  );
};
