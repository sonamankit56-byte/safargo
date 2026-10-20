import React, { useState } from 'react';
import { useTravel } from '../../context/TravelContext';
import { FIXED_AGENT_COMMISSION } from '../../types/travel';
import { 
  User, 
  Users,
  Bus,
  Mail, 
  Phone, 
  Wallet, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  CreditCard, 
  Ticket, 
  Headphones, 
  Globe, 
  Bell, 
  Sparkles, 
  Award, 
  ChevronRight, 
  Check, 
  Copy, 
  Edit3, 
  X,
  Lock,
  LogOut,
  Gift,
  HelpCircle,
  ArrowDownToLine,
  QrCode,
  Building,
  TrendingUp,
  Clock,
  Camera,
  Upload,
  Printer,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ShieldAlert,
  Info,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ApplicationDossierModal } from '../agent/ApplicationDossierModal';
import { LegalPoliciesModal, PolicyTab } from '../legal/LegalPoliciesModal';

export const TravelAccountScreen: React.FC = () => {
  const { 
    userProfile, 
    updateUserProfile, 
    savedPassengers, 
    addSavedPassenger, 
    removeSavedPassenger, 
    addWalletCash,
    agentWalletBalance,
    agentPayoutHistory,
    withdrawAgentEarnings,
    isAgentMode,
    setIsAgentMode,
    bookings,
    setActiveService, 
    setCurrentStep,
    language,
    toggleLanguage,
    currentAgent,
    isAgentLoggedIn,
    isCustomerLoggedIn,
    customerLogout,
    agentLogout,
    deleteAgentAccount,
    uploadAgentPhoto,
    adminQrConfig,
    submitWalletTopUp,
    promoOffers,
    setIsAuthModalOpen,
    t 
  } = useTravel();

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddPassengerOpen, setIsAddPassengerOpen] = useState(false);
  const [isAddCashOpen, setIsAddCashOpen] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [isAccountDossierOpen, setIsAccountDossierOpen] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Legal Policies & Help Modal State
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<PolicyTab>('help');

  const openLegalModal = (tab: PolicyTab) => {
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  };

  // Top Up & Anti-Fraud Security States
  const [topUpStep, setTopUpStep] = useState<'amount' | 'qr_pay' | 'success'>('amount');
  const [enteredUtr, setEnteredUtr] = useState('');
  const [utrError, setUtrError] = useState('');
  const [qrTimer, setQrTimer] = useState(300);
  const [lastTopUpReceipt, setLastTopUpReceipt] = useState<any>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Agent Withdrawal Modal State
  const [isAgentWithdrawOpen, setIsAgentWithdrawOpen] = useState(false);
  const [agentWithdrawAmt, setAgentWithdrawAmt] = useState<number>(500);
  const [agentPayoutMethod, setAgentPayoutMethod] = useState<'upi' | 'bank'>('upi');
  const [agentUpi, setAgentUpi] = useState(() => currentAgent?.settlementUpiId || '');
  const [agentBankAcc, setAgentBankAcc] = useState(() => currentAgent?.accountNumber || '');
  const [agentIfsc, setAgentIfsc] = useState(() => currentAgent?.ifsc || '');
  const [agentBankName, setAgentBankName] = useState(() => currentAgent?.bankName || '');
  const [agentWithdrawDone, setAgentWithdrawDone] = useState(false);
  const [agentTxnUtr, setAgentTxnUtr] = useState('');

  // Edit profile form state
  const [editName, setEditName] = useState(userProfile.name);
  const [editEmail, setEditEmail] = useState(userProfile.email);
  const [editPhone, setEditPhone] = useState(userProfile.phone);
  const [editGender, setEditGender] = useState(userProfile.gender);
  const [editDob, setEditDob] = useState(userProfile.dob);
  const [editEmergency, setEditEmergency] = useState(userProfile.emergencyContact);

  // Add passenger form state
  const [newPassName, setNewPassName] = useState('');
  const [newPassAge, setNewPassAge] = useState(25);
  const [newPassGender, setNewPassGender] = useState<'male' | 'female' | 'other'>('male');

  // Add cash amount
  const [cashAmount, setCashAmount] = useState<number>(500);

  const totalCommissionEarned = bookings.reduce((sum, b) => sum + (b.agentCommissionAmount || 0), 0) + agentWalletBalance;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: editName,
      email: editEmail,
      phone: editPhone,
      gender: editGender,
      dob: editDob,
      emergencyContact: editEmergency
    });
    setIsEditProfileOpen(false);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  const handleAddPassenger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassName.trim()) return;
    addSavedPassenger({
      name: newPassName.trim(),
      age: Number(newPassAge),
      gender: newPassGender
    });
    setNewPassName('');
    setIsAddPassengerOpen(false);
  };

  const handleAddCashSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addWalletCash(cashAmount);
    setIsAddCashOpen(false);
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
  };

  const handleAgentWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (agentWithdrawAmt <= 0 || agentWithdrawAmt > agentWalletBalance) {
      alert(t('निकासी राशि उपलब्ध बैलेंस से अधिक नहीं हो सकती', 'Withdrawal amount cannot exceed available balance'));
      return;
    }

    const destination = agentPayoutMethod === 'upi' ? `UPI: ${agentUpi}` : `${agentBankName} (A/C **${agentBankAcc.slice(-4)})`;
    const success = withdrawAgentEarnings(agentWithdrawAmt, { type: agentPayoutMethod, destination });

    if (success) {
      setAgentTxnUtr(`UTR${Math.floor(100000000 + Math.random() * 900000000)}`);
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      setAgentWithdrawDone(true);
    }
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  const isAnyLoggedIn = isAgentLoggedIn || isCustomerLoggedIn;

  if (!isAnyLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12 px-4 animate-fade-in text-center">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 space-y-5">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-50 to-rose-50 border border-slate-200 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8 text-rose-600" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 px-3 py-1 rounded-full border border-rose-200">
              सुरक्षित खाता • Login Required
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-3">
              {t('खाता व प्रोफ़ाइल एक्सेस करने के लिए लॉगिन करें', 'Login to Access Account & Profile')}
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {t(
                'अपने वॉलेट, बस टिकटों, सह-यात्रियों को प्रबंधित करने और विशेष ऑफर्स देखने के लिए लॉगिन करें।',
                'Login to manage your wallet, bus tickets, saved passengers, and unlock exclusive travel offers.'
              )}
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{t('लॉगिन / साइन-अप करें', 'Login / Sign Up Now')}</span>
            </button>
            <button
              onClick={() => setActiveService('bus')}
              className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 font-bold transition cursor-pointer"
            >
              {t('होम पेज पर वापस जाएं', 'Back to Home')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCustomer = !isAgentLoggedIn && isCustomerLoggedIn;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28 space-y-6">
      {/* ========================================================================= */}
      {/* CUSTOMER PROFILE VIEW (When logged in as regular user)                   */}
      {/* ========================================================================= */}
      {isCustomer ? (
        <>
          {/* Customer Profile Header */}
          <div className="bg-gradient-to-r from-[#0B194C] via-[#1E3A8A] to-[#0F2557] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-400 p-0.5 shadow-lg flex items-center justify-center shrink-0">
                  <div className="w-full h-full bg-[#0F172A] rounded-2xl flex items-center justify-center text-2xl font-black text-amber-300">
                    {(userProfile.name || 'G').charAt(0).toUpperCase()}
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight">{userProfile.name || 'SafarGo ग्राहक'}</h1>
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> अधिकृत ग्राहक
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1.5 flex flex-wrap items-center gap-2">
                    {userProfile.phone && <span>📱 +91 {userProfile.phone}</span>}
                    {userProfile.email && (
                      <>
                        <span className="text-slate-500">•</span>
                        <span>✉️ {userProfile.email}</span>
                      </>
                    )}
                  </p>
                  <p className="text-[11px] text-emerald-400 font-semibold mt-1">
                    ✓ {t('सफ़रगो ग्राहक खाता सक्रिय (Shopping & Travel Ready)', 'SafarGo Customer Account Active')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => setIsEditProfileOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all active:scale-95 shadow-sm cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{t('प्रोफ़ाइल संपादित करें', 'Edit Profile')}</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(t('क्या आप वाकई SafarGo से लॉगआउट करना चाहते हैं?', 'Do you want to log out from SafarGo?'))) {
                      customerLogout();
                    }
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white font-bold text-xs border border-rose-500/40 transition-all active:scale-95 shadow-sm cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('लॉगआउट', 'Logout')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Customer Metric Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mb-1">
                <Bus className="w-3.5 h-3.5 text-rose-600" /> {t('बस बुकिंग', 'Bus Trips')}
              </span>
              <p className="text-xl font-black text-slate-900">{bookings.length}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mb-1">
                <Wallet className="w-3.5 h-3.5 text-emerald-600" /> {t('वॉलेट बैलेंस', 'Wallet')}
              </span>
              <div className="flex items-center justify-between">
                <p className="text-xl font-black text-emerald-600">₹{userProfile.walletBalance.toFixed(2)}</p>
                <button
                  onClick={() => setIsAddCashOpen(true)}
                  className="text-[10px] font-black text-indigo-600 hover:underline cursor-pointer"
                >
                  + जोड़ें
                </button>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> {t('प्रोमो कैश', 'Promo Cash')}
              </span>
              <p className="text-xl font-black text-amber-600">₹{userProfile.promoCash}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mb-1">
                <Users className="w-3.5 h-3.5 text-indigo-600" /> {t('सह-यात्री', 'Co-passengers')}
              </span>
              <p className="text-xl font-black text-slate-900">{savedPassengers.length}</p>
            </div>
          </div>

          {/* Customer Bus Bookings Tab */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-rose-600" />
                <span>{t('मेरी बस टिकट बुकिंग', 'My Bus Bookings')}</span>
              </h3>
              <button
                onClick={() => setActiveService('bus')}
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>+ नई टिकट बुक करें</span>
              </button>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-8 text-slate-400 space-y-2">
                <Bus className="w-10 h-10 mx-auto opacity-40" />
                <p className="text-xs font-medium">{t('अभी तक कोई बस टिकट बुक नहीं की गई है', 'No bus tickets booked yet')}</p>
                <button
                  onClick={() => setActiveService('bus')}
                  className="px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-rose-700 transition cursor-pointer"
                >
                  बस टिकट खोजें
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((bk) => (
                  <div key={bk.id} className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs text-slate-900">PNR: {bk.pnr}</span>
                        {bk.status === 'confirmed' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> कन्फर्म
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> ⏳ समीक्षाधीन (Super Admin सत्यापन बाकी)
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-700">
                        {bk.busDetails?.bus.operatorName || 'SafarGo Express'} • {bk.busDetails?.bus.sourceCity} ➔ {bk.busDetails?.bus.destinationCity}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        यात्रा: {bk.travelDate} | सीट: {bk.busDetails?.selectedSeats.join(', ')} | किराया: ₹{bk.totalAmount}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {bk.status === 'confirmed' ? (
                        <button
                          onClick={() => window.print()}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>ई-टिकट देखें</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-amber-700 font-semibold italic">
                          एडमिन सत्यापन के बाद ई-टिकट डाउनलोड होगा
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Co-passengers Box */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>{t('सह-यात्री सूची (Family / Co-Passengers)', 'Saved Co-Passengers')}</span>
              </h3>
              <button
                onClick={() => setIsAddPassengerOpen(true)}
                className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                + नया सह-यात्री जोड़ें
              </button>
            </div>

            {savedPassengers.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">{t('कोई सह-यात्री नहीं जोड़ा गया है।', 'No saved co-passengers.')}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {savedPassengers.map((sp) => (
                  <div key={sp.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block">{sp.name}</span>
                      <span className="text-[11px] text-slate-500 capitalize">{sp.gender}, {sp.age} वर्ष</span>
                    </div>
                    <button
                      onClick={() => removeSavedPassenger(sp.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      title="हटाएं"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upgrade to Agent Banner */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black uppercase mb-1.5">
                💼 व्यापार अवसर • B2B Partnership
              </div>
              <h4 className="text-base font-black text-slate-900">
                {t('क्या आप सीएससी/कियोस्क या दुकान संचालक हैं?', 'Do you run a shop or CSC kiosk?')}
              </h4>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                {t('सफ़रगो अधिकृत B2B एजेंट पार्टनर बनें और प्रत्येक बस टिकट बुकिंग पर ₹19.34 निश्चित कमीशन सीधे अपने वॉलेट में पाएं।', 'Become an authorized SafarGo Agent and earn flat ₹19.34 commission per booking.')}
              </p>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-black text-xs rounded-xl shadow-md transition active:scale-95 shrink-0 cursor-pointer"
            >
              {t('एजेंट पोर्टल खोलें', 'Open Agent Hub')}
            </button>
          </div>
        </>
      ) : (
        <>
      {/* 1. Profile Header Card */}
      <div className="bg-gradient-to-r from-[#0B194C] via-[#1E3A8A] to-[#0F2557] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Avatar with One-Time Photo Upload Policy */}
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 p-0.5 shadow-lg overflow-hidden flex items-center justify-center">
                {currentAgent?.profilePhoto ? (
                  <img
                    src={currentAgent.profilePhoto}
                    alt={userProfile.name}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="w-full h-full bg-[#0F172A] rounded-2xl flex items-center justify-center text-2xl font-black text-amber-300">
                    {userProfile.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* One-Time Upload Camera Button if unlocked, or Lock icon if locked */}
              {currentAgent && !currentAgent.isPhotoLocked ? (
                <label className="absolute -bottom-1 -right-1 bg-amber-400 hover:bg-amber-300 text-slate-950 p-1.5 rounded-full shadow-md cursor-pointer active:scale-95 transition" title={t('फ़ोटो अपलोड करें (केवल एक बार)', 'Upload Photo (One-Time Only)')}>
                  <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) {
                        alert(t('फ़ोटो 5MB से छोटी होनी चाहिए', 'Photo must be under 5MB'));
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => {
                        const photoUrl = reader.result as string;
                        uploadAgentPhoto(currentAgent.id, photoUrl);
                        try {
                          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
                        } catch {}
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              ) : (
                <div className="absolute -bottom-1 -right-1 bg-slate-900 text-amber-400 border border-amber-400 p-1 rounded-full shadow-sm" title={t('फ़ोटो सुरक्षित लॉक है', 'Photo is permanently locked')}>
                  <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              )}
            </div>

            {/* Info & Badges */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">{userProfile.name}</h1>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> SafarGo Gold
                </span>
                <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  💰 ₹19.34 Commission / Booking
                </span>
                <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-3 h-3" /> KYC VERIFIED ✓
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1.5 flex items-center gap-2">
                <span>+91 {userProfile.phone}</span>
                <span className="text-slate-500">•</span>
                <span>{userProfile.email}</span>
              </p>
              <p className="text-[11px] text-emerald-400 font-semibold mt-1">
                ✓ {t('ईमेल, मोबाइल व KYC सत्यापित (Fully Verified Agent)', 'KYC, Mobile & Email Verified')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Edit Profile Button */}
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all active:scale-95 shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{t('प्रोफ़ाइल संपादित करें', 'Edit Profile')}</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={() => {
                if (confirm(t('क्या आप वाकई SafarGo से लॉगआउट करना चाहते हैं?', 'Do you want to log out from SafarGo?'))) {
                  agentLogout();
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white font-bold text-xs border border-rose-500/40 transition-all active:scale-95 shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('लॉगआउट', 'Logout')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1.5 DEDICATED KYC VERIFIED & ONBOARDING SUBMITTED DOCUMENTS CARD */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-emerald-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {t('सफ़रगो अधिकृत पार्टनर • e-KYC सत्यापित प्रोफाइल', 'SafarGo Authorized Partner • e-KYC Verified')}
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {t('सत्यापित ✓', 'Verified ✓')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {t(
                  'ऑनबोर्डिंग के समय प्रस्तुत किए गए सभी कानूनी दस्तावेज सत्यापित हैं।',
                  'All documents submitted during onboarding are verified and compliant.'
                )}
              </p>
            </div>
          </div>

          {/* View Official Dossier Button */}
          <button
            onClick={() => setIsAccountDossierOpen(true)}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 border border-indigo-200 self-start sm:self-auto"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t('📄 आवेदन PDF डोजियर देखें', 'View PDF Dossier')}</span>
          </button>
        </div>

        {/* 6 Masked Document Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* PAN Card */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {t('स्थायी खाता संख्या (PAN)', 'PAN Card')}
              </span>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                सत्यापित ✓
              </span>
            </div>
            <p className="font-mono text-sm font-black text-slate-900">
              {currentAgent?.panNumber
                ? `${currentAgent.panNumber.slice(0, 2)}*****${currentAgent.panNumber.slice(-2)}`
                : 'AB*****34F'}
            </p>
            <span className="text-[10px] text-slate-500 block">आयकर विभाग (Income Tax Dept)</span>
          </div>

          {/* Aadhaar Card */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {t('आधार पहचान पत्र (Aadhaar)', 'Aadhaar Card')}
              </span>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                UIDAI सत्यापित ✓
              </span>
            </div>
            <p className="font-mono text-sm font-black text-slate-900">
              {currentAgent?.aadhaarNumber
                ? `XXXX-XXXX-${currentAgent.aadhaarNumber.slice(-4)}`
                : 'XXXX-XXXX-1098'}
            </p>
            <span className="text-[10px] text-slate-500 block">भारतीय विशिष्ट पहचान प्राधिकरण</span>
          </div>

          {/* Bank Account */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {t('बैंक पेआउट खाता', 'Bank Account')}
              </span>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                सत्यापित ✓
              </span>
            </div>
            <p className="font-mono text-sm font-black text-slate-900">
              ••••••••{currentAgent?.accountNumber?.slice(-4) || '2910'}
            </p>
            <span className="text-[10px] text-slate-500 block">{currentAgent?.bankName || 'State Bank of India'}</span>
          </div>

          {/* IFSC Code */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {t('बैंक IFSC कोड', 'IFSC Code')}
              </span>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                सत्यापित ✓
              </span>
            </div>
            <p className="font-mono text-sm font-black text-slate-900">
              {currentAgent?.ifsc || 'SBIN0001234'}
            </p>
            <span className="text-[10px] text-slate-500 block">IMPS/RTGS पेआउट सक्षम</span>
          </div>

          {/* Settlement UPI ID */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {t('सेटलमेंट UPI ID', 'Settlement UPI')}
              </span>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                सत्यापित ✓
              </span>
            </div>
            <p className="font-mono text-sm font-black text-emerald-700 truncate">
              {currentAgent?.settlementUpiId || '—'}
            </p>
            <span className="text-[10px] text-slate-500 block">रविवार स्वतः पेआउट सक्रिय</span>
          </div>

          {/* Partner Agency / Kiosk */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {t('कियोस्क / प्रतिष्ठान', 'Kiosk / Agency')}
              </span>
              <span className="text-[10px] font-black text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                अधिकृत ✓
              </span>
            </div>
            <p className="text-xs font-black text-slate-900 truncate">
              {currentAgent?.shopName || 'Verma CSC & Travel Point'}
            </p>
            <span className="text-[10px] text-slate-500 block">{currentAgent?.city || 'Indore'} • B2B Partner</span>
          </div>
        </div>

        {/* Profile Photo Security Note */}
        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-black text-amber-950 block">
              {currentAgent?.isPhotoLocked
                ? t('सुरक्षा लॉक: आपकी प्रोफ़ाइल फ़ोटो सुरक्षित रूप से लॉक है', 'Security Lock: Profile photo is permanently locked')
                : t('एक-बारीय फ़ोटो नीति: फ़ोटो केवल 1 बार ही अपलोड की जा सकती है', 'One-Time Photo Policy: Can be uploaded only once')}
            </span>
            <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
              {currentAgent?.isPhotoLocked
                ? t(
                    'धोखाधड़ी रोकथाम एवं पहचान सुरक्षा हेतु एक बार अपलोड होने के बाद प्रोफ़ाइल फ़ोटो को बदला नहीं जा सकता। परिवर्तन हेतु केवल SafarGo अधिकृत एडमिन से संपर्क किया जा सकता है।',
                    'For identity security, photo cannot be modified after initial upload. Contact SafarGo admin for updates.'
                  )
                : t(
                    'कृपया अपनी वास्तविक व स्पष्ट प्रोफ़ाइल फ़ोटो लगाएं। एक बार अपलोड होने के बाद यह लॉक हो जाएगी और आप इसे स्वयं नहीं बदल सकेंगे।',
                    'Please upload a clear genuine photo. Once uploaded, it locks permanently.'
                  )}
            </p>
          </div>
        </div>
      </div>

      {/* 2. AGENT COMMISSION & WITHDRAWAL SYSTEM CARD */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              B2B PARTNER DESK
            </span>
            <span className="bg-slate-950/40 text-amber-200 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
              ⚡ FIXED ₹19.34 / BOOKING
            </span>
          </div>

          <h3 className="text-xl font-black mt-2">
            {t('एजेंट कमीशन व निकासी सिस्टम (Agent Earnings & Withdrawal)', 'Agent Commission & Instant Withdrawal')}
          </h3>
          <p className="text-xs text-amber-100 mt-1 max-w-xl leading-relaxed">
            {t(
              'प्रत्येक बस व होटल बुकिंग पर फिक्स ₹19.34 कमीशन पाएं। 24x7 कभी भी सीधे UPI या बैंक खाते में पैसे निकालें, या रविवार 10 AM ऑटोमैटिक ट्रांसफर प्राप्त करें।',
              'Earn a flat ₹19.34 fixed commission on every booking. Withdraw anytime 24x7 directly to your UPI or bank account, or receive auto-payout every Sunday at 10 AM.'
            )}
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-bold text-amber-100">
            <span>{t('कुल ग्राहक बुकिंग्स:', 'Customer Bookings:')} {bookings.length}</span>
            <span>•</span>
            <span>{t('कमीशन दर:', 'Commission Rate:')} ₹19.34 (Fixed)</span>
            <span>•</span>
            <span>{t('कुल अर्जित कमीशन:', 'Lifetime Earned:')} ₹{totalCommissionEarned.toFixed(2)}</span>
          </div>
        </div>

        {/* Action / Withdrawal Balance Block */}
        <div className="relative z-10 bg-slate-950/50 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex flex-col items-start sm:items-end justify-between min-w-[220px]">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-200">{t('उपलब्ध निकासी बैलेंस', 'Withdrawable Balance')}</span>
            <div className="text-2xl font-black text-white">₹{agentWalletBalance.toFixed(2)}</div>
            <p className="text-[10px] text-emerald-300 font-semibold mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {t('तुरंत निकालने योग्य', 'Instant Payout Ready')}
            </p>
          </div>

          <div className="flex flex-col gap-2 mt-3 w-full">
            <button
              onClick={() => {
                setAgentWithdrawAmt(agentWalletBalance > 500 ? 500 : Math.floor(agentWalletBalance));
                setAgentWithdrawDone(false);
                setIsAgentWithdrawOpen(true);
              }}
              disabled={agentWalletBalance <= 0}
              className={`w-full py-2.5 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition shadow-md ${
                agentWalletBalance > 0
                  ? 'bg-white text-slate-950 hover:bg-amber-100 active:scale-95'
                  : 'bg-white/30 text-white/50 cursor-not-allowed'
              }`}
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>{t('पैसे निकालें (Withdraw Cash)', 'Withdraw to UPI / Bank')}</span>
            </button>

            <button
              onClick={() => setActiveService('agent')}
              className="text-center text-[11px] font-bold text-amber-200 hover:text-white hover:underline transition"
            >
              {t('पूरा एजेंट पोर्टल खोलें →', 'Open Full Agent Desk →')}
            </button>
          </div>
        </div>
      </div>

      {/* 3. SafarGo Travel Wallet Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Wallet Box */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{t('सफ़रगो पर्सनल ट्रेवल वॉलेट', 'SafarGo Personal Wallet')}</h3>
                  <p className="text-[11px] text-slate-400">{t('टिकट बुकिंग व तत्काल रिफंड के लिए उपयोगी', 'Instant checkout & zero gateway fee')}</p>
                </div>
              </div>

              <button
                onClick={() => setIsAddCashOpen(true)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('पैसे जोड़ें', 'Add Cash')}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 py-2">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('उपलब्ध बैलेंस (Travel Cash)', 'Travel Cash')}</span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
                  ₹{userProfile.walletBalance}
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold">{t('100% किसी भी बस या होटल पर उपयोग योग्य', 'Usable on all bus & hotel bookings')}</span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('प्रोमो कैश (Promo Cash)', 'Promo Cash')}</span>
                <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-0.5">
                  ₹{userProfile.promoCash}
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{t('अतिरिक्त 10% डिस्काउंट हेतु लागू', 'Auto-applied at payment')}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              {t('कैंसिलेशन पर 1-सेकंड रिफंड गारंटी', '1-second instant cancellation refund')}
            </span>
            <button 
              onClick={() => setIsAddCashOpen(true)}
              className="text-emerald-700 font-bold hover:underline text-[11px]"
            >
              {t('पैसे जोड़ें →', 'Add Cash →')}
            </button>
          </div>
        </div>

        {/* Gold Membership Perk */}
        <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-indigo-950 text-white rounded-3xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                VIP STATUS
              </span>
              <Award className="w-6 h-6 text-amber-300" />
            </div>

            <h4 className="text-lg font-black mt-3">SafarGo Gold Privileges</h4>
            <p className="text-xs text-indigo-100 mt-1 leading-relaxed">
              {t('फ्री सीट सिलेक्शन, ऑन-टाइम गारंटी और 24x7 वीआईपी सहायता।', 'Free seat selection, on-time bus guarantee, and 24x7 priority support.')}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/20 text-xs text-indigo-200 font-semibold flex items-center justify-between">
            <span>{t('सदस्यता वैधता:', 'Valid till:')} 31 Dec 2027</span>
            <span className="text-emerald-400 font-bold">ACTIVE ✓</span>
          </div>
        </div>
      </div>

      {/* 4. Saved Co-Passengers Section */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">{t('सहेजे गए सह-यात्री (Saved Co-Passengers)', 'Saved Co-Passengers')}</h3>
            <p className="text-xs text-slate-400">
              {t('बस टिकट बुक करते समय 1-क्लिक में यात्रियों का नाम भरने हेतु', 'Quick autofill passenger details during seat booking')}
            </p>
          </div>

          <button
            onClick={() => setIsAddPassengerOpen(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('नया यात्री जोड़ें', 'Add Passenger')}</span>
          </button>
        </div>

        {savedPassengers.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            {t('कोई सह-यात्री नहीं जोड़ा गया है।', 'No saved passengers yet. Add family members for quick booking!')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {savedPassengers.map((pass) => (
              <div 
                key={pass.id}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{pass.name}</h4>
                  <p className="text-[11px] text-slate-500 capitalize">
                    {pass.gender} • {pass.age} {t('वर्ष', 'years')}
                  </p>
                </div>

                <button
                  onClick={() => removeSavedPassenger(pass.id)}
                  title="Remove passenger"
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Active Offers & Scratch Coupons Inside My Account */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-rose-500" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">{t('मेरे कूपन व ऑफ़र्स (Exclusive Coupons)', 'My Coupons & Offers')}</h3>
              <p className="text-xs text-slate-400">{t('टिकट बुक करते समय कूपन कोड दर्ज करें', 'Apply these coupon codes during booking checkout')}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {promoOffers && promoOffers.filter(p => p.status === 'active').length > 0 ? (
            promoOffers.filter(p => p.status === 'active').map((promo) => (
              <div 
                key={promo.id} 
                className={`p-4 rounded-2xl border flex items-start justify-between transition ${
                  promo.serviceType === 'hotel'
                    ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200'
                    : 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
                }`}
              >
                <div>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    promo.serviceType === 'hotel' 
                      ? 'text-indigo-800 bg-indigo-100' 
                      : 'text-emerald-800 bg-emerald-100'
                  }`}>
                    {promo.serviceType.toUpperCase()} DISCOUNT
                  </span>
                  <h4 className="text-sm font-black text-slate-900 mt-1">
                    {promo.discountType === 'fixed' ? `₹${promo.discountValue} FLAT OFF` : `${promo.discountValue}% OFF`} • {promo.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{promo.description}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`font-mono font-bold text-xs bg-white px-2.5 py-1 rounded-md border ${
                      promo.serviceType === 'hotel' ? 'text-indigo-800 border-indigo-300' : 'text-emerald-800 border-emerald-300'
                    }`}>
                      {promo.code}
                    </span>
                    <button
                      onClick={() => handleCopyCoupon(promo.code)}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                    >
                      {copiedCoupon === promo.code ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCoupon === promo.code ? 'Copied!' : 'Copy'}</span>
                    </button>
                    <span className="text-[10px] text-slate-400">वैध: {promo.validTill}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-4 text-xs text-slate-400">
              कोई सक्रिय कूपन उपलब्ध नहीं है।
            </div>
          )}
        </div>
      </div>

      {/* 6. Shortcuts to Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div 
          onClick={() => setActiveService('trips')}
          className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-emerald-500 shadow-sm cursor-pointer transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">{t('मेरी बुकिंग व सपोर्ट टिकट', 'My Bookings & Support Tickets')}</h4>
              <p className="text-xs text-slate-400">{t('कन्फर्म टिकट, रेफर एवं कमाएं व सहायता टिकट', 'Bookings, Refer & Earn, Support Tickets')}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>

        <div 
          onClick={() => setActiveService('agent')}
          className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-amber-500 shadow-sm cursor-pointer transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">{t('एजेंट कमीशन हब (फिक्स ₹19.34)', 'Agent Commission Desk')}</h4>
              <p className="text-xs text-slate-400">{t('फिक्स ₹19.34 प्रति टिकट व तुरंत विड्रॉल', 'Fixed ₹19.34/booking & instant payout')}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>
      </div>

      {/* 7. Settings, Language & 24x7 Help */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 divide-y divide-slate-100 text-xs">
        {/* Language switcher */}
        <div className="py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-slate-500" />
            <div>
              <p className="font-bold text-slate-900 text-sm">{t('ऐप की भाषा (Language)', 'App Language')}</p>
              <p className="text-slate-400 text-[11px]">{language === 'hi' ? 'वर्तमान भाषा: हिंदी' : 'Current: English'}</p>
            </div>
          </div>
          <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 border border-slate-300 hover:border-emerald-500 rounded-xl font-bold text-xs text-slate-700 hover:text-emerald-700 transition"
          >
            {language === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
          </button>
        </div>

        {/* 24x7 Support */}
        <div className="py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Headphones className="w-5 h-5 text-slate-500" />
            <div>
              <p className="font-bold text-slate-900 text-sm">{t('24x7 ग्राहक सहायता (Support Helpline)', 'Customer Support')}</p>
              <p className="text-slate-400 text-[11px]">Toll-Free: 1800-SAFAR-GO • WhatsApp: +91 98200 12345</p>
            </div>
          </div>
          <a
            href="tel:1800-SAFAR-GO"
            className="px-3 py-1.5 bg-emerald-50 text-emerald-800 font-bold rounded-xl text-xs hover:bg-emerald-100 transition"
          >
            {t('कॉल करें', 'Call Now')}
          </a>
        </div>

        {/* Women safety */}
        <div className="py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="font-bold text-slate-900 text-sm">{t('महिला सुरक्षा व आपातकालीन सहायता', 'Women Safety & SOS')}</p>
              <p className="text-slate-400 text-[11px]">{t('प्रत्येक बस में जीपीएस एवं महिला हेल्पलाइन', 'Dedicated 24x7 emergency desk')}</p>
            </div>
          </div>
          <span className="text-emerald-600 font-bold">100% Verified</span>
        </div>
      </div>

      {/* 8. LEGAL POLICIES, HELP & ANTI-FRAUD SECURITY CENTER (अकाउंट ऑप्शन में नीचे) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {t('कानूनी नीतियां, सहायता एवं सुरक्षा केंद्र', 'Legal Policies, Support & Safety Center')}
              </h3>
              <p className="text-xs text-slate-400">
                {t('सफ़रगो आधिकारिक नीतियां, 24x7 सपोर्ट व धोखाधड़ी रोकथाम नियम', 'Official policies, 24x7 helpdesk, DPDP privacy & anti-fraud terms')}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200">
            OFFICIAL COMPLIANCE
          </span>
        </div>

        {/* 1. Official Help & Email Card with support@safargo.in */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl shrink-0 shadow-md shadow-blue-600/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900 text-sm">{t('24x7 हेल्प डेस्क व आधिकारिक सपोर्ट ईमेल', 'Official Customer & Agent Help')}</h4>
                <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded">24x7 SUPPORT</span>
              </div>
              <p className="text-sm text-blue-900 font-mono font-black mt-0.5 select-all">
                support@safargo.in
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {t('एजेंट सत्यापन, पेमेंट, वॉलेट ऑडिट या टिकट से जुड़े किसी भी सवाल के लिए संपर्क करें।', 'Send email for agent KYC status, payments, ticket refund or queries.')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="mailto:support@safargo.in?subject=SafarGo Support Request"
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{t('ईमेल भेजें', 'Email Us')}</span>
            </a>
            <button
              onClick={() => openLegalModal('help')}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition"
            >
              {t('हेल्पलाइन नंबर →', 'Helplines →')}
            </button>
          </div>
        </div>

        {/* 2. Grid of 4 Policies */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* About Us */}
          <div 
            onClick={() => openLegalModal('about')}
            className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-400 hover:shadow-sm cursor-pointer transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-slate-900 text-xs">{t('सफ़रगो परिचय (About Us)', 'About SafarGo')}</h5>
                <p className="text-[11px] text-slate-400">{t('भारत का अपना डिजिटल मोबिलिटी व टिकट नेटवर्क', 'Mobility reselling empowering 10L+ kiosks')}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </div>

          {/* Privacy Policy */}
          <div 
            onClick={() => openLegalModal('privacy')}
            className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-emerald-400 hover:shadow-sm cursor-pointer transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-slate-900 text-xs">{t('गोपनीयता नीति (Privacy Policy)', 'Privacy Policy')}</h5>
                <p className="text-[11px] text-slate-400">{t('256-बिट बैंक एन्क्रिप्शन, शून्य डेटा शेयरिंग', 'Aadhaar/PAN encrypted • Zero data selling')}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </div>

          {/* Refund Policy */}
          <div 
            onClick={() => openLegalModal('refund')}
            className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-amber-400 hover:shadow-sm cursor-pointer transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-slate-900 text-xs">{t('रिफंड व रद्दीकरण नीति (Refund Policy)', 'Refund Policy')}</h5>
                <p className="text-[11px] text-slate-400">{t('100% त्वरित रिफंड, 1-सेकंड वॉलेट क्रेडिट', 'Instant bus cancellation refund rules')}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </div>

          {/* Anti-Fraud & Strict Suspension Disclaimer */}
          <div 
            onClick={() => openLegalModal('fraud_policy')}
            className="p-3.5 rounded-2xl border-2 border-rose-200 bg-rose-50/70 hover:bg-rose-50 hover:border-rose-400 hover:shadow-sm cursor-pointer transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-200 text-rose-800 rounded-xl shrink-0">
                <ShieldAlert className="w-4 h-4 text-rose-700" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h5 className="font-bold text-rose-900 text-xs">{t('धोखाधड़ी रोकथाम नीति (Fraud Policy)', 'Fraud Policy & Suspend Terms')}</h5>
                  <span className="text-[9px] font-black uppercase text-rose-700 bg-rose-200 px-1 rounded">STRICT</span>
                </div>
                <p className="text-[11px] text-rose-700/80">{t('फर्जी UTR, जाली KYC पर खाता निलंबन व IT Act धारा 66D/420', 'Zero tolerance: blacklist, balance forfeit & FIR')}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-400 shrink-0" />
          </div>
        </div>

        {/* 3. Prominent Anti-Fraud Disclaimer Box */}
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block text-slate-900 text-[11px] uppercase tracking-wider">
              {t('सख्त सुरक्षा अस्वीकरण (Strict Anti-Fraud Disclaimer)', 'Strict Anti-Fraud Compliance Disclaimer')}
            </span>
            <p className="text-[11px] leading-relaxed text-slate-600">
              {t(
                'सफ़रगो पर फर्जी UTR नंबर, मनगढ़ंत ट्रांजैक्शन अथवा जाली आधार/पैन दस्तावेज़ अपलोड करना कानूनन अपराध है। ऐसे खातों को बिना पूर्व सूचना के तत्काल स्थायी रूप से निलंबित कर दिया जाएगा, वॉलेट बैलेंस शून्य कर दिया जाएगा और भारतीय आईटी कानून 2000 (Section 66D) व BNS/IPC (Section 420) के तहत कानूनी प्राथमिकी (FIR) दर्ज होगी।',
                'Submitting fraudulent UTRs, altered documents, or unauthorized transactions will result in instant account suspension, balance forfeiture, and formal criminal prosecution under IT Act Section 66D & IPC Section 420.'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 7.5 DANGER ZONE: AGENT PROFILE & ACCOUNT DELETION */}
      <div className="bg-red-50/70 rounded-3xl p-6 border-2 border-red-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-red-100 text-red-600 rounded-2xl shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-red-950 text-sm">
                {t('एजेंट प्रोफ़ाइल व खाता डिलीट करें (Danger Zone)', 'Delete Agent Profile & Account')}
              </h4>
              <p className="text-xs text-red-800/80 mt-0.5 leading-relaxed">
                {t(
                  'यदि आप SafarGo पार्टनर प्रोग्राम छोड़ना चाहते हैं, तो आप अपना प्रोफ़ाइल और खाता स्थायी रूप से डिलीट कर सकते हैं। आपके सभी KYC दस्तावेज़, एजेंट आईडी और रिकॉर्ड तत्काल हटा दिए जाएंगे।',
                  'Permanently delete your agent account, profile, and submitted KYC records from SafarGo. This action cannot be undone.'
                )}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md shadow-red-600/20 transition active:scale-95 shrink-0 flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t('खाता डिलीट करें', 'Delete Account')}</span>
          </button>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-red-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-black text-slate-900 text-base">
                  {t('खाता स्थायी रूप से डिलीट करें?', 'Permanently Delete Account?')}
                </h3>
              </div>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-900 space-y-2">
              <p className="font-bold">
                ⚠️ {t('सावधानी: यह कार्रवाई पूर्ववत नहीं की जा सकती!', 'Warning: This action is permanent and irreversible!')}
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-red-800">
                <li>{t('आपकी एजेंट आईडी व e-KYC दस्तावेज मिटा दिए जाएंगे।', 'Agent ID & verified KYC docs will be wiped.')}</li>
                <li>{t('बचा हुआ वॉलेट बैलेंस अमान्य हो जाएगा।', 'Any remaining unclaimed balance will be closed.')}</li>
                <li>{t('भविष्य में लॉगिन करने हेतु पुनः 5-Step ऑनबोर्डिंग करनी होगी।', 'You will need to register afresh to re-join.')}</li>
              </ul>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                {t('रद्द करें (Cancel)', 'Cancel')}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setIsDeleting(true);
                  setTimeout(() => {
                    const targetId = currentAgent?.id || userProfile.email || userProfile.phone || '';
                    if (targetId) {
                      deleteAgentAccount(targetId);
                    }
                    setIsDeleting(false);
                    setIsDeleteModalOpen(false);
                    alert(t('आपका खाता और प्रोफ़ाइल SafarGo से सफलतापूर्वक डिलीट कर दिया गया है।', 'Your account has been permanently deleted.'));
                  }, 600);
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-lg shadow-red-600/30 transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? t('डिलीट हो रहा है...', 'Deleting...') : t('हाँ, खाता डिलीट करें', 'Yes, Delete Account')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )}

      {/* 8. Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-black text-slate-900 text-base">{t('प्रोफ़ाइल विवरण बदलें', 'Edit Profile Details')}</h3>
              <button 
                onClick={() => setIsEditProfileOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('पूरा नाम', 'Full Name')}</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full font-semibold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('मोबाइल नंबर', 'Mobile Number')}</label>
                <input
                  type="tel"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full font-semibold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('ईमेल पता', 'Email Address')}</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full font-semibold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('लिंग', 'Gender')}</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value as any)}
                    className="w-full font-semibold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="male">{t('पुरुष (Male)', 'Male')}</option>
                    <option value="female">{t('महिला (Female)', 'Female')}</option>
                    <option value="other">{t('अन्य (Other)', 'Other')}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('जन्म तिथि', 'Date of Birth')}</label>
                  <input
                    type="text"
                    value={editDob}
                    onChange={(e) => setEditDob(e.target.value)}
                    className="w-full font-semibold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('आपातकालीन संपर्क नंबर (Emergency Contact)', 'Emergency Contact')}</label>
                <input
                  type="tel"
                  value={editEmergency}
                  onChange={(e) => setEditEmergency(e.target.value)}
                  placeholder="98XXXXXXXX"
                  className="w-full font-semibold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  {t('रद्द करें', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/30"
                >
                  {t('सहेजें (Save)', 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Add Co-Passenger Modal */}
      {isAddPassengerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-black text-slate-900 text-base">{t('नया सह-यात्री जोड़ें', 'Add Saved Passenger')}</h3>
              <button 
                onClick={() => setIsAddPassengerOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPassenger} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('यात्री का पूरा नाम', 'Passenger Full Name')}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meera Sharma"
                  value={newPassName}
                  onChange={(e) => setNewPassName(e.target.value)}
                  className="w-full font-semibold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('उम्र', 'Age')}</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    required
                    value={newPassAge}
                    onChange={(e) => setNewPassAge(Number(e.target.value))}
                    className="w-full font-semibold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('लिंग', 'Gender')}</label>
                  <select
                    value={newPassGender}
                    onChange={(e) => setNewPassGender(e.target.value as any)}
                    className="w-full font-semibold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="male">{t('पुरुष (Male)', 'Male')}</option>
                    <option value="female">{t('महिला (Female)', 'Female')}</option>
                    <option value="other">{t('अन्य (Other)', 'Other')}</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddPassengerOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  {t('रद्द करें', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/30"
                >
                  {t('यात्री जोड़ें', 'Add Passenger')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. ADVANCE SAFARGO DYNAMIC QR & ANTI-FRAUD TOP-UP MODAL */}
      {isAddCashOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200 my-auto animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {t('वॉलेट में पैसे जोड़ें (SafarGo QR)', 'Add Wallet Money via SafarGo QR')}
                  </h3>
                  <span className="text-[10px] text-emerald-700 font-bold block">
                    ✓ तत्काल ऑटोमैटिक क्रेडिट • एंटी-फ्रॉड सुरक्षा युक्त
                  </span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsAddCashOpen(false);
                  setTopUpStep('amount');
                  setUtrError('');
                }}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* STEP 1: SELECT AMOUNT */}
            {topUpStep === 'amount' && (
              <div className="space-y-4 text-xs">
                <div className="text-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <span className="text-xs text-emerald-800 font-medium">{t('वर्तमान उपलब्ध बैलेंस:', 'Current Balance:')}</span>
                  <div className="text-2xl font-black text-emerald-950 mt-0.5">
                    ₹{currentAgent ? agentWalletBalance.toFixed(2) : userProfile.walletBalance.toFixed(2)}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">{t('राशि चुनें', 'Select Amount')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[200, 500, 1000, 2000, 5000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setCashAmount(amt)}
                        className={`py-2.5 rounded-xl font-black border transition ${
                          cashAmount === amt 
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                            : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        +₹{amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('या कस्टम राशि दर्ज करें (₹)', 'Or Enter Custom Amount')}</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      min={50}
                      max={50000}
                      value={cashAmount}
                      onChange={(e) => setCashAmount(Number(e.target.value))}
                      className="w-full pl-8 pr-4 font-black text-base py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setTopUpStep('qr_pay');
                    setQrTimer(300);
                    setEnteredUtr('');
                    setUtrError('');
                  }}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 active:scale-95"
                >
                  <QrCode className="w-4 h-4" />
                  <span>{t(`SafarGo QR कोड जनरेट करें (₹${cashAmount})`, `Generate SafarGo QR (₹${cashAmount})`)}</span>
                </button>
              </div>
            )}

            {/* STEP 2: DYNAMIC QR & 12-DIGIT UTR VALIDATION */}
            {topUpStep === 'qr_pay' && (
              <div className="space-y-4 text-xs">
                {/* Official SafarGo QR Container */}
                <div className="bg-slate-900 rounded-2xl p-4 text-center text-white space-y-3 relative overflow-hidden">
                  <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                    <ShieldCheck className="w-3 h-3 text-slate-950" />
                    SafarGo Official Merchant QR
                  </div>

                  {/* QR Image Box */}
                  <div className="bg-white p-3 rounded-2xl max-w-[210px] mx-auto shadow-inner">
                    <img
                      src={
                        adminQrConfig.qrCodeImageUrl ||
                        `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                          `upi://pay?pa=${adminQrConfig.merchantUpiId}&pn=${adminQrConfig.merchantName}&am=${cashAmount}&cu=INR&tn=SafarGoWalletTopUp`
                        )}`
                      }
                      alt="SafarGo Official Payment QR Code"
                      className="w-full h-auto rounded-lg mx-auto"
                    />
                    <div className="pt-2 text-[10px] font-mono font-bold text-slate-900">
                      SCAN VIA ANY UPI APP
                    </div>
                  </div>

                  {/* Merchant & Amount Info */}
                  <div className="space-y-1">
                    <div className="text-xl font-black text-white">
                      ₹{cashAmount.toFixed(2)}
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium">
                      {adminQrConfig.merchantName}
                    </p>

                    {/* Copy UPI Button */}
                    <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-[11px] font-mono">
                      <span>{adminQrConfig.merchantUpiId}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(adminQrConfig.merchantUpiId);
                          setCopiedUpi(true);
                          setTimeout(() => setCopiedUpi(false), 2000);
                        }}
                        className="text-amber-300 hover:text-white font-bold"
                      >
                        {copiedUpi ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>

                    <div className="text-[10px] text-amber-300 font-semibold pt-1">
                      ⏱️ QR कोड समय सीमा: {Math.floor(qrTimer / 60)}:{('0' + (qrTimer % 60)).slice(-2)}
                    </div>
                  </div>
                </div>

                {/* Anti-Fraud UTR Entry Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setUtrError('');
                    const res = submitWalletTopUp(cashAmount, enteredUtr);
                    if (!res.success) {
                      setUtrError(res.message);
                      return;
                    }
                    setLastTopUpReceipt(res.request);
                    setTopUpStep('success');
                    try {
                      confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
                    } catch {}
                  }}
                  className="space-y-3"
                >
                  {utrError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{utrError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block font-black text-slate-900 mb-1">
                      {t('12-अंकीय बैंक UTR / रेफरेंस नंबर दर्ज करें:', 'Enter 12-Digit Bank UTR / Reference No:')}
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={22}
                      value={enteredUtr}
                      onChange={(e) => setEnteredUtr(e.target.value.replace(/\s/g, ''))}
                      placeholder="उदा. 629410492810 या UPI Ref No"
                      className="w-full font-mono font-black text-sm tracking-wider px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Google Pay, PhonePe या Paytm की रसीद से 12-अंकीय UPI Ref / UTR कॉपी करें।
                    </span>
                  </div>

                  {/* Security Notice */}
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong>एंटी-फ्रॉड सुरक्षा:</strong> स्क्रीनशॉट अपलोड करने की आवश्यकता नहीं है। बैंक UTR नंबर सीधे SafarGo एडमिन ऑडिट में दर्ज होगा। फर्जी UTR पाए जाने पर एजेंट खाता तत्काल सस्पेंड कर दिया जाएगा।
                    </p>
                  </div>

                  <div className="flex gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setTopUpStep('amount')}
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                    >
                      पीछे
                    </button>
                    <button
                      type="submit"
                      disabled={enteredUtr.trim().length < 8}
                      className={`flex-1 py-3 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 ${
                        enteredUtr.trim().length >= 8
                          ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30 active:scale-95'
                          : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>{t('सत्यापित करें एवं पैसे जोड़ें', 'Verify UTR & Add Money')}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 3: SUCCESS CONFIRMATION RECEIPT */}
            {topUpStep === 'success' && lastTopUpReceipt && (
              <div className="text-center py-4 space-y-4 text-xs">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-black text-slate-900">
                  {t('वॉलेट में पैसे सफलतापूर्वक जुड़ गए!', 'Money Added Successfully!')}
                </h4>
                <p className="text-slate-500">
                  {t(`₹${cashAmount.toFixed(2)} आपके वॉलेट में क्रेडिट हो चुके हैं।`, `₹${cashAmount.toFixed(2)} has been credited.`)}
                </p>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-left space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">लेन-देन ID:</span>
                    <span className="font-bold text-slate-900">{lastTopUpReceipt.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">बैंक UTR:</span>
                    <span className="font-bold text-emerald-700">{lastTopUpReceipt.utr}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">राशि:</span>
                    <span className="font-bold text-slate-900">₹{lastTopUpReceipt.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ऑडिट स्थिति:</span>
                    <span className="font-bold text-indigo-600">दर्ज एवं सत्यापित ✓</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsAddCashOpen(false);
                    setTopUpStep('amount');
                  }}
                  className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition"
                >
                  {t('पूर्ण (Done)', 'Done')}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 11. AGENT COMMISSION WITHDRAWAL MODAL INSIDE PROFILE */}
      {isAgentWithdrawOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <ArrowDownToLine className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">{t('एजेंट कमीशन निकासी (Withdrawal)', 'Withdraw Agent Earnings')}</h3>
                  <p className="text-[11px] text-slate-400">{t('उपलब्ध बैलेंस:', 'Available Balance:')} ₹{agentWalletBalance.toFixed(2)}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAgentWithdrawOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!agentWithdrawDone ? (
              <form onSubmit={handleAgentWithdrawSubmit} className="space-y-4 text-xs">
                {/* Amount input */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('निकासी राशि (Amount)', 'Withdrawal Amount (₹)')}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-bold text-slate-500">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min={10}
                      max={agentWalletBalance}
                      required
                      value={agentWithdrawAmt}
                      onChange={(e) => setAgentWithdrawAmt(Number(e.target.value))}
                      className="w-full font-black text-base pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2 mt-2">
                    {[200, 500, Math.floor(agentWalletBalance)].map((amt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAgentWithdrawAmt(amt)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-semibold text-slate-700"
                      >
                        {idx === 2 ? t('पूरा बैलेंस', 'Full Balance') : `₹${amt}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transfer Destination Tabs */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">{t('निकासी माध्यम चुनें', 'Transfer Mode')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAgentPayoutMethod('upi')}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                        agentPayoutMethod === 'upi'
                          ? 'bg-amber-50 border-amber-500 text-amber-950 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <QrCode className="w-4 h-4" />
                      <span>{t('UPI (तुरंत 5 सेकंड)', 'UPI (Instant)')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAgentPayoutMethod('bank')}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                        agentPayoutMethod === 'bank'
                          ? 'bg-amber-50 border-amber-500 text-amber-950 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <Building className="w-4 h-4" />
                      <span>{t('बैंक खाता (IMPS)', 'Bank A/C')}</span>
                    </button>
                  </div>
                </div>

                {agentPayoutMethod === 'upi' ? (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{t('अपनी UPI ID दर्ज करें', 'Enter UPI ID (VPA)')}</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. yourname@paytm / name@okhdfcbank"
                      value={agentUpi}
                      onChange={(e) => setAgentUpi(e.target.value)}
                      className="w-full font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">PhonePe, GPay, Paytm, BHIM</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">{t('बैंक खाता संख्या', 'Account Number')}</label>
                      <input
                        type="text"
                        required
                        value={agentBankAcc}
                        onChange={(e) => setAgentBankAcc(e.target.value)}
                        className="w-full font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">{t('IFSC कोड', 'IFSC Code')}</label>
                      <input
                        type="text"
                        required
                        value={agentIfsc}
                        onChange={(e) => setAgentIfsc(e.target.value)}
                        className="w-full font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-black text-sm rounded-xl shadow-md shadow-amber-600/30 transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  <span>{t(`₹${agentWithdrawAmt.toFixed(2)} अभी निकालें`, `Withdraw ₹${agentWithdrawAmt.toFixed(2)} Now`)}</span>
                </button>
              </form>
            ) : (
              <div className="text-center py-4 space-y-4 text-xs">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h4 className="text-lg font-black text-slate-900">{t('कमीशन निकासी सफल!', 'Commission Withdrawal Successful!')}</h4>
                <p className="text-slate-500">
                  {t(`₹${agentWithdrawAmt.toFixed(2)} आपके खाते में क्रेडिट कर दिया गया है।`, `₹${agentWithdrawAmt.toFixed(2)} has been transferred successfully.`)}
                </p>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-left space-y-1">
                  <p><span className="text-slate-400">UTR संख्या:</span> <span className="font-mono font-bold text-slate-900">{agentTxnUtr}</span></p>
                  <p><span className="text-slate-400">गंतव्य:</span> <span className="font-bold text-slate-900">{agentPayoutMethod === 'upi' ? agentUpi : `${agentBankName} (${agentBankAcc})`}</span></p>
                  <p><span className="text-slate-400">शेष वॉलेट बैलेंस:</span> <span className="font-bold text-emerald-700">₹{agentWalletBalance.toFixed(2)}</span></p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAgentWithdrawOpen(false)}
                  className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition"
                >
                  {t('पूर्ण (Done)', 'Done')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Official PDF Application Dossier Modal */}
      <ApplicationDossierModal
        agent={currentAgent}
        isOpen={isAccountDossierOpen}
        onClose={() => setIsAccountDossierOpen(false)}
      />

      {/* Official Legal Policies, Help & Fraud Disclaimer Modal */}
      <LegalPoliciesModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        initialTab={legalModalTab}
      />
    </div>
  );
};
