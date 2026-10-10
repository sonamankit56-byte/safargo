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
  Lock
} from 'lucide-react';

interface AgentKycModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AgentKycModal: React.FC<AgentKycModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, submitAgentKyc } = useAuth();
  const { settings } = useData();
  const { error, success } = useToast();

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
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `नमस्ते SafarGo Admin टीम,\n\nमैं एजेंट [${currentUser.full_name}], दुकान: [${currentUser.shop_name || 'जन सेवा केंद्र'}], मोबाइल: [${currentUser.mobile}]।\n\n` +
    `मेरी एजेंट ID: ${currentUser.referral_code}\n` +
    `मैंने अपने आधार व पैन कार्ड KYC विवरण दर्ज कर दिए हैं:\n` +
    `• आधार नंबर: ${aadhaarNumber || 'N/A'}\n` +
    `• पैन नंबर: ${panNumber || 'N/A'}\n` +
    `• बैंक खाता: ${bankAccNumber || 'N/A'} (IFSC: ${bankIfsc || 'N/A'})\n\n` +
    `कृपया मेरी KYC को सत्यापित करें ताकि मेरा विथड्रॉल और प्रोफाइल पर (✓ Verified) बैज एक्टिव हो सके। धन्यवाद!`
  );

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
            विथड्रॉल और साप्ताहिक वेतन प्राप्त करने के लिए आधार व पैन कार्ड सत्यापन अनिवार्य है। सत्यापन के बाद प्रोफाइल पर <strong>(✓ Verified Tick)</strong> बैज लग जाएगा।
          </p>
        </div>

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
                <div className="w-20 h-20 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-black text-2xl border-2 border-dashed border-orange-300">
                  <Camera className="w-8 h-8 text-orange-400" />
                </div>
              )}
            </div>

            <div className="space-y-1 text-center sm:text-left flex-1">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 justify-center sm:justify-start">
                <span>एजेंट प्रोफाइल फोटो (Profile Photo / Selfie)</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-black">
                  ✓ Verified Tick के साथ दिखेगा
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                अपनी पासपोर्ट साइज फोटो या दुकान की सेल्फी अपलोड करें। यह फोटो आपके सर्टिफिकेट और दुकान के पोस्टर पर छपेगी।
              </p>
              <div className="pt-1">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>फोटो चुनें</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, setAvatarUrl)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Step 2: Aadhaar Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <ShieldCheck className="w-4 h-4 text-orange-600" />
              <h3 className="font-black text-xs text-slate-900 uppercase tracking-wide">
                1. आधार कार्ड विवरण (12 Digits Aadhaar Card) *
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  आधार कार्ड नंबर (12 अंक) *
                </label>
                <input
                  type="text"
                  maxLength={12}
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="उदा. 9845 1234 9012"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm font-bold focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  आधार कार्ड फोटो (Front & Back)
                </label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1 transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{aadhaarFrontUrl ? 'Front ✓' : 'Front फोटो'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, setAadhaarFrontUrl)}
                      className="hidden"
                    />
                  </label>
                  <label className="cursor-pointer px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1 transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{aadhaarBackUrl ? 'Back ✓' : 'Back फोटो'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, setAadhaarBackUrl)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: PAN Card Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <h3 className="font-black text-xs text-slate-900 uppercase tracking-wide">
                2. पैन कार्ड विवरण (10 Characters PAN Card) *
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  पैन कार्ड नंबर (10 अंक/अक्षर) *
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  placeholder="उदा. ABCDE1234F"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm font-bold focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  पैन कार्ड फोटो (PAN Card Photo)
                </label>
                <label className="cursor-pointer px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition inline-block">
                  <Upload className="w-3.5 h-3.5 inline mr-1" />
                  <span>{panCardUrl ? 'पैन कार्ड फोटो अपलोड हो गई ✓' : 'पैन फोटो चुनें'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, setPanCardUrl)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Step 4: Bank Account Details for Payouts */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Building className="w-4 h-4 text-emerald-600" />
              <h3 className="font-black text-xs text-slate-900 uppercase tracking-wide">
                3. बैंक खाता विवरण (जिसमें विथड्रॉल व रविवार वेतन जाएगा) *
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  खाताधारक का नाम (PAN कार्ड से मिलना चाहिए) *
                </label>
                <input
                  type="text"
                  value={bankHolder}
                  onChange={(e) => setBankHolder(e.target.value)}
                  placeholder="उदा. पवन कुमार वर्मा"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  बैंक का नाम (Bank Name) *
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="उदा. HDFC Bank, SBI, PNB"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  बैंक खाता संख्या (A/C Number) *
                </label>
                <input
                  type="text"
                  value={bankAccNumber}
                  onChange={(e) => setBankAccNumber(e.target.value)}
                  placeholder="Account Number"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  IFSC कोड (11 अक्षर) *
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
