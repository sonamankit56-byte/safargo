import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { MP_NETWORK_CITIES } from '../../lib/mockData';
import {
  X,
  Award,
  CheckCircle2,
  Users,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  AlertCircle,
  QrCode,
  Copy,
  Clock,
  Sparkles,
  PhoneCall,
  Store,
  FileCheck
} from 'lucide-react';

interface PromoterApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PromoterApplicationModal: React.FC<PromoterApplicationModalProps> = ({ isOpen, onClose }) => {
  const { promoterApplications, submitPromoterApplication } = useData();
  const { success, error, info } = useToast();

  const [applicantName, setApplicantName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Sironj');
  const [district, setDistrict] = useState('Vidisha');
  const [experienceNote, setExperienceNote] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const officialUpi = 'safargo.promoter@icici';
  const onboardedCount = promoterApplications.filter((p) => p.status === 'onboarded_499_paid').length;
  const remainingSlots = Math.max(0, 5 - onboardedCount);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(officialUpi);
    setCopiedUpi(true);
    info('UPI ID Copied', 'सफ़ारगो प्रमोटर UPI ID क्लिपबोर्ड पर कॉपी हो गई है।');
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim()) {
      error('Missing Field', 'कृपया आवेदक का पूरा नाम दर्ज करें।');
      return;
    }
    if (mobile.replace(/\D/g, '').length !== 10) {
      error('Invalid Mobile', 'कृपया सही 10-अंकों का मोबाइल नंबर दर्ज करें।');
      return;
    }
    if (!utrNumber.trim() || utrNumber.trim().length < 6) {
      error('Invalid UTR', 'कृपया ₹149 का वैध UPI / UTR नंबर दर्ज करें।');
      return;
    }

    setIsSubmitting(true);
    const ok = await submitPromoterApplication({
      applicant_name: applicantName,
      mobile,
      email: email || `${mobile}@safargo.in`,
      city,
      district,
      experience_note: experienceNote,
      application_fee_utr: utrNumber,
    });
    setIsSubmitting(false);

