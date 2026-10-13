import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { QuickDeliveryOrder } from '../../types';
import {
  Bike,
  Clock,
  Camera,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  MapPin,
  Phone,
  Store,
  Sparkles,
  AlertCircle,
  Upload,
  Check,
  X,
  ExternalLink
} from 'lucide-react';

export const AgentDeliveryDesk: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    quickDeliveryOrders,
    agentQuickDeliveryOrders,
    agentAcceptDeliveryOrder,
    agentUploadDeliveryPhotoAndPrice,
    completeDeliveryOrder,
  } = useData();
  const { success, error, info } = useToast();

  // Photo & Bill Upload Modal State
  const [selectedOrderForUpload, setSelectedOrderForUpload] = useState<QuickDeliveryOrder | null>(null);
  const [actualItemPrice, setActualItemPrice] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // Sample quick images for local grocery & medical bills
  const samplePhotoUrls = [
    { label: 'किराना सामान व बिल', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80' },
    { label: 'मेडिकल दवाई व पर्ची', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80' },
    { label: 'डेयरी दूध-पनीर पैकेट', url: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=400&q=80' },
  ];

  const availableOrders = quickDeliveryOrders.filter((o) => o.status === 'placed');
  const myActiveOrders = quickDeliveryOrders.filter(
    (o) => o.agent_id === currentUser?.id && o.status !== 'delivered' && o.status !== 'cancelled'
  );
  const myCompletedOrders = quickDeliveryOrders.filter(
    (o) => o.agent_id === currentUser?.id && o.status === 'delivered'
  );

  const totalDeliveryEarnings = myCompletedOrders.reduce((sum, o) => sum + (o.agent_payout || 0), 0);

  const handleOpenUploadModal = (order: QuickDeliveryOrder) => {
    setSelectedOrderForUpload(order);
    setActualItemPrice('');
    setPhotoUrl(samplePhotoUrls[0].url);
  };

  const handleSavePhotoAndPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForUpload) return;
    if (!actualItemPrice || Number(actualItemPrice) <= 0) {
      error('Invalid Price', 'कृपया दुकान से खरीदे गए सामान का वास्तविक बिल मूल्य दर्ज करें।');
      return;
    }

    const img = photoUrl.trim() || samplePhotoUrls[0].url;
    await agentUploadDeliveryPhotoAndPrice(selectedOrderForUpload.id, img, Number(actualItemPrice));
    setSelectedOrderForUpload(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-sm">
                <Bike className="w-4 h-4" />
                नजदीकी डिलीवरी पार्टनर
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-300 border border-white/10">
                अतिरिक्त कमाई (₹18 से ₹50+ प्रति डिलीवरी)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              अपने नजदीकी ऑर्डर डिलीवर करें और अतिरिक्त कमाई करें
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              बस टिकट बुकिंग के साथ-साथ अपने शहर/कस्बे में नजदीकी दुकान से किराना, मेडिकल व जरूरी सामान पहुंचाकर अतिरिक्त कमाई करें। दुकान से बिल फोटो अपलोड करें और ग्राहक की पुष्टि के बाद ऑर्डर डिलीवर करें।
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
              <div className="text-xs text-slate-300">कुल डिलीवरी कमाई</div>
              <div className="text-2xl font-black text-emerald-400">₹{totalDeliveryEarnings}</div>
              <div className="text-[10px] text-emerald-300 font-semibold">वॉलेट में क्रेडिटेड</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
              <div className="text-xs text-slate-300">पूर्ण डिलीवरी</div>
              <div className="text-2xl font-black text-amber-400">{myCompletedOrders.length}</div>
              <div className="text-[10px] text-slate-300">सफल ऑर्डर्स</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Structure Reminder */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-xs text-indigo-950 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            <strong>आपकी कमाई दरें:</strong> 0-2 KM: <strong>₹18</strong> | 2-4 KM: <strong>₹34</strong> | 4-6 KM: <strong>₹50</strong> | 6+ KM: <strong>+₹8/KM</strong>
          </span>
        </div>
        <span className="text-[11px] font-bold text-indigo-700 bg-white px-3 py-1 rounded-lg border border-indigo-200 shrink-0">
          डिलीवरी पूर्ण होते ही तुरंत वॉलेट में राशि!
        </span>
      </div>

      {/* Section 1: Active In-Progress Deliveries */}
      {myActiveOrders.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            आपकी चालू डिलीवरी ({myActiveOrders.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myActiveOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-5 border-2 border-indigo-500 shadow-md space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-indigo-700">
                    {order.order_code}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-800">
                    {order.status === 'agent_assigned' && 'चरण 1: दुकान जाकर बिल फोटो भेजें (5 Min)'}
                    {order.status === 'photo_price_uploaded' && 'चरण 2: ग्राहक पुष्टि की प्रतीक्षा'}
                    {order.status === 'out_for_delivery' && 'चरण 3: 15-मिनट में घर पहुँचाएं ⚡'}
                  </span>
                </div>

                <div className="text-xs text-slate-700 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div><strong>ग्राहक:</strong> {order.customer_name} ({order.customer_mobile})</div>
                  <div><strong>पता:</strong> {order.customer_address}, {order.city}</div>
                  <div><strong>सामान:</strong> {order.items_description}</div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                    <span>दूरी: <strong>{order.distance_km} KM</strong></span>
                    <span className="font-bold text-emerald-700">आपकी कमाई: +₹{order.agent_payout}</span>
                  </div>
                </div>

                {/* Actions based on step */}
                {order.status === 'agent_assigned' && (
                  <button
                    onClick={() => handleOpenUploadModal(order)}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    <Camera className="w-4 h-4" />
                    <span>दुकान से सामान व बिल की फोटो अपलोड करें (5 Min Step)</span>
                  </button>
                )}

                {order.status === 'photo_price_uploaded' && (
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-800 text-center">
                    फोटो व बिल ग्राहक को भेज दिया गया है। जैसे ही ग्राहक "स्वीकार करें" दबाएगा, 15-मिनट डिलीवरी शुरू होगी।
                  </div>
                )}

                {order.status === 'out_for_delivery' && (
                  <div className="space-y-2">
                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Bike className="w-4 h-4 text-emerald-600" />
                        ग्राहक ने बिल स्वीकार कर लिया!
                      </span>
                      <span className="font-bold text-emerald-800">
                        कुल कैश लेना: ₹{order.total_order_amount}
                      </span>
                    </div>

                    <button
                      onClick={() => completeDeliveryOrder(order.id)}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>सामान पहुँचा दिया (Mark Delivered & Claim ₹{order.agent_payout})</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Available Delivery Orders to Accept */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Bike className="w-5 h-5 text-emerald-600" />
            नए उपलब्ध डिलीवरी ऑर्डर्स ({availableOrders.length})
          </h2>
          <span className="text-xs text-slate-500">5 मिनट के अंदर स्वीकार करें</span>
        </div>

        {availableOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center text-slate-400">
            <Bike className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium">फिलहाल कोई नया डिलीवरी ऑर्डर उपलब्ध नहीं है</p>
            <p className="text-xs text-slate-400 mt-1">जैसे ही आपके क्षेत्र में कोई ग्राहक ऑर्डर करेगा, यहाँ अलर्ट दिखेगा।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-700">
                      {order.order_code}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      5 मिनट पिकअप
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 space-y-1">
                    <div><strong>ग्राहक:</strong> {order.customer_name} ({order.customer_mobile})</div>
                    <div><strong>पता:</strong> {order.customer_address}, {order.city}</div>
                    <div><strong>सामान:</strong> {order.items_description}</div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400">दूरी:</span> <strong>{order.distance_km} KM</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">आपकी कमाई:</span> <strong className="text-emerald-700 text-sm font-black">+₹{order.agent_payout}</strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => agentAcceptDeliveryOrder(order.id)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                >
                  <Check className="w-4 h-4" />
                  <span>ऑर्डर स्वीकार करें (Accept Order)</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: Upload Photo & Bill Price */}
      {selectedOrderForUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-indigo-600" />
                सामान व बिल फोटो अपलोड करें
              </h3>
              <button onClick={() => setSelectedOrderForUpload(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              ऑर्डर: <strong className="font-mono text-indigo-600">{selectedOrderForUpload.order_code}</strong> | सामान: {selectedOrderForUpload.items_description}
            </p>

            <form onSubmit={handleSavePhotoAndPrice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  दुकान के वास्तविक बिल का कुल मूल्य (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={actualItemPrice}
                  onChange={(e) => setActualItemPrice(e.target.value)}
                  placeholder="उदा. 240 (दुकानदार का बिल)"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  सामान व पर्ची की फोटो चुनें / अपलोड करें *
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {samplePhotoUrls.map((sp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoUrl(sp.url)}
                      className={`p-1 rounded-xl border transition ${
                        photoUrl === sp.url ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-slate-200'
                      }`}
                    >
                      <img src={sp.url} alt={sp.label} className="w-full h-14 object-cover rounded-lg" />
                      <div className="text-[10px] font-bold text-slate-700 mt-1 truncate">{sp.label}</div>
                    </button>
                  ))}
                </div>

                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="अथवा फोटो URL दर्ज करें"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex justify-between font-bold">
                <span>ग्राहक से कुल प्राप्त होगा:</span>
                <span className="text-indigo-700 font-mono text-sm">
                  ₹{Number(actualItemPrice || 0) + selectedOrderForUpload.delivery_fee}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForUpload(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  ग्राहक को पुष्टि हेतु भेजें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
