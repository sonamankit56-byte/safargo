import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { QuickDeliveryOrder } from '../../types';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Bike,
  Camera,
  MapPin,
  Phone,
  MessageSquare,
  Package,
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
  Check,
  Copy,
  Zap,
  ChevronRight,
  Store,
  FileText,
  AlertCircle,
  Truck
} from 'lucide-react';

interface FlipkartOrderTrackingViewProps {
  orderId?: string | null;
  onBack: () => void;
  onSelectOrder?: (orderId: string) => void;
}

export const FlipkartOrderTrackingView: React.FC<FlipkartOrderTrackingViewProps> = ({
  orderId,
  onBack,
  onSelectOrder,
}) => {
  const {
    quickDeliveryOrders,
    customerConfirmDeliveryOrder,
  } = useData();
  const { success, error } = useToast();

  // Find active order or default to the most recent
  const activeOrder: QuickDeliveryOrder | undefined = orderId
    ? quickDeliveryOrders.find((o) => o.id === orderId)
    : quickDeliveryOrders[0];

  const [copiedCode, setCopiedCode] = useState(false);
  const [photoZoom, setPhotoZoom] = useState<string | null>(null);

  // Live 5-minute Store Pickup Countdown state
  const [storeSecondsLeft, setStoreSecondsLeft] = useState<number>(275); // ~4m 35s
  // Live 15-minute Doorstep Delivery Countdown state
  const [deliverySecondsLeft, setDeliverySecondsLeft] = useState<number>(840); // ~14m 00s

  useEffect(() => {
    const timer = setInterval(() => {
      setStoreSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
      setDeliverySecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCustomerAccept = async (id: string) => {
    const ok = await customerConfirmDeliveryOrder(id);
    if (ok) {
      success('स्वीकृति दर्ज हुई! ⚡', 'आपने सामान व बिल स्वीकार कर लिया है। एजेंट 15 मिनट में आपके घर पहुंचेगा!');
    }
  };

  if (!activeOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-800">कोई ऑर्डर नहीं मिला</h2>
        <p className="text-xs text-slate-500">कृपया नया ऑर्डर करें या ऑर्डर लिस्ट से चुनें।</p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
        >
          ← वापस जाएं
        </button>
      </div>
    );
  }

  // Determine stage progression:
  // Step 1: Placed
  // Step 2: Agent Assigned (5-Min store timer)
  // Step 3: Photo uploaded & Customer Accepted (after accept)
  // Step 4: Out for delivery (15-Min delivery timer)
  // Step 5: Delivered
  const isPlacedDone = true;
  const isAgentStoreDone = ['photo_price_uploaded', 'customer_confirmed', 'out_for_delivery', 'delivered'].includes(activeOrder.status);
  const isAgentStoreActive = activeOrder.status === 'placed' || activeOrder.status === 'agent_assigned';

  const isAcceptedDone = ['customer_confirmed', 'out_for_delivery', 'delivered'].includes(activeOrder.status);
  const isAcceptedActive = activeOrder.status === 'photo_price_uploaded';

  const isOutForDeliveryDone = activeOrder.status === 'delivered';
  const isOutForDeliveryActive = activeOrder.status === 'out_for_delivery';

  const isDeliveredDone = activeOrder.status === 'delivered';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn">
      {/* 1. Flipkart-Style Top Header Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>वापस</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase">ऑर्डर आईडी:</span>
              <span className="font-mono font-black text-sm text-slate-900">{activeOrder.order_code}</span>
              <button
                onClick={() => handleCopyCode(activeOrder.order_code)}
                className="text-slate-400 hover:text-indigo-600 transition"
                title="कोड कॉपी करें"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="text-[11px] text-slate-500">
              ऑर्डर तिथि: {new Date(activeOrder.created_at).toLocaleString('hi-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </div>
          </div>
        </div>

        {/* Order Selector (if multiple orders exist) */}
        {quickDeliveryOrders.length > 1 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px]">अन्य ऑर्डर देखें:</span>
            <select
              value={activeOrder.id}
              onChange={(e) => onSelectOrder ? onSelectOrder(e.target.value) : undefined}
              className="py-1.5 px-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-slate-50 outline-none"
            >
              {quickDeliveryOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.order_code} ({o.status === 'delivered' ? 'डिलीवर ✓' : 'चालू ⚡'})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. Flipkart Delivery Status Card with Big ETA Banner */}
      <div className={`rounded-3xl p-6 sm:p-7 text-white shadow-lg relative overflow-hidden border ${
        activeOrder.status === 'delivered'
          ? 'bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 border-emerald-700'
          : activeOrder.status === 'out_for_delivery'
          ? 'bg-gradient-to-r from-indigo-950 via-purple-900 to-slate-900 border-purple-500'
          : activeOrder.status === 'photo_price_uploaded'
          ? 'bg-gradient-to-r from-amber-950 via-orange-900 to-slate-900 border-amber-600'
          : 'bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-blue-800'
      }`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white text-slate-950 flex items-center gap-1.5 shadow-sm">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                SafarGo 15-Minute Rural Express
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white">
                {activeOrder.city} • {activeOrder.distance_km} KM
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black">
              {activeOrder.status === 'delivered' && '🎉 ऑर्डर सफलतापूर्वक डिलीवर हो चुका है!'}
              {activeOrder.status === 'out_for_delivery' && '⚡ एजेंट रास्ते में है - 15 मिनट में डिलीवरी!'}
              {activeOrder.status === 'photo_price_uploaded' && '📸 एजेंट ने दुकान से बिल व फोटो भेजी है - पुष्टि करें!'}
              {activeOrder.status === 'agent_assigned' && '🚴 एजेंट नजदीकी दुकान पर रवाना (5 मिनट टाइमर चालू)'}
              {activeOrder.status === 'placed' && '⏳ नजदीकी एजेंट को ऑर्डर असाइन किया जा रहा है...'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
              सामान: <strong>{activeOrder.items_description}</strong>
            </p>
          </div>

          {/* Live Timer Widget */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-center shrink-0 min-w-[180px]">
            {activeOrder.status === 'delivered' ? (
              <div className="space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <span className="text-xs font-bold text-emerald-200">सफलतापूर्वक पूर्ण</span>
                <span className="block text-[10px] text-white/70">100% सुरक्षित डिलीवरी</span>
              </div>
            ) : activeOrder.status === 'out_for_delivery' ? (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black text-amber-300 block tracking-wider animate-pulse">
                  ⚡ 15-मिनट डिलीवरी टाइमर
                </span>
                <div className="text-2xl sm:text-3xl font-mono font-black text-white">
                  {formatTimer(deliverySecondsLeft)}
                </div>
                <span className="text-[10px] text-emerald-300 block">एजेंट आपके घर पहुँच रहा है</span>
              </div>
            ) : activeOrder.status === 'photo_price_uploaded' ? (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black text-amber-300 block tracking-wider">
                  ⚠️ आपकी स्वीकृति अपेक्षित
                </span>
                <span className="text-xs font-bold text-white block">बिल देखकर 'स्वीकार' करें</span>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black text-blue-300 block tracking-wider">
                  ⏱️ 5-मिनट स्टोर टाइमर
                </span>
                <div className="text-2xl font-mono font-black text-white">
                  {formatTimer(storeSecondsLeft)}
                </div>
                <span className="text-[10px] text-slate-300 block">सामान व बिल फोटो आने वाली है</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. FLIPKART MULTI-STEP TIMELINE (THE CORE USER REQUIREMENT) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" />
              <span>फ्लिपकार्ट स्टाइल ऑर्डर ट्रैकिंग स्टेप्स (Flipkart Order Tracker)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              5-चरणीय लाइव पारदर्शी डिलीवरी ट्रैकर - 5 मिनट पिकअप से 15 मिनट डिलीवरी तक
            </p>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-black rounded-full border border-emerald-200">
            लाइव अपडेट चालू ✓
          </span>
        </div>

        {/* Stepper Timeline List */}
        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">

          {/* STEP 1: ORDER PLACED (1 Step Order) */}
          <div className="relative flex items-start gap-4">
            <div className={`absolute -left-6 sm:-left-8 w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${
              isPlacedDone ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' : 'bg-slate-300 text-slate-700'
            }`}>
              <Check className="w-4 h-4" />
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>स्टेप 1: ऑर्डर दर्ज हुआ (Order Placed & Confirmed)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    सफल ✓
                  </span>
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  {new Date(activeOrder.created_at).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                सफ़ारगो सिस्टम में ऑर्डर सफलता से दर्ज हुआ। ग्राहक को ट्रैकिंग कोड <strong>{activeOrder.order_code}</strong> जारी किया गया।
              </p>
            </div>
          </div>

          {/* STEP 2: AGENT ASSIGNED & 5-MINUTE STORE TIMER (2 Step Agent Minute Timer) */}
          <div className="relative flex items-start gap-4">
            <div className={`absolute -left-6 sm:-left-8 w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${
              isAgentStoreDone
                ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                : isAgentStoreActive
                ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                : 'bg-slate-200 text-slate-600'
            }`}>
              {isAgentStoreDone ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>स्टेप 2: एजेंट असाइन व 5-मिनट स्टोर टाइमर (5-Min Pickup Timer)</span>
                  {isAgentStoreDone && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      पूर्ण ✓
                    </span>
                  )}
                  {isAgentStoreActive && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 animate-pulse">
                      ⏱️ 5 मिनट टाइमर चालू...
                    </span>
                  )}
                </h3>
                {activeOrder.agent_accepted_at && (
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(activeOrder.agent_accepted_at).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600">
                नजदीकी SafarGo एजेंट (<strong>{activeOrder.agent_name || 'कुलदीप धाकड़ / पवन वर्मा'}</strong>) 5 मिनट में नजदीकी लोकल दुकान पर पहुँचकर सामान व बिल की लाइव फोटो अपलोड करेगा।
              </p>

              {/* 5-Min Timer Badge if Active */}
              {isAgentStoreActive && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold">
                  <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                  <span>5-मिनट पिकअप टाइमर शेष:</span>
                  <span className="font-mono text-sm font-black text-amber-950">
                    {formatTimer(storeSecondsLeft)} मिनट
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* STEP 3: BILL & ITEM PHOTO ACCEPTANCE (after accept) */}
          <div className="relative flex items-start gap-4">
            <div className={`absolute -left-6 sm:-left-8 w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${
              isAcceptedDone
                ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                : isAcceptedActive
                ? 'bg-orange-500 text-white ring-4 ring-orange-200 animate-bounce'
                : 'bg-slate-200 text-slate-600'
            }`}>
              {isAcceptedDone ? <Check className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
            </div>

            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>स्टेप 3: सामान व बिल फोटो स्वीकृति (Customer Bill Approval)</span>
                  {isAcceptedDone && (
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>ग्राहक द्वारा बिल स्वीकृत (Accepted by Customer)</span>
                    </span>
                  )}
                  {isAcceptedActive && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-900 border border-orange-300 animate-pulse">
                      ⚠️ कृपया बिल स्वीकार करें
                    </span>
                  )}
                </h3>
                {activeOrder.customer_confirmed_at && (
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(activeOrder.customer_confirmed_at).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600">
                एजेंट ने दुकान से सामान की फोटो व वास्तविक बिल खींचा। ग्राहक द्वारा बिल की पुष्टि के बाद ही एजेंट डिलीवरी के लिए रवाना होता है।
              </p>

              {/* Photo & Acceptance Card */}
              {activeOrder.item_photo_url && (
                <div className={`p-4 rounded-2xl border-2 transition ${
                  isAcceptedDone
                    ? 'bg-emerald-50/70 border-emerald-300'
                    : 'bg-amber-50/90 border-amber-400 shadow-md'
                }`}>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <img
                      src={activeOrder.item_photo_url}
                      alt="Store Bill & Item"
                      onClick={() => setPhotoZoom(activeOrder.item_photo_url || null)}
                      className="w-24 h-24 object-cover rounded-xl border border-slate-300 shadow cursor-pointer hover:opacity-90 shrink-0"
                    />
                    <div className="flex-1 space-y-1 text-xs">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <Store className="w-4 h-4 text-indigo-600" />
                        <span>दुकानदार का वास्तविक बिल व सामान</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="text-slate-600">सामान का मूल्य: <strong>₹{activeOrder.actual_item_price}</strong></div>
                        <div className="text-slate-600">डिलीवरी शुल्क ({activeOrder.distance_km} KM): <strong>₹{activeOrder.delivery_fee}</strong></div>
                      </div>
                      <div className="text-sm font-black text-slate-900 pt-0.5">
                        कुल देय राशि: ₹{activeOrder.total_order_amount} (कैश ऑन डिलीवरी / UPI)
                      </div>
                    </div>
                  </div>

                  {/* Accept Action Button */}
                  {isAcceptedActive && (
                    <div className="mt-3 pt-3 border-t border-amber-200">
                      <button
                        onClick={() => handleCustomerAccept(activeOrder.id)}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 hover:from-emerald-700 hover:to-indigo-800 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                      >
                        <Check className="w-4 h-4" />
                        <span>बिल व फोटो सही है - स्वीकार करें (Accept Bill & Dispatch)</span>
                      </button>
                    </div>
                  )}

                  {isAcceptedDone && (
                    <div className="mt-2 text-[11px] text-emerald-800 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>बिल ग्राहक द्वारा सफलतापूर्वक स्वीकार किया गया (After Accept ✓)</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* STEP 4: OUT FOR DELIVERY WITH 15-MINUTE TIMER */}
          <div className="relative flex items-start gap-4">
            <div className={`absolute -left-6 sm:-left-8 w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${
              isOutForDeliveryDone
                ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                : isOutForDeliveryActive
                ? 'bg-indigo-600 text-white ring-4 ring-indigo-200 animate-pulse'
                : 'bg-slate-200 text-slate-600'
            }`}>
              {isOutForDeliveryDone ? <Check className="w-4 h-4" /> : <Bike className="w-4 h-4" />}
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>स्टेप 4: डिलीवरी के लिए रवाना (Out for Delivery - 15-Min Timer)</span>
                  {isOutForDeliveryDone && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      पूर्ण ✓
                    </span>
                  )}
                  {isOutForDeliveryActive && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 animate-pulse">
                      ⚡ 15 मिनट काउंटडाउन चालू...
                    </span>
                  )}
                </h3>
              </div>

              <p className="text-xs text-slate-600">
                बिल स्वीकृति के बाद एजेंट बाइक से आपके दिए गए पते की ओर निकल चुका है। 15-मिनट की गारंटी समय सीमा में डिलीवरी होगी।
              </p>

              {/* 15-Min Countdown Box */}
              {isOutForDeliveryActive && (
                <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <Bike className="w-5 h-5 text-indigo-400 animate-bounce" />
                    <div className="text-xs">
                      <span className="font-bold text-indigo-200 block">एजेंट आपके रास्ते में है</span>
                      <span className="text-[10px] text-slate-300">कृपया अपना फोन चालू रखें</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-indigo-300 uppercase block font-black">समय शेष:</span>
                    <span className="font-mono font-black text-base text-emerald-400">
                      ⚡ {formatTimer(deliverySecondsLeft)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* STEP 5: DELIVERED (Order Completed) */}
          <div className="relative flex items-start gap-4">
            <div className={`absolute -left-6 sm:-left-8 w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${
              isDeliveredDone ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' : 'bg-slate-200 text-slate-600'
            }`}>
              <CheckCircle2 className="w-4 h-4" />
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>स्टेप 5: सफलतापूर्वक डिलीवर हुआ (Delivered)</span>
                  {isDeliveredDone ? (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      संपन्न ✓
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      प्रतीक्षारत...
                    </span>
                  )}
                </h3>
                {activeOrder.delivered_at && (
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(activeOrder.delivered_at).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600">
                सामान ग्राहक को सुरक्षित सौंपा गया। SafarGo 15-मिनट सेवा चुनने के लिए धन्यवाद!
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Flipkart-Style Information Cards Grid (Rider, Shop, Items, Address, Price) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Card A: Delivery Rider Details (Flipkart Executive Card) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Bike className="w-4 h-4 text-indigo-600" />
              <span>सफ़ारगो डिलीवरी राइडर (Rider Details)</span>
            </h4>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              वेरिफाइड ✓
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-base shadow-xs">
                🚴
              </div>
              <div>
                <strong className="text-sm font-black text-slate-900 block">
                  {activeOrder.agent_name || 'पवन कुमार वर्मा (SafarGo Agent)'}
                </strong>
                <span className="text-xs text-slate-500 font-mono">
                  +91 {activeOrder.agent_mobile || '9450123456'}
                </span>
                <span className="text-[10px] text-indigo-600 font-bold block">
                  15-मिनट बाइक एक्सप्रेस डिलीवरी पार्टनर
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${activeOrder.agent_mobile || '9450123456'}`}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
                title="कॉल करें"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/91${activeOrder.agent_mobile || '9450123456'}?text=${encodeURIComponent(`नमस्ते, मैं SafarGo ऑर्डर ${activeOrder.order_code} के संबंध में संपर्क कर रहा हूँ।`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition"
                title="WhatsApp चैट"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl text-[11px] text-slate-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>एजेंट का आधार एवं पुलिस वेरिफिकेशन SafarGo द्वारा सत्यापित है।</span>
          </div>
        </div>

        {/* Card B: Shipping Address (Flipkart Style) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>डिलीवरी का पता (Delivery Address)</span>
            </h4>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
              {activeOrder.city}
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="font-black text-slate-900 text-sm">{activeOrder.customer_name}</div>
            <div className="text-slate-600 font-mono">+91 {activeOrder.customer_mobile}</div>
            <div className="text-slate-700 pt-1 leading-relaxed">
              {activeOrder.customer_address}, {activeOrder.city}, मध्य प्रदेश
            </div>
            <div className="text-[11px] text-slate-500 pt-1">
              दूरी: <strong>{activeOrder.distance_km} KM</strong> (निकटतम हब से)
            </div>
          </div>
        </div>

        {/* Card C: Items Ordered & Store Source */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-indigo-600" />
              <span>ऑर्डर किया गया सामान (Items Ordered)</span>
            </h4>
            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
              {activeOrder.pickup_mode === 'partner_shop' ? 'पार्टनर दुकान' : 'लोकल कंसीयर्ज'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block">सामानों की सूची:</span>
              <p className="font-bold text-slate-900 mt-0.5">{activeOrder.items_description}</p>
            </div>
            <div className="flex items-center justify-between text-slate-600 text-[11px] px-1">
              <span>दुकान स्रोत:</span>
              <strong className="text-slate-900">{activeOrder.partner_shop_name || 'नजदीकी अधिकृत दुकान'}</strong>
            </div>
          </div>
        </div>

        {/* Card D: Flipkart-Style Price Breakdown Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>मूल्य विवरण (Flipkart Price Breakdown)</span>
            </h4>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              कैश / UPI ऑन डिलीवरी
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>सामान का मूल्य (दुकान बिल अनुसार):</span>
              <strong className="text-slate-900">₹{activeOrder.actual_item_price || 'बिल प्रतीक्षारत'}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>15-मिनट डिलीवरी शुल्क ({activeOrder.distance_km} KM):</span>
              <strong className="text-slate-900">₹{activeOrder.delivery_fee}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>SafarGo सुविधा शुल्क:</span>
              <span className="text-emerald-600 font-bold">मुफ़्त (₹0)</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>कुल देय राशि (Total Amount):</span>
              <span className="text-emerald-700 font-black text-base">
                ₹{activeOrder.total_order_amount || activeOrder.delivery_fee}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 5. Real SafarGo Delivery Assurance & Support Desk */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 rounded-3xl p-5 border border-emerald-200 text-xs flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
              <span>SafarGo 15-मिनट सुरक्षित डिलीवरी गारंटी</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                100% Verified
              </span>
            </h4>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
              राइडर नजदीकी सत्यापित दुकान से असली पक्का बिल और सामान लेकर 15 मिनट में आपके पते पर पहुंचेगा। सामान हाथ में मिलने और जांचने के बाद ही नकद (COD) या UPI से भुगतान करें।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <a
            href="https://wa.me/919876543210?text=नमस्ते%20SafarGo%20टीम,%20मुझे%20अपने%20क्विक%20डिलीवरी%20ऑर्डर%20के%20बारे%20में%20सहायता%20चाहिए।"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <MessageSquare className="w-4 h-4" />
            <span>सफ़ारगो हेल्पलाइन (WhatsApp)</span>
          </a>
        </div>
      </div>

      {/* Full Photo Zoom Modal */}
      {photoZoom && (
        <div
          onClick={() => setPhotoZoom(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-pointer animate-fadeIn"
        >
          <div className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden p-2">
            <img src={photoZoom} alt="Zoomed Receipt" className="w-full h-auto rounded-xl object-contain" />
            <p className="text-center text-xs text-slate-500 py-2">क्लिक करके बंद करें</p>
          </div>
        </div>
      )}
    </div>
  );
};
