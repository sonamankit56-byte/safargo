import React, { useState, useEffect } from 'react';
import { QuickDeliveryOrder } from '../../types';
import {
  CheckCircle2,
  Sparkles,
  Zap,
  Bike,
  Clock,
  MapPin,
  ArrowRight,
  Copy,
  Check,
  X,
  Store,
  ShieldCheck,
  Package
} from 'lucide-react';

interface OrderPlacedCelebrationModalProps {
  isOpen: boolean;
  order: QuickDeliveryOrder | null;
  onClose: () => void;
  onTrackOrder: (orderId: string) => void;
}

export const OrderPlacedCelebrationModal: React.FC<OrderPlacedCelebrationModalProps> = ({
  isOpen,
  order,
  onClose,
  onTrackOrder,
}) => {
  const [copied, setCopied] = useState(false);
  const [particles, setParticles] = useState<
    { id: number; left: number; top: number; delay: number; color: string; size: number }[]
  >([]);

  useEffect(() => {
    if (isOpen) {
      // Generate celebratory particles
      const colors = ['#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6', '#14B8A6'];
      const newParticles = Array.from({ length: 24 }).map((_, i) => ({
        id: i,
        left: Math.random() * 95,
        top: Math.random() * 85,
        delay: Math.random() * 1.5,
        color: colors[i % colors.length],
        size: Math.floor(Math.random() * 8) + 6,
      }));
      setParticles(newParticles);
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(order.order_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      {/* Celebration Confetti Floating Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {particles.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full animate-ping opacity-75"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              animationDuration: `${2 + (p.delay % 2)}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-xl bg-white rounded-3xl shadow-2xl border-2 border-emerald-400 overflow-hidden transform transition-all my-8">
        {/* Top Festive Header with Glowing Badges */}
        <div className="relative bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-900 p-6 sm:p-8 text-white text-center overflow-hidden">
          {/* Background Glow Circles */}
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Big Animated Success Checkmark Ring */}
          <div className="relative mx-auto w-24 h-24 mb-4 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping" />
            <div className="absolute inset-1 rounded-full bg-emerald-300/40 animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-2xl border-4 border-emerald-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
            <div className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 p-1.5 rounded-full shadow-lg">
              <Sparkles className="w-4 h-4 fill-slate-950" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider mb-2 shadow-md">
            <Zap className="w-3.5 h-3.5 fill-slate-950" />
            <span>15-मिनट एक्सप्रेस डिलीवरी बुक हुई</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            बधाई हो! ऑर्डर दर्ज हो गया है 🎉
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-md mx-auto mt-1">
            सफ़ारगो एजेंट <strong>5 मिनट में नजदीकी दुकान से सामान लेकर 15 मिनट में आपके घर</strong> पहुँचाने के लिए तैयार है!
          </p>

          {/* Order Code Pill */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/80 backdrop-blur-sm border border-emerald-300/40 shadow-inner">
            <span className="text-[11px] text-emerald-300 font-semibold">ऑर्डर आईडी:</span>
            <span className="font-mono font-black text-sm text-white tracking-wider">
              {order.order_code}
            </span>
            <button
              onClick={handleCopyCode}
              className="ml-1 p-1 hover:text-emerald-300 transition text-slate-300"
              title="ऑर्डर कोड कॉपी करें"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Modal Body - Order & 2-Stage Delivery Promise */}
        <div className="p-6 space-y-5 bg-slate-50">
          {/* 2-Step Live Guarantee Visual */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>सफ़ारगो 2-स्टेज सुपरफ़ास्ट डिलीवरी टाइमलाइन</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-black">
                    1
                  </span>
                  <span>5-मिनट स्टोर टाइमर</span>
                </div>
                <p className="text-[11px] text-amber-800 mt-1 leading-snug">
                  एजेंट 5 मिनट में दुकान पहुंचेगा व सामान + बिल की लाइव फोटो भेजेगा।
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">
                    2
                  </span>
                  <span>15-मिनट डिलीवरी टाइमर</span>
                </div>
                <p className="text-[11px] text-emerald-800 mt-1 leading-snug">
                  फोटो स्वीकृति मिलते ही 15 मिनट में आपके घर पर डिलीवरी!
                </p>
              </div>
            </div>
          </div>

          {/* Order Snapshot Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2.5 text-xs">
            <div className="flex justify-between items-start pb-2 border-b border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 block">ऑर्डर किया गया सामान:</span>
                <strong className="text-slate-900 text-sm font-black">
                  {order.items_description}
                </strong>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">अनुमानित डिलीवरी शुल्क:</span>
                <strong className="text-emerald-700 text-sm font-black">
                  ₹{order.delivery_fee}
                </strong>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
              <div>
                <span className="text-[10px] text-slate-400 block">ग्राहक का नाम:</span>
                <span className="font-semibold text-slate-800">{order.customer_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">मोबाइल नंबर:</span>
                <span className="font-mono font-semibold text-slate-800">+91 {order.customer_mobile}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-slate-400 block">डिलीवरी पता:</span>
                <div className="flex items-center gap-1 text-slate-700 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>{order.customer_address}, {order.city} ({order.distance_km} KM)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                onTrackOrder(order.id);
                onClose();
              }}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 hover:from-emerald-700 hover:to-indigo-800 text-white font-black text-sm shadow-xl hover:shadow-2xl transition transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Package className="w-5 h-5" />
              <span>📦 लाइव आर्डर ट्रैक करें (Flipkart Style Tracker)</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              नया ऑर्डर करें / बंद करें
            </button>
          </div>
        </div>

        {/* Security & Support Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>SafarGo 100% वेरिफाइड लोकल डिलीवरी गारंटी</span>
          </div>
          <span className="font-semibold text-slate-600">हेल्पलाइन: 1800-SAFARGO</span>
        </div>
      </div>
    </div>
  );
};
