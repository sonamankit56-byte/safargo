import React, { useState } from 'react';
import { 
  AlertTriangle, 
  PhoneCall, 
  X, 
  ShieldAlert, 
  Share2, 
  MapPin, 
  CheckCircle2,
  Phone
} from 'lucide-react';
import { useTravel } from '../../context/TravelContext';

interface EmergencySosModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingDetails?: any;
}

export const EmergencySosModal: React.FC<EmergencySosModalProps> = ({
  isOpen,
  onClose,
  bookingDetails
}) => {
  const { t } = useTravel();
  const [isAlertSent, setIsAlertSent] = useState(false);

  if (!isOpen) return null;

  const handleShareLocation = () => {
    const text = 
      `🚨 *SAFARGO आपातकालीन सुरक्षा अलर्ट (EMERGENCY SOS)* 🚨\n\n` +
      `मुझे यात्रा के दौरान तत्काल सहायता की आवश्यकता है!\n\n` +
      `📌 *PNR*: ${bookingDetails?.pnr || 'SFG-EMERGENCY'}\n` +
      `🚌 *बस*: ${bookingDetails?.busDetails?.bus?.operatorName || 'SafarGo MP Express'}\n` +
      `🗺️ *रूट*: ${bookingDetails?.busDetails?.bus?.sourceCity || 'Indore'} -> ${bookingDetails?.busDetails?.bus?.destinationCity || 'Bhopal'}\n` +
      `📍 *स्थान*: नेशनल हाईवे 46, मध्य प्रदेश\n` +
      `⏰ *समय*: ${new Date().toLocaleTimeString('hi-IN')}\n\n` +
      `_कृपया तुरंत संपर्क करें या पुलिस 112 को सूचित करें!_`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setIsAlertSent(true);
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border-2 border-red-500 overflow-hidden relative">
        {/* Urgent Header */}
        <div className="p-5 bg-gradient-to-r from-red-600 via-rose-700 to-red-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <ShieldAlert className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight">
                {t('आपातकालीन सुरक्षा डेस्क (Emergency SOS)', 'Emergency SOS & Safety Hub')}
              </h3>
              <p className="text-[11px] text-red-100">
                {t('24x7 तत्काल पुलिस, एंबुलेंस व हाईवे सहायता', 'Instant 24x7 Police, Ambulance & Highway Patrol')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="इमरजेंसी विंडो बंद करें"
            className="p-1 text-white/80 hover:text-white rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SOS Options */}
        <div className="p-5 space-y-3.5 text-xs">
          <p className="text-slate-600 font-bold leading-relaxed">
            {t(
              'यदि आप यात्रा के दौरान किसी असुरक्षा, दुर्घटना या आपात स्थिति में हैं, तो सीधे नीचे दिए गए नंबरों पर कॉल करें:',
              'If you are facing any emergency during your journey, call verified helplines directly:'
            )}
          </p>

          {/* Quick Helplines */}
          <div className="grid grid-cols-2 gap-2.5">
            <a
              href="tel:112"
              className="p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-2xl flex items-center gap-2.5 transition active:scale-95 group"
            >
              <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">राष्ट्रीय हेल्पलाइन</span>
                <span className="font-black text-red-700 text-sm">पुलिस 112</span>
              </div>
            </a>

            <a
              href="tel:1099"
              className="p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-2xl flex items-center gap-2.5 transition active:scale-95 group"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">MP हाईवे पेट्रोल</span>
                <span className="font-black text-amber-800 text-sm">हाईवे 1099</span>
              </div>
            </a>

            <a
              href="tel:1090"
              className="p-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-2xl flex items-center gap-2.5 transition active:scale-95 group"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">महिला हेल्पलाइन</span>
                <span className="font-black text-rose-700 text-sm">विमेन 1090</span>
              </div>
            </a>

            <a
              href="tel:18001021234"
              className="p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-2xl flex items-center gap-2.5 transition active:scale-95 group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">सफ़रगो कमांड डेस्क</span>
                <span className="font-black text-blue-700 text-xs">1800-SAFAR</span>
              </div>
            </a>
          </div>

          {/* 1-Click WhatsApp Live Location Share */}
          <button
            type="button"
            onClick={handleShareLocation}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span>
              {isAlertSent 
                ? t('✅ लोकेशन WhatsApp पर साझा हो गई', 'Location Shared on WhatsApp') 
                : t('WhatsApp पर परिवार/मित्रों को लाइव लोकेशन व SOS भेजें', 'Share Live Location & SOS on WhatsApp')}
            </span>
          </button>
        </div>

        <div className="p-3.5 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-500 text-center">
          {t(
            'सफ़रगो सुरक्षा प्रोटोकॉल • आपका लाइव GPS डेटा 24 घंटे सुरक्षा सर्वर पर सुरक्षित रहता है।',
            'SafarGo Safety Protocol • Your GPS data is encrypted and monitored 24x7.'
          )}
        </div>
      </div>
    </div>
  );
};
