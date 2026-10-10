import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import {
  X,
  ShieldCheck,
  CreditCard,
  Building,
  Upload,
  CheckCircle,
  MessageSquare,
  Camera,
  AlertTriangle,
  UserCheck,
  Lock,
  Sparkles,
  Clock,
  Send,
  ArrowRight,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface AgentKycModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AgentKycModal: React.FC<AgentKycModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, submitAgentKyc } = useAuth();
  const { settings } = useData();
  const { error } = useToast();

  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar_url || '');
  const [aadhaarNumber, setAadhaarNumber] = useState(currentUser?.aadhaar_number || '');
  const [aadhaarFrontUrl, setAadhaarFrontUrl] = useState(currentUser?.aadhaar_front_url || '');
  const [aadhaarBackUrl, setAadhaarBackUrl] = useState(currentUser?.aadhaar_back_url || '');
  const [panNumber, setPanNumber] = useState(currentUser?.pan_number || '');
  const [panCardUrl, setPanCardUrl] = useState(currentUser?.pan_card_url || '');
  
  const [bankHolder, setBankHolder] = useState(
    currentUser?.bank_account_holder || currentUser?.full_name || ''
  );
  const [bankAccNumber, setBankAccNumber] = useState(currentUser?.bank_account_number || '');
  const [bankIfsc, setBankIfsc] = useState(currentUser?.bank_ifsc || '');
  const [bankName, setBankName] = useState(currentUser?.bank_name || '');
  const [bankUpi, setBankUpi] = useState(currentUser?.bank_upi_id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      error('File Too Large', 'फ़ाइल 5MB से कम होनी चाहिए।');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setter(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClose = () => {
    setIsSubmittedSuccess(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanAadhaar = aadhaarNumber.replace(/\D/g, '');
    if (cleanAadhaar.length !== 12) {
      error('आधार नंबर अमान्य', 'कृपया 12 अंकों का सही आधार नंबर दर्ज करें।');
      return;
    }

    const cleanPan = panNumber.trim().toUpperCase();
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
      error('PAN कार्ड अमान्य', 'कृपया 10 अक्षरों का वैध PAN नंबर दर्ज करें (उदा. ABCDE1234F)।');
      return;
    }

    if (!bankAccNumber.trim() || !bankIfsc.trim() || !bankName.trim() || !bankHolder.trim()) {
      error('बैंक विवरण अधूरा', 'कृपया अपने बैंक खाते का पूरा विवरण भरें।');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await submitAgentKyc({
        aadhaar_number: cleanAadhaar,
        pan_number: cleanPan,
        aadhaar_front_url: aadhaarFrontUrl,
        aadhaar_back_url: aadhaarBackUrl,
        pan_card_url: panCardUrl,
        bank_account_holder: bankHolder.trim(),
        bank_account_number: bankAccNumber.trim(),
        bank_ifsc: bankIfsc.trim().toUpperCase(),
        bank_name: bankName.trim(),
        bank_upi_id: bankUpi.trim(),
        avatar_url: avatarUrl,
      });

      if (ok) {
        setIsSubmittedSuccess(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const maskedAadhaarDisplay = currentUser.aadhaar_number
    ? `XXXX-XXXX-${currentUser.aadhaar_number.slice(-4)}`
    : aadhaarNumber
    ? `XXXX-XXXX-${aadhaarNumber.slice(-4)}`
    : 'XXXX-XXXX-1234';

  const maskedPanDisplay = currentUser.pan_number
    ? `${currentUser.pan_number.slice(0, 2)}*****${currentUser.pan_number.slice(-2)}`
    : panNumber
    ? `${panNumber.slice(0, 2)}*****${panNumber.slice(-2)}`
    : 'AB*****1F';

  const whatsappMessage = encodeURIComponent(
    `नमस्ते SafarGo Admin टीम,\n\n` +
    `मैंने अपनी KYC (Aadhaar, PAN & Bank) सबमिट कर दी है।\n\n` +
    `👤 *एजेंट नाम:* ${currentUser.full_name}\n` +
    `🏪 *दुकान / केंद्र:* ${currentUser.shop_name || 'जन सेवा केंद्र'}\n` +
    `📱 *मोबाइल:* ${currentUser.mobile}\n` +
    `🆔 *एजेंट कोड:* ${currentUser.referral_code || currentUser.id}\n` +
    `📑 *आधार नंबर:* ${maskedAadhaarDisplay}\n` +
    `💳 *PAN कार्ड:* ${maskedPanDisplay}\n` +
    `🏦 *बैंक खाता:* ${currentUser.bank_account_number || bankAccNumber || 'दर्ज'}\n\n` +
    `कृपया 1 से 12 घंटे के अंदर इसे सत्यापित करके मेरी प्रोफ़ाइल पर (✓ Verified Tick) प्रदान करें व विथड्रॉल अनलॉक करें। धन्यवाद!`
  );

  // 1. LOCKED VIEW: Agent has already submitted KYC and it is pending review, or just submitted now!
  // NO editable fields, NO submit button! Shows 1 to 12 hour SLA review card.
  if (currentUser.kyc_status === 'pending' || isSubmittedSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border-2 border-amber-500/30 relative text-center p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-300">
          
          {/* Top Decorative Background Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-b from-amber-400/20 via-orange-400/10 to-transparent rounded-full blur-2xl pointer-events-none" />
          
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Cool Animated Success Badge with Pulsing Waves */}
          <div className="relative mx-auto w-28 h-28 flex items-center justify-center pt-2">
            {/* Outer animated ping wave */}
            <div className="absolute inset-2 rounded-full bg-amber-400/30 animate-ping duration-1000" />
            
            {/* Middle pulsing glow ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 opacity-20 blur-md animate-pulse" />

            {/* Core Badge */}
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xl shadow-amber-500/30 animate-in zoom-in duration-500 border-4 border-white">
              <Clock className="w-12 h-12 stroke-[2.5]" />
              
              {/* Floating Sparkles Badge */}
              <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md animate-bounce">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Heading and 1 to 12 Hour SLA Highlight */}
          <div className="space-y-2 relative z-10">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>समीक्षाधीन (KYC Under Review)</span>
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
              आपकी KYC वेरिफिकेशन 12 घंटे के अंदर हो जाएगी!
            </h2>

            <p className="text-sm font-extrabold text-emerald-600 flex items-center justify-center gap-1.5">
              <span>एडमिन को आपकी रिक्वेस्ट भेज दी गई है ✅</span>
            </p>
          </div>

          {/* 1 to 12 Hour SLA Timeline Box */}
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-left space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 animate-spin duration-3000" />
                <span className="text-xs font-black text-amber-950 uppercase">
                  सत्यापन अवधि: आमतौर पर 1 से 12 घंटे
                </span>
              </div>
              <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-black">
                1-12 Hour SLA
              </span>
            </div>

            <p className="text-xs text-amber-950 font-bold leading-relaxed">
              Our team verifies your documents usually within 1 to 12 hours. (हमारी टीम आमतौर पर 1 घंटे से 12 घंटे के अंदर आपके दस्तावेज़ों का सत्यापन कर देती है।)
            </p>

            {/* Read-only Submitted Details Preview */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-white border border-amber-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">आधार कार्ड (Locked)</span>
                <span className="font-mono font-bold text-slate-800 text-xs mt-0.5 block">{maskedAadhaarDisplay}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-amber-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">PAN कार्ड (Locked)</span>
                <span className="font-mono font-bold text-slate-800 text-xs mt-0.5 block">{maskedPanDisplay}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-amber-200 col-span-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">बैंक खाता (Locked)</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block truncate">
                  {currentUser.bank_name || bankName || 'Bank Account'} • A/C: ••••{(currentUser.bank_account_number || bankAccNumber)?.slice(-4) || 'XXXX'} (IFSC: {currentUser.bank_ifsc || bankIfsc || 'N/A'})
                </span>
              </div>
            </div>

            {/* Lock Security Notice */}
            <div className="flex items-center gap-2 text-[11px] text-slate-600 bg-amber-100/60 p-2.5 rounded-xl">
              <Lock className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                सुरक्षा कारणों से समीक्षा के दौरान संपादन (Edit) लॉक है। सत्यापन पूरा होते ही प्रोफ़ाइल पर <strong>Verified Tick (✓)</strong> लग जाएगा।
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <a
              href={`https://wa.me/${settings.support_whatsapp}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-98"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp पर एडमिन से संपर्क करें (Fast Track)</span>
            </a>

            <button
              onClick={handleClose}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-extrabold text-xs transition active:scale-98 shadow"
            >
              ठीक है, डैशबोर्ड पर जाएं (Done)
            </button>
          </div>

        </div>
      </div>
    );
  }

  // 2. LOCKED VIEW: Agent is already fully KYC Verified
  if (currentUser.kyc_status === 'verified') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 p-6 sm:p-7 text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm border-2 border-emerald-300">
            <ShieldCheck className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2.5 py-0.5 rounded-full border border-emerald-300 uppercase">
              100% Verified Partner
            </span>
            <h3 className="text-xl font-black text-slate-900 pt-1">
              आपका KYC सत्यापन पूर्ण है!
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              आपकी प्रोफ़ाइल और पोस्टर पर आधिकारिक <strong>Verified Tick (✓)</strong> सक्रिय है और विथड्रॉल पूरी तरह अनलॉक है।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">आधार संख्या:</span>
              <span className="font-mono font-bold text-slate-800">{maskedAadhaarDisplay}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">PAN संख्या:</span>
              <span className="font-mono font-bold text-slate-800">{maskedPanDisplay}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">बैंक खाता:</span>
              <span className="font-mono font-bold text-slate-800">
                {currentUser.bank_name} • ••••{currentUser.bank_account_number?.slice(-4)}
              </span>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow"
          >
            बंद करें (Close)
          </button>
        </div>
      </div>
    );
  }

  // 3. EDITABLE FORM VIEW: Shown ONLY when kyc_status is 'not_submitted' or 'rejected'
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              SafarGo एजेंट KYC व विथड्रॉल सत्यापन
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-400 text-slate-900 text-xs font-black flex items-center gap-1">
              <Lock className="w-3 h-3" />
              100% सुरक्षित डेटा
            </span>
          </div>

          <h2 className="text-2xl font-black">आधार व पैन कार्ड KYC वेरिफिकेशन</h2>
          <p className="text-xs text-slate-300 mt-1">
            विथड्रॉल और साप्ताहिक वेतन प्राप्त करने के लिए आधार व पैन कार्ड सत्यापन अनिवार्य है। सत्यापन आमतौर पर 1 से 12 घंटे में पूरा होता है।
          </p>
        </div>

        {/* If previously rejected, show the rejection notice */}
        {currentUser.kyc_status === 'rejected' && (
          <div className="mx-6 mt-6 p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 flex items-start gap-3 text-xs text-rose-950">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-sm text-rose-900">
                पिछला KYC आवेदन अस्वीकृत किया गया था
              </p>
              <p className="text-rose-800 mt-0.5">
                कारण: {currentUser.kyc_rejection_reason || 'दस्तावेज अस्पष्ट थे। कृपया सही व साफ फोटो पुनः अपलोड करें।'}
              </p>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Step 1: Agent Photo Upload (Selfie / Passport Photo) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-5">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Agent Profile"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-orange-500 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-orange-500 text-white font-black text-2xl flex items-center justify-center border-2 border-orange-400 shadow-md">
                  {currentUser.full_name.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <h3 className="font-black text-sm text-slate-900">
                आपकी प्रोफ़ाइल फ़ोटो / सेल्फी (Agent Photo)
              </h3>
              <p className="text-xs text-slate-500">
                अपनी साफ फ़ोटो अपलोड करें। KYC अप्रूव होने पर इस फ़ोटो पर आधिकारिक <strong>Verified Tick (✓)</strong> आ जाएगा।
              </p>

              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer transition shadow-xs mt-1">
                <Camera className="w-3.5 h-3.5 text-orange-500" />
                <span>फ़ोटो चुनें / बदलें</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, setAvatarUrl)}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Step 2: Aadhaar Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <CreditCard className="w-4 h-4 text-orange-600" />
              <h3 className="font-black text-sm text-slate-900">
                1. आधार कार्ड सत्यापन (Aadhaar Card - 12 Digits)
              </h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                आधार कार्ड संख्या (12 अंक) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                maxLength={12}
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="उदा. 123456789012"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm tracking-wider focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Front Photo */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="font-bold text-slate-700 block">आधार कार्ड (सामने की फ़ोटो - Front)</span>
                {aadhaarFrontUrl ? (
                  <div className="relative group rounded-lg overflow-hidden border border-slate-300 aspect-16/9 bg-white">
                    <img src={aadhaarFrontUrl} alt="Aadhaar Front" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setAadhaarFrontUrl('')}
                      className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-black/80 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-orange-500 cursor-pointer bg-white transition">
                    <Upload className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="font-bold text-slate-600">Front फ़ोटो अपलोड करें</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, setAadhaarFrontUrl)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Back Photo */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="font-bold text-slate-700 block">आधार कार्ड (पीछे की फ़ोटो - Back)</span>
                {aadhaarBackUrl ? (
                  <div className="relative group rounded-lg overflow-hidden border border-slate-300 aspect-16/9 bg-white">
                    <img src={aadhaarBackUrl} alt="Aadhaar Back" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setAadhaarBackUrl('')}
                      className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-black/80 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-orange-500 cursor-pointer bg-white transition">
                    <Upload className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="font-bold text-slate-600">Back फ़ोटो अपलोड करें</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, setAadhaarBackUrl)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Step 3: PAN Card Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <h3 className="font-black text-sm text-slate-900">
                2. पैन कार्ड सत्यापन (PAN Card - 10 Characters)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  PAN नंबर (10 अक्षर) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  placeholder="उदा. ABCDE1234F"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm uppercase tracking-wider focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  PAN कार्ड की फ़ोटो
                </label>
                {panCardUrl ? (
                  <div className="relative group rounded-lg overflow-hidden border border-slate-300 aspect-16/9 bg-white">
                    <img src={panCardUrl} alt="PAN Card" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPanCardUrl('')}
                      className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-black/80 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center p-3 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 cursor-pointer bg-slate-50 transition text-xs">
                    <Upload className="w-4 h-4 text-slate-400 mr-2" />
                    <span className="font-bold text-slate-600">PAN फ़ोटो अपलोड करें</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, setPanCardUrl)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Step 4: Bank Account for Withdrawals */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Building className="w-4 h-4 text-emerald-600" />
              <h3 className="font-black text-sm text-slate-900">
                3. कमीशन निकासी बैंक खाता (Payout Bank Account)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  खाताधारक का नाम (As in Bank Passbook) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={bankHolder}
                  onChange={(e) => setBankHolder(e.target.value)}
                  placeholder="उदा. पवन कुमार वर्मा"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  बैंक का नाम <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="उदा. State Bank of India / HDFC"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  बैंक खाता संख्या <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={bankAccNumber}
                  onChange={(e) => setBankAccNumber(e.target.value)}
                  placeholder="उदा. 123456789012"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  IFSC कोड <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={11}
                  value={bankIfsc}
                  onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                  placeholder="उदा. HDFC0001234"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold focus:ring-2 focus:ring-emerald-500 uppercase"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  UPI ID (वैकल्पिक - PhonePe, GPay, Paytm)
                </label>
                <input
                  type="text"
                  value={bankUpi}
                  onChange={(e) => setBankUpi(e.target.value)}
                  placeholder="उदा. 9450123456@paytm"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <a
              href={`https://wa.me/${settings.support_whatsapp}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp पर भी डॉक्यूमेंट्स भेजें</span>
            </a>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100 transition"
              >
                रद्द करें
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-1/2 sm:w-auto px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs transition shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{isSubmitting ? 'सबमिट हो रहा है...' : 'KYC सबमिट करें'}</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
