import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { PromoCode } from '../../types';
import {
  Tag,
  Gift,
  Copy,
  Check,
  X,
  MessageSquare,
  Bus,
  Bike,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';

interface AgentOffersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyInBooking?: (code: string) => void;
}

export const AgentOffersModal: React.FC<AgentOffersModalProps> = ({
  isOpen,
  onClose,
  onApplyInBooking,
}) => {
  const { currentUser } = useAuth();
  const { promoCodes } = useData();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter promos applicable to this agent
  const activePromos = promoCodes.filter(
    (p) =>
      p.is_active &&
      (p.applicable_to === 'all_agents' ||
        p.applicable_to === 'all_customers' ||
        p.assigned_agent_id === currentUser?.id)
  );

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  एजेंट स्पेशल इंसेंटिव
                </span>
                <span className="text-xs text-slate-400 font-bold">
                  {activePromos.length} ऑफर्स उपलब्ध
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                सफ़ारगो एक्टिव प्रोमो कोड्स एवं ऑफर्स
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Value Proposition Callout */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 text-xs text-amber-950 flex items-start gap-3">
          <span className="text-xl">💰</span>
          <div className="space-y-0.5">
            <strong className="block font-black text-amber-950">
              यात्री को छूट दिलाएं और खुद अतिरिक्त नकद बोनस कमाएं!
            </strong>
            <p className="text-amber-900 text-[11px] leading-relaxed">
              नीचे दिए गए प्रोमो कोड्स को अपने व्हाट्सएप ग्रुप्स या यात्रियों के साथ शेयर करें। जब भी यह कोड आपकी बुकिंग में लगेगा, यात्री को तुरंत छूट मिलेगी और आपके वॉलेट में अतिरिक्त इंसेंटिव जुड़ेगा!
            </p>
          </div>
        </div>

        {/* Promos Grid */}
        <div className="space-y-3.5 max-h-[55vh] overflow-y-auto pr-1">
          {activePromos.length === 0 ? (
            <div className="p-8 text-center text-slate-400 border border-slate-200 rounded-2xl">
              <Tag className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-semibold">फिलहाल कोई सक्रिय प्रोमो कोड उपलब्ध नहीं है।</p>
            </div>
          ) : (
            activePromos.map((promo) => (
              <div
                key={promo.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-slate-200 hover:border-indigo-400 transition shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-base px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl flex items-center gap-1.5">
                      <Tag className="w-4 h-4" />
                      <span>{promo.code}</span>
                    </span>

                    <button
                      onClick={() => handleCopy(promo.code)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                      title="कोड कॉपी करें"
                    >
                      {copiedCode === promo.code ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                      {promo.discount_type === 'flat' ? `₹${promo.discount_value} फ्लैट छूट` : `${promo.discount_value}% छूट`}
                    </span>

                    {promo.agent_extra_incentive > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                        +₹{promo.agent_extra_incentive} एजेंट बोनस
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-black text-slate-900 text-sm">{promo.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{promo.description}</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1">
                  <span>न्यूनतम टिकट/ऑर्डर: <strong>₹{promo.min_order_amount}</strong></span>
                  <span>सेवा: <strong>{promo.applicable_service === 'bus_booking' ? 'बस बुकिंग' : promo.applicable_service === 'quick_delivery' ? '15-मिनट डिलीवरी' : 'सभी सेवाएं'}</strong></span>
                  <span>वैधता: <strong>{new Date(promo.valid_until).toLocaleDateString('hi-IN')} तक</strong></span>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  {onApplyInBooking && (
                    <button
                      type="button"
                      onClick={() => {
                        onApplyInBooking(promo.code);
                        onClose();
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Bus className="w-3.5 h-3.5" />
                      <span>बुकिंग फॉर्म में लागू करें</span>
                    </button>
                  )}

                  {/* 1-Click WhatsApp Share for passengers */}
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`नमस्ते! SafarGo बस बुकिंग पर विशेष डिस्काउंट ऑफर!\n\n🎟️ प्रोमो कोड: *${promo.code}*\n💰 फायदा: ${promo.discount_type === 'flat' ? `₹${promo.discount_value} की फ्लैट छूट` : `${promo.discount_value}% डिस्काउंट`}\n\nआज ही अपनी बस टिकट बुक कराएं: अधिकृत एजेंट ${currentUser?.full_name || 'SafarGo Agent'} (मो. ${currentUser?.mobile || ''})\nवेबसाइट: https://safargo.in`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>यात्रियों को WhatsApp पर भेजें</span>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>SafarGo अधिकृत प्रोमो पार्टनर नेटवर्क</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
          >
            बंद करें
          </button>
        </div>

      </div>
    </div>
  );
};
