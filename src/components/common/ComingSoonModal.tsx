import React from 'react';
import { Sparkles, Clock, X, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  featureDescription?: string;
  supportWhatsapp?: string;
}

export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  isOpen,
  onClose,
  featureName,
  featureDescription,
  supportWhatsapp = '919876543210'
}) => {
  if (!isOpen) return null;

  const defaultDescription =
    'प्रिय साथी, यह सेवा SafarGo पर बहुत जल्द आपके क्षेत्र में शुरू होने जा रही है। हमारी तकनीकी एवं ऑपरेशन्स टीम इसे लाइव करने की अंतिम तैयारी कर रही है!';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-amber-200 overflow-hidden transform transition-all">
        {/* Amber Gradient Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner mb-3">
            <Clock className="w-7 h-7 text-white animate-pulse" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white text-orange-700 shadow-xs mb-2">
            <Sparkles className="w-3 h-3 text-orange-500" />
            ⏳ जल्द आ रहा है (Coming Soon)
          </span>

          <h3 className="text-xl font-black text-white drop-shadow-xs">
            {featureName || 'यह सुविधा जल्द उपलब्ध होगी'}
          </h3>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 leading-relaxed space-y-2">
            <p className="font-semibold">
              {featureDescription || defaultDescription}
            </p>
            <p className="text-[11px] text-amber-800">
              जैसे ही यह सेवा लाइव होगी, आप सीधे अपने डैशबोर्ड या होमपेज से इसका उपयोग कर सकेंगे।
            </p>
          </div>

          <div className="space-y-2.5">
            <a
              href={`https://wa.me/${supportWhatsapp}?text=${encodeURIComponent(
                `नमस्ते SafarGo टीम, मुझे '${featureName}' सेवा शुरू होने पर कृपया WhatsApp पर सूचित करें।`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>लांच होने पर मुझे WhatsApp पर बताएं (Notify Me)</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
            >
              समझ गया (Close)
            </button>
          </div>

          <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
            <span>SafarGo आधिकारिक नेटवर्क — 'अब हर सफर होगा आसान'</span>
          </div>
        </div>
      </div>
    </div>
  );
};
