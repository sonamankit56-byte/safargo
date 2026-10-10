import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { AgentKycModal } from './AgentKycModal';
import { AgentPosterModal } from './AgentPosterModal';
import {
  User,
  Phone,
  Mail,
  Building,
  MapPin,
  ShieldCheck,
  Clock,
  Save,
  CheckCircle,
  AlertTriangle,
  FileText,
  Printer,
  Camera,
  CreditCard,
  Building2,
  Lock,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

export const AgentProfile: React.FC = () => {
  const { currentUser, updateProfile, isApprovedAgent } = useAuth();
  const { settings } = useData();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [mobile, setMobile] = useState(currentUser?.mobile || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [shopName, setShopName] = useState(currentUser?.shop_name || '');
  const [city, setCity] = useState(currentUser?.city || '');
  const [district, setDistrict] = useState(currentUser?.district || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [isSaving, setIsSaving] = useState(false);

  // Modals
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      error('फ़ाइल बड़ी है', 'कृपया 5MB से छोटी फ़ोटो चुनें।');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      await updateProfile({ avatar_url: base64 });
      success('फ़ोटो अपडेट हो गई', 'आपकी प्रोफ़ाइल फ़ोटो सफलतापूर्वक अपलोड हो गई है।');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !mobile.trim()) {
      error('Validation Error', 'Full Name and Mobile are mandatory.');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        mobile: mobile.trim(),
        email: email.trim(),
        shop_name: shopName.trim(),
        city: city.trim(),
        district: district.trim(),
        address: address.trim(),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const maskedAadhaar = currentUser?.aadhaar_number
    ? `XXXX-XXXX-${currentUser.aadhaar_number.slice(-4)}`
    : 'उपलब्ध नहीं';

  const maskedPan = currentUser?.pan_number
    ? `${currentUser.pan_number.slice(0, 2)}*****${currentUser.pan_number.slice(-2)}`
    : 'उपलब्ध नहीं';

  const sendWhatsAppKycReminder = () => {
    const adminPhone = settings.support_whatsapp || '919876543210';
    const cleanPhone = adminPhone.replace(/\D/g, '');
    const text = encodeURIComponent(
      `*SafarGo Agent KYC Review Request*\n\n` +
      `नमस्ते SafarGo Admin,\n` +
      `कृपया मेरी Agent KYC का सत्यापन करने की कृपा करें:\n\n` +
      `👤 *Agent Name:* ${currentUser?.full_name}\n` +
      `🏪 *Shop / CSC Name:* ${currentUser?.shop_name || 'N/A'}\n` +
      `📱 *Mobile:* ${currentUser?.mobile}\n` +
      `🆔 *Agent Code:* ${currentUser?.referral_code || currentUser?.id}\n` +
      `📑 *Aadhaar:* ${maskedAadhaar}\n` +
      `💳 *PAN:* ${currentUser?.pan_number || 'N/A'}\n\n` +
      `कृपया पोर्टल में देखकर अप्रूव करें एवं प्रोफाइल पर Verified Tick प्रदान करें। धन्यवाद!`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            एजेंट प्रोफ़ाइल एवं पहचान सत्यापन
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Agent Profile, Aadhaar & PAN KYC and Shop Branding Center
          </p>
        </div>

        <button
          onClick={() => setIsPosterModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition active:scale-95 shrink-0 self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>दुकान का SafarGo पोस्टर (Print Poster)</span>
        </button>
      </div>

      {/* Profile & Verified Badge Spotlight Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with Verified Tick */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-3 border-orange-500 shadow-2xl bg-slate-800 flex items-center justify-center relative">
              {currentUser?.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-black text-orange-400">
                  {currentUser?.full_name?.charAt(0) || 'A'}
                </span>
              )}

              {/* Photo Change Hover Overlay */}
              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
                <Camera className="w-6 h-6 text-orange-400" />
                <span className="text-[10px] font-bold mt-1">फ़ोटो बदलें</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Official Verified Tick (✓) Badge */}
            {currentUser?.photo_verified ? (
              <div
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center border-3 border-slate-900 shadow-lg animate-in zoom-in"
                title="SafarGo Verified Partner"
              >
                <CheckCircle className="w-5 h-5" />
              </div>
            ) : (
              <div
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center border-3 border-slate-900 shadow-lg"
                title="KYC Verification Pending"
              >
                <Clock className="w-4 h-4 font-black" />
              </div>
            )}
          </div>

          {/* Agent Identity Details */}
          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-xs uppercase font-extrabold text-orange-400 tracking-wider">
                {currentUser?.shop_name || 'अधिकृत जन सेवा केंद्र'}
              </span>

              {currentUser?.photo_verified ? (
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span>सत्यापित एजेंट (Verified ✓)</span>
                </span>
              ) : (
                <span className="text-[11px] bg-amber-500/20 text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>सत्यापन प्रक्रियाधीन (KYC Pending)</span>
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black flex items-center justify-center sm:justify-start gap-2">
              <span>{currentUser?.full_name}</span>
            </h2>

            <p className="text-xs text-slate-300 max-w-xl">
              एजेंट कोड: <strong className="text-orange-300 font-mono">{currentUser?.referral_code || currentUser?.id}</strong> • मोबाइल: +91 {currentUser?.mobile} • {currentUser?.city}, {currentUser?.district}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <label className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition">
                <Camera className="w-3.5 h-3.5 text-orange-400" />
                <span>फ़ोटो अपलोड करें</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => setIsKycModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>
                  {currentUser?.kyc_status === 'verified'
                    ? 'KYC विवरण देखें / अपडेट'
                    : 'आधार व पैन KYC सबमिट करें'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KYC & Document Status Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                currentUser?.kyc_status === 'verified'
                  ? 'bg-emerald-100 text-emerald-600'
                  : currentUser?.kyc_status === 'pending'
                  ? 'bg-amber-100 text-amber-600'
                  : currentUser?.kyc_status === 'rejected'
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {currentUser?.kyc_status === 'verified' ? (
                <ShieldCheck className="w-6 h-6" />
              ) : currentUser?.kyc_status === 'pending' ? (
                <Clock className="w-6 h-6" />
              ) : currentUser?.kyc_status === 'rejected' ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <Lock className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  आधार, पैन एवं बैंक KYC सत्यापन (KYC Desk)
                </h3>
                <span
                  className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border ${
                    currentUser?.kyc_status === 'verified'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : currentUser?.kyc_status === 'pending'
                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                      : currentUser?.kyc_status === 'rejected'
                      ? 'bg-rose-50 text-rose-700 border-rose-300'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  {currentUser?.kyc_status === 'verified'
                    ? 'Verified ✓'
                    : currentUser?.kyc_status === 'pending'
                    ? 'Under Review'
                    : currentUser?.kyc_status === 'rejected'
                    ? 'Rejected'
                    : 'Not Submitted'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                कमीशन विथड्रॉल और रविवार पेआउट हेतु आधिकारिक पहचान पत्र आवश्यक हैं।
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsKycModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
          >
            <CreditCard className="w-3.5 h-3.5 text-orange-400" />
            <span>
              {currentUser?.kyc_status === 'verified' ? 'दस्तावेज़ प्रबंधित करें' : 'KYC पूरा करें'}
            </span>
          </button>
        </div>

        {/* KYC Status Body */}
        {currentUser?.kyc_status === 'verified' ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-950 space-y-1">
                <p className="font-extrabold text-sm">
                  आपका खाता पूर्णतः सत्यापित है (100% Verified SafarGo Partner)!
                </p>
                <p className="text-emerald-800 leading-relaxed">
                  आपकी प्रोफ़ाइल और दुकान पोस्टर पर <strong>Official Verified Tick (✓)</strong> सक्रिय है। आप कभी भी तुरंत कमीशन निकासी कर सकते हैं और प्रत्येक रविवार को बैंक में स्वतः पेआउट प्राप्त कर सकते हैं।
                </p>
                {currentUser.kyc_verified_at && (
                  <p className="text-[11px] font-mono text-emerald-700 pt-1">
                    सत्यापन तिथि: {new Date(currentUser.kyc_verified_at).toLocaleString('en-IN')}
                  </p>
                )}
              </div>
            </div>

            {/* Verified Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">आधार कार्ड (Aadhaar)</span>
                <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">{maskedAadhaar}</span>
                <span className="text-[10px] text-emerald-600 font-bold">✓ UIDAI सत्यापित</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">PAN कार्ड</span>
                <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">{maskedPan}</span>
                <span className="text-[10px] text-emerald-600 font-bold">✓ ITD सत्यापित</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">बैंक खाता (Payout Account)</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block truncate">
                  {currentUser.bank_name || 'Bank Account'}
                </span>
                <span className="text-[11px] text-slate-600 font-mono">
                  A/C: ••••{currentUser.bank_account_number?.slice(-4) || 'XXXX'}
                </span>
              </div>
            </div>
          </div>
        ) : currentUser?.kyc_status === 'pending' ? (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-950 space-y-1">
                <p className="font-extrabold text-sm">
                  दस्तावेज समीक्षाधीन हैं (KYC Under Review)
                </p>
                <p className="text-amber-800 leading-relaxed">
                  आपके आधार कार्ड, पैन कार्ड और बैंक विवरण की जांच SafarGo एडमिन टीम द्वारा की जा रही है। सत्यापन होते ही प्रोफाइल पर हरा <strong>Verified Tick (✓)</strong> लग जाएगा।
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={sendWhatsAppKycReminder}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp पर एडमिन को याद दिलाएं</span>
              </button>

              <button
                onClick={() => setIsKycModalOpen(true)}
                className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-xl transition"
              >
                दस्तावेज़ संशोधित करें (Edit KYC)
              </button>
            </div>
          </div>
        ) : currentUser?.kyc_status === 'rejected' ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-950 space-y-1">
                <p className="font-extrabold text-sm">
                  KYC आवेदन अस्वीकृत किया गया है
                </p>
                <p className="text-rose-800 leading-relaxed">
                  कारण: {currentUser.kyc_rejection_reason || 'दस्तावेज अस्पष्ट या नाम मेल नहीं खा रहा है।'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsKycModalOpen(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <span>पुनः सही दस्तावेज अपलोड करें</span>
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-800 space-y-1">
                <p className="font-extrabold text-sm">
                  KYC अधूरी है — विथड्रॉल अनलॉक करने के लिए तुरंत पूरा करें
                </p>
                <p className="text-slate-600 leading-relaxed">
                  आप टिकट बुकिंग कर सकते हैं, परंतु कमीशन निकासी और रविवार पेआउट प्राप्त करने के लिए आधार कार्ड व पैन कार्ड सत्यापन अनिवार्य है।
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsKycModalOpen(true)}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <CreditCard className="w-4 h-4" />
              <span>आधार, पैन व फ़ोटो KYC सबमिट करें</span>
            </button>
          </div>
        )}
      </div>

      {/* Free Printable Shop Poster Callout */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-6 sm:p-7 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white text-orange-600 flex items-center justify-center shrink-0 shadow font-black">
            <Printer className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-slate-900/40 text-yellow-200 text-[10px] font-black uppercase tracking-wider">
              दुकान ब्रांडिंग किट • Free For Agents
            </div>
            <h3 className="text-base sm:text-lg font-black">
              अपनी दुकान का आधिकारिक A4 SafarGo पोस्टर प्रिंट करें
            </h3>
            <p className="text-xs text-orange-100 max-w-xl leading-relaxed">
              इस पोस्टर में आपका नाम, सत्यापित टिक (✓), दुकान का नाम, हेल्पलाइन नंबर और प्रमुख बस रूट शामिल हैं। इसे अपनी दुकान पर लगाएं और ग्राहकों का विश्वास जीतें!
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsPosterModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-yellow-300 font-black text-xs transition flex items-center gap-2 shrink-0 self-start sm:self-auto shadow-md active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>पोस्टर प्रीव्यू व प्रिंट करें</span>
        </button>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-7 space-y-5">
        <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Building className="w-4 h-4 text-orange-500" />
          <span>व्यक्तिगत व केंद्र विवरण (Personal & Kendra Details)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              पूरा नाम (Full Name) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              मोबाइल नंबर (Mobile Number) <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500 outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ईमेल पता (Email Address)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              दुकान / केंद्र का नाम (Shop / CSC Kendra Name)
            </label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="उदा. पवन जन सेवा केंद्र"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              शहर (City)
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              जिला (District)
            </label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            दुकान का पूरा पता (Full Address)
          </label>
          <textarea
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-md transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'प्रोफ़ाइल सहेजें (Save Profile)'}
          </button>
        </div>
      </form>

      {/* KYC Modal */}
      <AgentKycModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
      />

      {/* Poster Modal */}
      <AgentPosterModal
        isOpen={isPosterModalOpen}
        onClose={() => setIsPosterModalOpen(false)}
      />

    </div>
  );
};