    if (ok) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header with Slot Pill & Badges */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 flex items-center gap-1 shadow-sm">
              <Award className="w-3.5 h-3.5" />
              केवल 5 पद (Strict 5 Slots Only)
            </span>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
              remainingSlots > 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300'
            }`}>
              {remainingSlots > 0 ? `🔥 5 में से केवल ${remainingSlots} पद रिक्त!` : '⚠️ सभी 5 स्लॉट फुल हैं'}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white">
            सफ़ारगो प्रमोटर पार्टनर प्रोग्राम
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            प्रति माह ₹15,000 फिक्स्ड वेतन + एजेंट मैनेजमेंट डेस्क + 100% फीस रिफंड गारंटी!
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-center">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/10">
              <div className="text-xs text-slate-300">फिक्स्ड वेतन</div>
              <div className="text-base sm:text-lg font-black text-amber-400">₹15,000 /माह</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/10">
              <div className="text-xs text-slate-300">लक्ष्य</div>
              <div className="text-base sm:text-lg font-black text-white">500 एजेंट</div>
              <div className="text-[10px] text-amber-300 font-semibold">3 बुकिंग अनिवार्य</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/10">
              <div className="text-xs text-slate-300">आवेदन शुल्क</div>
              <div className="text-base sm:text-lg font-black text-white">₹149</div>
              <div className="text-[10px] text-slate-400">+₹499 चयन पर</div>
            </div>
            <div className="bg-emerald-500/20 backdrop-blur-md rounded-xl p-2.5 border border-emerald-500/40">
              <div className="text-xs text-emerald-300">100% रिफंड</div>
              <div className="text-base sm:text-lg font-black text-emerald-400">₹648 वापस</div>
              <div className="text-[10px] text-emerald-200">लक्ष्य पूरा होने पर</div>
            </div>
          </div>
        </div>

        {/* Core Responsibilities Highlight */}
        <div className="bg-indigo-50/60 p-4 border-b border-indigo-100 text-xs text-indigo-950 space-y-2">
          <div className="font-bold text-indigo-900 flex items-center gap-1.5 text-sm">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            प्रमोटर पार्टनर के मुख्य दायित्व एवं अधिकार (Under Super Admin):
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] leading-relaxed">
            <div className="flex items-start gap-1.5 bg-white p-2 rounded-lg border border-indigo-100">
              <Users className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>500 एजेंट नेटवर्क:</strong> नजदीकी CSC, साइबर कैफे को SafarGo एजेंट बनाएं। (शर्त: एजेंट की <strong>न्यूनतम 3 बस बुकिंग्स</strong> होने पर ही लक्ष्य में गिनती होगी!)
              </span>
            </div>
            <div className="flex items-start gap-1.5 bg-white p-2 rounded-lg border border-indigo-100">
              <Store className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>लोकल दुकान सब्सक्रिप्शन:</strong> किराना, मेडिकल, डेयरी को ₹199, ₹399, ₹699 मंथली पैकेज दें व सामान 15-मिनट डिलीवरी हेतु ऑनलाइन लिस्ट करवाएं।
              </span>
            </div>
            <div className="flex items-start gap-1.5 bg-white p-2 rounded-lg border border-indigo-100">
              <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>दैनिक कॉलिंग व ऑडिट:</strong> एजेंटों को कॉल करना कि बस बुकिंग हो रही है या नहीं, 15-मिनट डिलीवरी के लिए तैयार हैं या नहीं।
              </span>
            </div>
            <div className="flex items-start gap-1.5 bg-white p-2 rounded-lg border border-indigo-100">
              <FileCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <span>
                <strong>एजेंट मैनेजमेंट सिस्टम:</strong> सुपर एडमिन के नीचे काम करते हुए अपने नेटवर्क के एजेंटों का रजिस्ट्रेशन व KYC अप्रूव करने का अधिकार!
              </span>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                आवेदक का पूरा नाम *
              </label>
              <input
                type="text"
                required
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder="उदा. राहुल शर्मा"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-अंकों का मोबाइल नंबर"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ईमेल पता (वैकल्पिक)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul@gmail.com"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                कार्य क्षेत्र (MP शहर / कस्बा) *
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                {MP_NETWORK_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                जिला (District) *
              </label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="उदा. विदिशा, गुना, अशोक नगर, भोपाल..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                आपका अनुभव / फील्ड बैकग्राउंड (Brief Experience)
              </label>
              <textarea
                rows={2}
                value={experienceNote}
                onChange={(e) => setExperienceNote(e.target.value)}
                placeholder="मार्केटिंग, सीएससी नेटवर्क, किराना संपर्क अथवा पूर्व सेल्स अनुभव..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Payment Section (₹149 Application Fee) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-indigo-600" />
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  चरण 1: आवेदन शुल्क ₹149 का भुगतान करें
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
                ₹149 ओनली
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Google Pay, PhonePe, Paytm या BHIM से नीचे दी गई SafarGo आधिकारिक UPI ID पर ₹149 ट्रांसफर करें। इंटरव्यू पास होने पर ऑनबोर्डिंग के समय ₹499 शुल्क लगेगा। 3 महीने में लक्ष्य पूरा होने पर पूरी राशि (₹648) 100% रिफंड होगी!
            </p>

            <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-300">
              <div className="text-xs font-mono font-bold text-slate-800">
                {officialUpi}
              </div>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedUpi ? 'कॉपी हुआ!' : 'कॉपी करें'}
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                12-अंकों का UPI UTR / Transaction ID दर्ज करें *
              </label>
              <input
                type="text"
                required
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value.trim())}
                placeholder="उदा. 428901234567"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tracking-wider"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || remainingSlots <= 0}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-bold text-sm shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>प्रोसेस हो रहा है...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>प्रमोटर आवेदन जमा करें (₹149 UTR Verified)</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              आवेदन जमा होने के 24 घंटे में सुपर एडमिन द्वारा इंटरव्यू कॉल किया जाएगा।
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
