import React from 'react';
import { SafarGoLogo } from './SafarGoLogo';
import {
  X,
  ShieldCheck,
  Award,
  Users,
  Building,
  Heart,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface AboutSafarGoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutSafarGoModal: React.FC<AboutSafarGoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 my-8 max-h-[90vh] flex flex-col text-xs">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <SafarGoLogo size="sm" variant="light" showTagline={false} />
            <div>
              <h2 className="font-black text-sm sm:text-base">सफ़ारगो के बारे में (About SafarGo)</h2>
              <span className="text-[10px] text-orange-400 font-bold block">"अब हर सफर होगा आसान"</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 leading-relaxed text-slate-700">
          
          {/* Mission Card */}
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 space-y-1.5 text-orange-950">
            <span className="text-[10px] font-black uppercase tracking-wider bg-orange-200 text-orange-900 px-2 py-0.5 rounded-full inline-block">
              हमारा विज़न (Our Mission)
            </span>
            <h3 className="font-black text-sm">
              ग्रामीण जन सेवा केंद्र (CSC) व दुकानदारों को अधिकृत बस टिकटिंग से सशक्त बनाना
            </h3>
            <p className="text-xs text-orange-900 font-medium">
              SafarGo भारत का पहला समर्पित ग्रामीण व कस्बाई बस टिकटिंग एवं डिलीवरी नेटवर्क है। हम स्थानीय युवाओं और जन सेवा केंद्रों को अधिकृत एजेंट बनाकर ₹19.34 प्रति टिकट कमीशन और स्थानीय डिलीवरी से रोजगार प्रदान करते हैं।
            </p>
          </div>

          {/* Key Pillars */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <strong className="block text-slate-900 font-black">100% ऑन-टाइम गारंटी</strong>
              <p className="text-[11px] text-slate-500">
                ऑपरेटरों के साथ सीधा अनुबंध और लाइव GPS ट्रैकिंग।
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <Award className="w-5 h-5 text-amber-600" />
              <strong className="block text-slate-900 font-black">सरकारी RTC पार्टनर</strong>
              <p className="text-[11px] text-slate-500">
                MPSRTC, UPSRTC, RSRTC व प्राइवेट फ्लीट से सीधे जुड़े।
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <Lock className="w-5 h-5 text-blue-600" />
              <strong className="block text-slate-900 font-black">सुरक्षित भुगतान</strong>
              <p className="text-[11px] text-slate-500">
                एजेंट वॉलेट व UPI के जरिए 1-क्लिक सुरक्षित लेनदेन।
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <Users className="w-5 h-5 text-purple-600" />
              <strong className="block text-slate-900 font-black">स्थानीय डिलीवरी सपोर्ट</strong>
              <p className="text-[11px] text-slate-500">
                नजदीकी स्टोर से किराना व मेडिकल डिलीवरी से अतिरिक्त कमाई।
              </p>
            </div>
          </div>

          {/* Contact & Support */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
            <strong className="block font-black text-xs text-orange-400 uppercase tracking-wider">
              संपर्क एवं आधिकारिक सहायता केंद्र (Customer Helpdesk)
            </strong>
            <div className="space-y-1 text-slate-300 text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>मुख्यालय: MP नगर जोन-1, भोपाल (मध्य प्रदेश) - 462011</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>हेल्पलाइन: +91 98765 43210 (24x7 WhatsApp & Call)</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>सहायता समय: सुबह 06:00 बजे से रात 11:30 बजे तक</span>
              </div>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs transition cursor-pointer"
          >
            समझ आ गया (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
