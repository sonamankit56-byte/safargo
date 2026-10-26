import React, { useState } from 'react';
import { useTravel, ADMIN_EMAILS } from '../../context/TravelContext';
import { FIXED_AGENT_COMMISSION, AgentUser, BusItem, BusSeat, StopPoint, WalletTopUpRequest, TravelBooking } from '../../types/travel';
import { 
  Wallet, 
  TrendingUp, 
  Users, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Download, 
  Share2, 
  ShieldCheck, 
  Bus, 
  Building2,
  Sparkles,
  ArrowDownToLine,
  X,
  CreditCard,
  QrCode,
  Ticket,
  Building,
  Check,
  LogOut,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Award,
  RefreshCw,
  Mail,
  Inbox,
  Search,
  Ban,
  Key,
  Printer,
  Eye,
  Unlock,
  ShieldAlert,
  FileText,
  Plus,
  Trash2,
  Edit3,
  Camera,
  Upload,
  Copy,
  ExternalLink,
  Filter,
  DollarSign,
  Calendar,
  Wifi,
  Zap,
  Navigation,
  PhoneCall,
  Tag,
  Percent,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AgentAuthGateway } from './AgentAuthGateway';
import { ApplicationDossierModal } from './ApplicationDossierModal';
import { AgentMarketingStudio } from './AgentMarketingStudio';
import { AdminBusManagement } from '../admin/AdminBusManagement';
import { getGoogleMapsApiKey, setStoredGoogleMapsApiKey, getGoogleMapsDirectionsUrl } from '../../lib/googleMaps';
import { testYoupiConnection } from '../../lib/youpiPg';
import { testOpenWaConnection, sendOpenWaMessage } from '../../lib/whatsappService';

export const AgentEarningDesk: React.FC = () => {
  const { 
    isAgentMode, 
    setIsAgentMode, 
    isAgentLoggedIn,
    currentAgent,
    agentLogout,
    deleteAgentAccount,
    agentApplications,
    approveAgent,
    rejectAgent,
    suspendAgent,
    reactivateAgent,
    updateAgent,
    setAgentPassword,
    agentWalletBalance, 
    agentPayoutHistory, 
    withdrawAgentEarnings,
    bookings, 
    verifyBusBooking,
    rejectBusBooking,
    setActiveService, 
    setCurrentStep, 
    t,
    buses,
    addBus,
    deleteBus,
    updateBus,
    walletTopUpRequests,
    verifyTopUpRequest,
    suspendFraudTopUp,
    adminQrConfig,
    updateAdminQrConfig,
    promoOffers,
    addPromoOffer,
    togglePromoOfferStatus,
    deletePromoOffer,
    youpiConfig,
    updateYoupiConfig,
    openWaConfig,
    updateOpenWaConfig,
    sendBookingWhatsApp
  } = useTravel();

  // Admin View States
  const isAdmin = currentAgent?.role === 'admin' || (currentAgent?.email && ADMIN_EMAILS.includes(currentAgent.email.toLowerCase()));
  const [adminActiveTab, setAdminActiveTab] = useState<'approvals' | 'manage_agents' | 'payments' | 'buses' | 'ticket_review' | 'promo_codes' | 'gateways' | 'marketing' | 'desk'>('approvals');
  const [appFilter, setAppFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [adminToast, setAdminToast] = useState('');

  // Gateway Desk States
  const [youpiApiUrlInput, setYoupiApiUrlInput] = useState(youpiConfig.apiUrl);
  const [youpiMerchantIdInput, setYoupiMerchantIdInput] = useState(youpiConfig.merchantId);
  const [youpiVpaInput, setYoupiVpaInput] = useState(youpiConfig.merchantUpiVpa);
  const [youpiNameInput, setYoupiNameInput] = useState(youpiConfig.merchantName);
  const [youpiSandboxInput, setYoupiSandboxInput] = useState(youpiConfig.autoConfirmSandbox);
  const [youpiTesting, setYoupiTesting] = useState(false);
  const [youpiTestResult, setYoupiTestResult] = useState<{ online: boolean; message: string; latencyMs?: number } | null>(null);

  const [openWaApiUrlInput, setOpenWaApiUrlInput] = useState(openWaConfig.apiUrl);
  const [openWaSessInput, setOpenWaSessInput] = useState(openWaConfig.sessionId);
  const [openWaKeyInput, setOpenWaKeyInput] = useState(openWaConfig.apiKey);
  const [openWaFallbackInput, setOpenWaFallbackInput] = useState(openWaConfig.fallbackToWhatsAppWeb);
  const [openWaTesting, setOpenWaTesting] = useState(false);
  const [gmapsKeyInput, setGmapsKeyInput] = useState(() => getGoogleMapsApiKey());
  const [openWaTestResult, setOpenWaTestResult] = useState<{ online: boolean; message: string; latencyMs?: number } | null>(null);

  const [testWaPhone, setTestWaPhone] = useState('9811000001');
  const [testWaMessage, setTestWaMessage] = useState('सफ़रगो WhatsApp API गेटवे टेस्ट संदेश। SafarGo live messaging.');
  const [sendingTestWa, setSendingTestWa] = useState(false);
  const [testWaResult, setTestWaResult] = useState<string | null>(null);
  const [sendingWhatsAppTicketId, setSendingWhatsAppTicketId] = useState<string | null>(null);

  // Promo Code & Offers Management States
  const [promoSearchQuery, setPromoSearchQuery] = useState('');
  const [promoStatusFilter, setPromoStatusFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoTitleInput, setPromoTitleInput] = useState('');
  const [promoDescInput, setPromoDescInput] = useState('');
  const [promoDiscountType, setPromoDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [promoDiscountVal, setPromoDiscountVal] = useState<number>(150);
  const [promoMinBooking, setPromoMinBooking] = useState<number>(300);
  const [promoServiceType, setPromoServiceType] = useState<'bus' | 'hotel' | 'all'>('bus');
  const [promoValidTill, setPromoValidTill] = useState('31 Dec 2026');

  // Ticket Review Desk States
  const [ticketReviewFilter, setTicketReviewFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('pending');
  const [ticketSearchQuery, setTicketSearchQuery] = useState('');
  const [selectedTicketForDossier, setSelectedTicketForDossier] = useState<TravelBooking | null>(null);
  const [isTicketDossierModalOpen, setIsTicketDossierModalOpen] = useState(false);
  const [rejectModalTicket, setRejectModalTicket] = useState<TravelBooking | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('अमान्य अथवा फर्जी बैंक UTR नंबर');
  const [suspendAgentOnReject, setSuspendAgentOnReject] = useState(false);
  const [verifyingTicketId, setVerifyingTicketId] = useState<string | null>(null);

  // Dossier Modal State (Admin Review & Print)
  const [selectedDossierAgent, setSelectedDossierAgent] = useState<AgentUser | null>(null);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);

  // Manage Agents Desk States (Search / Filter / Suspend / Password)
  const [agentSearchQuery, setAgentSearchQuery] = useState('');
  const [agentStatusFilter, setAgentStatusFilter] = useState<'all' | 'active' | 'suspended' | 'pending'>('all');
  const [suspendModalAgent, setSuspendModalAgent] = useState<AgentUser | null>(null);
  const [suspendReasonInput, setSuspendReasonInput] = useState('');
  const [balanceModalAgent, setBalanceModalAgent] = useState<AgentUser | null>(null);
  const [balanceAdjustAmount, setBalanceAdjustAmount] = useState<number>(500);
  const [balanceAdjustType, setBalanceAdjustType] = useState<'credit' | 'debit'>('credit');
  const [balanceAdjustNote, setBalanceAdjustNote] = useState<string>('एडमिन द्वारा वॉलेट टॉप-अप');
  const [passwordModalAgent, setPasswordModalAgent] = useState<AgentUser | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // Payment Audit & SafarGo QR Config Desk States
  const [paymentSearchQuery, setPaymentSearchQuery] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | 'pending_audit' | 'verified' | 'fraud_suspended'>('all');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [newMerchantUpi, setNewMerchantUpi] = useState(() => adminQrConfig?.merchantUpiId || 'safargo.travel@icici');
  const [newMerchantName, setNewMerchantName] = useState(() => adminQrConfig?.merchantName || 'SafarGo Mobility Services Ltd');
  const [newQrImage, setNewQrImage] = useState(() => adminQrConfig?.qrCodeImageUrl || '');
  const [fraudModalTopUp, setFraudModalTopUp] = useState<WalletTopUpRequest | null>(null);
  const [fraudReasonInput, setFraudReasonInput] = useState('');

  // Instant Withdrawal Modal State
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(500);
  const [payoutMethod, setPayoutMethod] = useState<'upi' | 'bank'>('upi');
  const [upiId, setUpiId] = useState(() => currentAgent?.settlementUpiId || '');
  const [bankAccount, setBankAccount] = useState(() => currentAgent?.accountNumber || '');
  const [ifscCode, setIfscCode] = useState(() => currentAgent?.ifsc || '');
  const [bankName, setBankName] = useState(() => currentAgent?.bankName || '');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [lastTxnUtr, setLastTxnUtr] = useState('');

  // If agent is not logged in, render the clean-room Agent Login & 5-Step Onboarding Gateway
  if (!isAgentLoggedIn) {
    return <AgentAuthGateway />;
  }

  const totalCommissionEarned = bookings.reduce((sum, b) => sum + (b.agentCommissionAmount || 0), 0) + agentWalletBalance;

  const handleOpenWithdraw = () => {
    setWithdrawAmount(agentWalletBalance > 500 ? 500 : Math.floor(agentWalletBalance));
    setWithdrawSuccess(false);
    setIsWithdrawModalOpen(true);
  };

  const handleProcessWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount <= 0 || withdrawAmount > agentWalletBalance) {
      alert(t('निकासी राशि उपलब्ध बैलेंस से अधिक नहीं हो सकती', 'Withdrawal amount cannot exceed available balance'));
      return;
    }

    const destination = payoutMethod === 'upi' ? `UPI: ${upiId}` : `${bankName} (A/C **${bankAccount.slice(-4)})`;
    const success = withdrawAgentEarnings(withdrawAmount, { type: payoutMethod, destination });

    if (success) {
      setLastTxnUtr(`UTR${Math.floor(100000000 + Math.random() * 900000000)}`);
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      setWithdrawSuccess(true);
    }
  };

  const handleApproveAgent = async (agentId: string) => {
    setApprovingId(agentId);
    try {
      await approveAgent(agentId);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
      setAdminToast(t('✅ एजेंट का 24-घंटे सत्यापन पूर्ण हुआ! स्वीकृति ईमेल Gmail पर भेज दी गई है।', '✅ Agent approved! Approval email dispatched via Resend.'));
      setTimeout(() => setAdminToast(''), 6000);
    } finally {
      setApprovingId(null);
    }
  };

  const filteredApplications = agentApplications.filter(a => {
    if (appFilter === 'pending') return !a.isApproved;
    if (appFilter === 'approved') return a.isApproved;
    return true;
  });

  const pendingCount = agentApplications.filter(a => !a.isApproved).length;
  const approvedCount = agentApplications.filter(a => a.isApproved).length;
  const pendingPaymentsCount = walletTopUpRequests.filter(r => r.status === 'pending_audit').length;
  const pendingTicketsCount = bookings.filter(b => b.status === 'pending').length;
  const verifiedTicketsCount = bookings.filter(b => b.status === 'confirmed').length;

  const handleVerifyTicket = async (bookingId: string) => {
    setVerifyingTicketId(bookingId);
    try {
      const ok = await verifyBusBooking(bookingId);
      if (ok) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
        setAdminToast('🎉 टिकट सफलतापूर्वक सत्यापित! एजेंट के लिए ई-टिकट डाउनलोड अनलॉक हो गया है और Gmail सूचना भेजी गई है।');
        setTimeout(() => setAdminToast(''), 6000);
      }
    } finally {
      setVerifyingTicketId(null);
    }
  };

  const handleConfirmRejectTicket = () => {
    if (!rejectModalTicket) return;
    rejectBusBooking(rejectModalTicket.id, rejectReasonInput, suspendAgentOnReject);
    setAdminToast(`🚨 टिकट PNR ${rejectModalTicket.pnr} अस्वीकृत कर दिया गया है।`);
    setTimeout(() => setAdminToast(''), 5000);
    setRejectModalTicket(null);
    setSuspendAgentOnReject(false);
  };

  // QR Code Image File Upload Handler
  const handleQrImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('कृपया 3MB से कम आकार की इमेज चुनें।');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewQrImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveQrConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateAdminQrConfig({
      merchantUpiId: newMerchantUpi.trim(),
      merchantName: newMerchantName.trim(),
      qrCodeImageUrl: newQrImage
    });
    setAdminToast('✅ सफ़रगो आधिकारिक QR कोड व मर्चेंट UPI विवरण सफलतापूर्वक अपडेट कर दिया गया!');
    setTimeout(() => setAdminToast(''), 5000);
    setIsQrModalOpen(false);
  };

  const handleConfirmFraudSuspend = () => {
    if (!fraudModalTopUp) return;
    const reason = fraudReasonInput.trim() || 'फर्जी / अमान्य UTR दर्ज करके वॉलेट क्रेडिट लेने का प्रयास (Fake UTR Fraud)';
    suspendFraudTopUp(fraudModalTopUp.id, reason);
    setAdminToast(`🚨 एजेंट ${fraudModalTopUp.agentName} (${fraudModalTopUp.mobile}) की आईडी सस्पेंड कर दी गई और ₹${fraudModalTopUp.amount} वॉलेट से वापस काट लिया गया!`);
    setTimeout(() => setAdminToast(''), 6000);
    setFraudModalTopUp(null);
    setFraudReasonInput('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-28 space-y-6">
      {/* Toast Notification */}
      {adminToast && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-400 text-emerald-950 text-xs sm:text-sm font-bold rounded-2xl shadow-md flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{adminToast}</span>
          </div>
          <button onClick={() => setAdminToast('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Logged-In Agent Identity Strip */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className={`w-11 h-11 rounded-2xl text-white flex items-center justify-center font-black text-lg shadow-md ${
            isAdmin ? 'bg-gradient-to-tr from-amber-600 to-amber-400 shadow-amber-500/20' : 'bg-gradient-to-tr from-rose-600 to-rose-400 shadow-rose-600/20'
          }`}>
            {isAdmin ? '👑' : currentAgent?.fullName?.charAt(0) || 'A'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 text-sm sm:text-base">
                {currentAgent?.shopName || 'SafarGo Partner Kiosk'}
              </h3>
              <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                isAdmin ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {isAdmin ? t('सुपर एडमिन (Super Admin)', 'Super Admin') : t('सत्यापित एजेंट', 'Verified Agent')}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-0.5">
              <span>{currentAgent?.fullName || t('अधिकृत एजेंट', 'Authorized Agent')}</span>
              <span>•</span>
              <span className="font-mono text-slate-700 font-bold">{currentAgent?.id || 'SFG-AGENT'}</span>
              <span>•</span>
              <span className="text-slate-600 flex items-center gap-0.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                {currentAgent?.city || '—'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              {isAdmin ? t('एडमिन प्रिविलेज', 'Admin Privilege') : t('फिक्स कमीशन', 'Commission Rate')}
            </span>
            <span className="text-xs font-black text-emerald-600">
              {isAdmin ? 'FULL ACCESS' : `₹${FIXED_AGENT_COMMISSION.toFixed(2)} / ticket`}
            </span>
          </div>
          <button
            onClick={() => {
              if (confirm(t('क्या आप एजेंट पोर्टल से लॉगआउट करना चाहते हैं?', 'Do you want to log out of Agent Desk?'))) {
                agentLogout();
              }
            }}
            className="px-3.5 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 font-bold text-xs rounded-xl transition flex items-center gap-1.5 border border-slate-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('लॉगआउट', 'Logout')}</span>
          </button>
          {!isAdmin && (
            <button
              onClick={() => {
                if (confirm(t('क्या आप वाकई अपना एजेंट खाता और प्रोफ़ाइल डिलीट करना चाहते हैं? सभी KYC डेटा व आईडी हटा दी जाएगी।', 'Do you want to permanently delete your agent profile? All KYC records and ID will be wiped.'))) {
                  if (currentAgent?.id) {
                    deleteAgentAccount(currentAgent.id);
                  }
                  alert(t('खाता सफलतापूर्वक डिलीट कर दिया गया है।', 'Account deleted successfully.'));
                }
              }}
              title={t('खाता डिलीट करें', 'Delete Account')}
              className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 border border-slate-200 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Admin Mode Switcher Bar */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 rounded-3xl border-2 border-rose-500/40 shadow-xl text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
                SafarGo Central HQ • {currentAgent?.email}
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                {t('सफ़रगो सुपर एडमिन कंट्रोल डेस्क', 'Super Admin Control Center')}
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                {t(
                  'एजेंट ऑनबोर्डिंग, आईडी व सुरक्षा नियंत्रण, बैंक पेमेंट व UTR ऑडिट, एवं संपूर्ण बस बेड़ा प्रबंधन',
                  'Manage agent verifications, security suspension, payment UTR audits, and bus fleet inventory'
                )}
              </p>
            </div>

            {/* Admin View Mode Switcher */}
            <div className="flex flex-wrap bg-white/10 p-1.5 rounded-2xl border border-white/20 self-start sm:self-auto gap-1">
              <button
                onClick={() => setAdminActiveTab('approvals')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  adminActiveTab === 'approvals'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{t('सत्यापन', 'Approvals')} ({pendingCount})</span>
              </button>
              <button
                onClick={() => setAdminActiveTab('manage_agents')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  adminActiveTab === 'manage_agents'
                    ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{t('👥 एजेंट', 'Agents')} ({agentApplications.length})</span>
              </button>
              <button
                onClick={() => setAdminActiveTab('payments')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  adminActiveTab === 'payments'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>{t('💳 चेक पेमेंट्स', 'Payments')} ({pendingPaymentsCount})</span>
              </button>
              <button
                onClick={() => setAdminActiveTab('buses')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  adminActiveTab === 'buses'
                    ? 'bg-indigo-600 text-white shadow-md font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Bus className="w-3.5 h-3.5" />
                <span>{t('🚌 बस प्रबंधन', 'Bus Fleet')} ({buses.length})</span>
              </button>
              <button
                onClick={() => setAdminActiveTab('ticket_review')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  adminActiveTab === 'ticket_review'
                    ? 'bg-rose-500 text-white shadow-md font-black'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>{t('🎫 टिकट रिव्यू', 'Ticket Review')} ({pendingTicketsCount})</span>
              </button>
              <button
                onClick={() => setAdminActiveTab('promo_codes')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  adminActiveTab === 'promo_codes'
                    ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>{t('🎟️ प्रोमो कोड', 'Promo Codes')} ({promoOffers.length})</span>
              </button>
              <button
                onClick={() => setAdminActiveTab('gateways')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  adminActiveTab === 'gateways'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>{t('🔌 API गेटवे', 'API Gateways')}</span>
              </button>
              <button
                onClick={() => setAdminActiveTab('marketing')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  adminActiveTab === 'marketing'
                    ? 'bg-rose-600 text-white shadow-md font-black'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{t('🎨 प्रचार स्टूडियो', 'Marketing Studio')}</span>
              </button>
              <button
                onClick={() => setAdminActiveTab('desk')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  adminActiveTab === 'desk'
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{t('कमीशन', 'Desk')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADMIN VERIFICATION QUEUE VIEW                                             */}
      {/* ========================================================================= */}
      {isAdmin && adminActiveTab === 'approvals' && (
        <div className="space-y-6">
          {/* Admin Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {t('कुल पंजीकृत आवेदन', 'Total Applications')}
              </span>
              <div className="text-3xl font-black text-slate-900 mt-1">{agentApplications.length}</div>
              <p className="text-[10px] text-slate-400 mt-1">5-Step ऑनबोर्डिंग से प्राप्त</p>
            </div>

            <div className="bg-amber-50 p-5 rounded-2xl border-2 border-amber-300 shadow-sm">
              <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                {t('⏳ 24-घंटे सत्यापन पेंडिंग', 'Pending Verification')}
              </span>
              <div className="text-3xl font-black text-amber-950 mt-1">{pendingCount}</div>
              <p className="text-[10px] text-amber-800 font-semibold mt-1">लॉगिन अनुमत नहीं (सत्यापन आवश्यक)</p>
            </div>

            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-300 shadow-sm">
              <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
                {t('✅ अधिकृत सक्रिय पार्टनर', 'Active Partners')}
              </span>
              <div className="text-3xl font-black text-emerald-950 mt-1">{approvedCount}</div>
              <p className="text-[10px] text-emerald-700 font-semibold mt-1">लॉगिन व बुकिंग सक्रिय</p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setAppFilter('all')}
                className={`py-1.5 px-3 rounded-lg transition ${appFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
              >
                {t('सभी आवेदन', 'All')} ({agentApplications.length})
              </button>
              <button
                onClick={() => setAppFilter('pending')}
                className={`py-1.5 px-3 rounded-lg transition ${appFilter === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500'}`}
              >
                {t('⏳ केवल पेंडिंग', 'Pending Only')} ({pendingCount})
              </button>
              <button
                onClick={() => setAppFilter('approved')}
                className={`py-1.5 px-3 rounded-lg transition ${appFilter === 'approved' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500'}`}
              >
                {t('✅ केवल स्वीकृत', 'Approved Only')} ({approvedCount})
              </button>
            </div>

            <span className="text-xs text-slate-500 font-medium">
              {filteredApplications.length} {t('आवेदन प्रदर्शित', 'records displayed')}
            </span>
          </div>

          {/* Applications List */}
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                className={`bg-white rounded-3xl p-5 sm:p-6 shadow-sm border-2 transition-all ${
                  !app.isApproved ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-black text-slate-900">{app.shopName}</h4>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
                        {app.businessType}
                      </span>
                      <span className="font-mono text-xs text-slate-400 font-semibold">{app.id}</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      {app.fullName} • {app.city} • Pin: {app.pincode}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {!app.isApproved ? (
                      <span className="inline-flex items-center gap-1.5 bg-amber-100 border border-amber-300 text-amber-900 px-3 py-1 rounded-full text-xs font-black">
                        <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                        {t('⏳ 24-घंटे सत्यापन पेंडिंग', '24-hr Verification Pending')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-100 border border-emerald-300 text-emerald-900 px-3 py-1 rounded-full text-xs font-black">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {t('✅ स्वीकृत एवं सक्रिय', 'Approved & Active')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">संपर्क (Contact)</span>
                    <p className="font-semibold text-slate-900">+91 {app.mobile}</p>
                    <p className="text-slate-600 truncate">{app.email}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">पहचान (e-KYC)</span>
                    <p className="font-mono font-semibold text-slate-900">PAN: {app.panNumber || 'N/A'}</p>
                    <p className="font-mono text-slate-600">Aadhaar: **{app.aadhaarNumber?.slice(-4) || '1098'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">पेआउट (Settlement)</span>
                    <p className="font-semibold text-slate-900">{app.bankName} • **{app.accountNumber?.slice(-4)}</p>
                    <p className="text-emerald-700 font-bold font-mono">UPI: {app.settlementUpiId}</p>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400">
                    {t('आवेदन दिनांक:', 'Applied Date:')} {app.appliedDate || '18 Oct 2026'}
                  </span>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDossierAgent(app);
                        setIsDossierModalOpen(true);
                      }}
                      className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition flex items-center gap-1 border border-indigo-200"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{t('📄 डोजियर देखें', 'View Dossier')}</span>
                    </button>

                    {!app.isApproved ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(t('क्या आप इस आवेदन को अस्वीकृत करना चाहते हैं?', 'Reject this application?'))) {
                              rejectAgent(app.id);
                            }
                          }}
                          className="px-3 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 text-xs font-bold rounded-xl transition"
                        >
                          {t('अस्वीकृत', 'Reject')}
                        </button>
                        <button
                          type="button"
                          disabled={approvingId === app.id}
                          onClick={() => handleApproveAgent(app.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5"
                        >
                          {approvingId === app.id ? (
                            <span>{t('स्वीकृति भेजी जा रही है...', 'Sending Email...')}</span>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>{t('✅ 24-घंटे सत्यापन व सक्रिय करें', 'Verify & Activate')}</span>
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t('अधिकृत पार्टनर - सीधे लॉगिन कर सकता है', 'Partner Approved - Can login directly')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADMIN MANAGE AGENTS VIEW (SUSPEND, REACTIVATE, FRAUD CONTROL, PASSWORDS) */}
      {/* ========================================================================= */}
      {isAdmin && adminActiveTab === 'manage_agents' && (
        <div className="space-y-6">
          {/* Header & Search / Filter Controls */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-500" />
                  <span>{t('एजेंट प्रबंधन एवं सुरक्षा नियंत्रण', 'Agent Management & Security Desk')}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t(
                    'सभी अधिकृत एजेंटों की सूची, धोखाधड़ी रोकथाम, आईडी सस्पेंशन व पासवर्ड नियंत्रण',
                    'All authorized agent partners, fraud prevention, ID suspension and password access control'
                  )}
                </p>
              </div>

              {/* Status Filter Badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'all', label: t('सभी एजेंट', 'All'), count: agentApplications.length },
                  { id: 'active', label: t('सक्रिय (Active)', 'Active'), count: agentApplications.filter(a => a.isApproved && !a.isSuspended).length },
                  { id: 'suspended', label: t('सस्पेंड (Suspended)', 'Suspended'), count: agentApplications.filter(a => a.isSuspended).length },
                  { id: 'pending', label: t('समीक्षाधीन (Pending)', 'Pending'), count: agentApplications.filter(a => !a.isApproved).length }
                ].map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setAgentStatusFilter(filter.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      agentStatusFilter === filter.id
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    <span>{filter.label}</span>
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-mono">{filter.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <input
                type="text"
                value={agentSearchQuery}
                onChange={(e) => setAgentSearchQuery(e.target.value)}
                placeholder={t('एजेंट नाम, मोबाइल, ईमेल, दुकान का नाम या शहर से खोजें...', 'Search by agent name, mobile, email, shop, city...')}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              {agentSearchQuery && (
                <button
                  onClick={() => setAgentSearchQuery('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Agents List Cards */}
          <div className="space-y-4">
            {agentApplications
              .filter(a => {
                if (agentStatusFilter === 'active') return a.isApproved && !a.isSuspended;
                if (agentStatusFilter === 'suspended') return a.isSuspended;
                if (agentStatusFilter === 'pending') return !a.isApproved;
                return true;
              })
              .filter(a => {
                if (!agentSearchQuery.trim()) return true;
                const q = agentSearchQuery.toLowerCase();
                return (
                  a.fullName.toLowerCase().includes(q) ||
                  a.shopName.toLowerCase().includes(q) ||
                  a.mobile.includes(q) ||
                  a.email.toLowerCase().includes(q) ||
                  a.id.toLowerCase().includes(q) ||
                  (a.city && a.city.toLowerCase().includes(q))
                );
              })
              .map(agent => (
                <div
                  key={agent.id}
                  className={`bg-white rounded-3xl p-5 sm:p-6 shadow-sm border transition-all ${
                    agent.isSuspended
                      ? 'border-red-300 bg-red-50/20'
                      : agent.isApproved
                      ? 'border-slate-200 hover:border-slate-300'
                      : 'border-amber-200 bg-amber-50/20'
                  }`}
                >
                  {/* Top Bar of Agent Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-md ${
                        agent.isSuspended
                          ? 'bg-red-600'
                          : agent.isApproved
                          ? 'bg-emerald-600'
                          : 'bg-amber-500'
                      }`}>
                        {agent.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-900 text-sm sm:text-base">{agent.shopName}</h4>
                          <span className="font-mono text-xs text-slate-400 font-bold">({agent.id})</span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-semibold text-slate-800">{agent.fullName}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {agent.city || 'Indore'}</span>
                          <span>•</span>
                          <span className="uppercase text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            {agent.businessType || 'CSC Center'}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {agent.isSuspended ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-800 border border-red-300">
                          <Ban className="w-3.5 h-3.5 text-red-600" />
                          <span>{t('आईडी सस्पेंड (ID Suspended)', 'ID Suspended')}</span>
                        </span>
                      ) : agent.isApproved ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t('सक्रिय अधिकृत एजेंट (Active)', 'Active Partner')}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>{t('24-घंटे सत्यापन लंबित (Pending)', 'Verification Pending')}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Suspension Reason Warning (if suspended) */}
                  {agent.isSuspended && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-900">
                      <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-black text-red-800 block">सस्पेंशन का कारण (Suspension Reason):</span>
                        <p className="mt-0.5 font-medium">{agent.suspendReason || 'धोखाधड़ी / कंपनी नियमों का उल्लंघन'}</p>
                      </div>
                    </div>
                  )}

                  {/* Quick Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 text-xs border-b border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">मोबाइल / संपर्क</span>
                      <span className="font-mono font-bold text-slate-900 mt-0.5 block">+91 {agent.mobile}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Gmail / ईमेल</span>
                      <span className="font-medium text-slate-700 truncate block mt-0.5">{agent.email}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">e-KYC दस्तावेज</span>
                      <span className="font-mono text-xs font-bold text-slate-900 mt-0.5 block">
                        PAN: {agent.panNumber || 'N/A'} • Aadhaar: **{agent.aadhaarNumber?.slice(-4) || '1098'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">प्रोफ़ाइल फ़ोटो स्थिति</span>
                      <span className="text-xs font-bold mt-0.5 block">
                        {agent.isPhotoLocked ? (
                          <span className="text-slate-600 flex items-center gap-1">🔒 सुरक्षित लॉक</span>
                        ) : (
                          <span className="text-amber-600 flex items-center gap-1">🔓 अनलॉक (अपलोड योग्य)</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Admin Management Actions */}
                  <div className="pt-3 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={`https://api.whatsapp.com/send?phone=91${agent.mobile}&text=${encodeURIComponent(`नमस्ते ${agent.fullName}, SafarGo एडमिन टीम से संपर्क...`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition flex items-center gap-1 border border-emerald-200 cursor-pointer"
                        title="एजेंट से WhatsApp पर चैट करें"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          setBalanceModalAgent(agent);
                          setBalanceAdjustAmount(500);
                          setBalanceAdjustType('credit');
                          setBalanceAdjustNote('एडमिन द्वारा वॉलेट टॉप-अप');
                        }}
                        className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl transition flex items-center gap-1 border border-amber-200 cursor-pointer"
                        title="एजेंट का वॉलेट बैलेंस जोड़ें या घटाएं"
                      >
                        <Wallet className="w-3.5 h-3.5 text-amber-600" />
                        <span>{t('💰 बैलेंस एडजस्ट', 'Adjust Balance')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDossierAgent(agent);
                          setIsDossierModalOpen(true);
                        }}
                        className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition flex items-center gap-1 border border-indigo-200"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t('📄 डोजियर देखें', 'View Dossier')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPasswordModalAgent(agent);
                          setNewPasswordInput('');
                        }}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1 border border-slate-200"
                      >
                        <Key className="w-3.5 h-3.5 text-amber-500" />
                        <span>{t('🔑 पासवर्ड सेट करें', 'Set Password')}</span>
                      </button>

                      {agent.isPhotoLocked && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(t('क्या आप इस एजेंट की फ़ोटो अनलॉक करना चाहते हैं ताकि वह नई फ़ोटो लगा सके?', 'Unlock photo lock?'))) {
                              updateAgent(agent.id, { isPhotoLocked: false });
                              setAdminToast(t('✅ एजेंट फ़ोटो अनलॉक कर दी गई है! एजेंट अब नई फ़ोटो लगा सकता है।', '✅ Photo unlocked.'));
                              setTimeout(() => setAdminToast(''), 4000);
                            }
                          }}
                          className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl transition flex items-center gap-1 border border-amber-200"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          <span>{t('🔓 फ़ोटो अनलॉक', 'Unlock Photo')}</span>
                        </button>
                      )}
                    </div>

                    {/* Suspend / Reactivate / Approve Controls */}
                    <div className="flex items-center gap-2">
                      {!agent.isApproved ? (
                        <button
                          type="button"
                          disabled={approvingId === agent.id}
                          onClick={() => handleApproveAgent(agent.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t('✅ स्वीकृत करें', 'Approve Now')}</span>
                        </button>
                      ) : agent.isSuspended ? (
                        <button
                          type="button"
                          onClick={() => {
                            reactivateAgent(agent.id);
                            confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
                            setAdminToast(t('✅ एजेंट आईडी पुनः सक्रिय कर दी गई है! एजेंट अब लॉगिन कर सकता है।', '✅ Agent ID reactivated!'));
                            setTimeout(() => setAdminToast(''), 5000);
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t('✅ पुनः सक्रिय करें (Reactivate)', 'Reactivate Agent')}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSuspendModalAgent(agent);
                            setSuspendReasonInput('धोखाधड़ी / कंपनी सुरक्षा नियमों का उल्लंघन');
                          }}
                          className="px-3.5 py-2 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-red-200"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>{t('🚫 सस्पेंड करें (Suspend Agent)', 'Suspend Agent')}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADMIN CHECK PAYMENTS & FRAUD AUDIT DESK                                   */}
      {/* ========================================================================= */}
      {isAdmin && adminActiveTab === 'payments' && (
        <div className="space-y-6">
          {/* Header Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {t('कुल टॉप-अप आवेदन', 'Total Top-Ups')}
              </span>
              <div className="text-3xl font-black text-slate-900 mt-1">{walletTopUpRequests.length}</div>
              <p className="text-[10px] text-slate-400 mt-1">SafarGo डायनामिक QR कोड से प्राप्त</p>
            </div>

            <div className="bg-amber-50 p-5 rounded-2xl border-2 border-amber-300 shadow-sm">
              <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                {t('⏳ ऑडिट समीक्षाधीन (Pending)', 'Pending Bank Audit')}
              </span>
              <div className="text-3xl font-black text-amber-950 mt-1">
                {walletTopUpRequests.filter(r => r.status === 'pending_audit').length}
              </div>
              <p className="text-[10px] text-amber-800 font-semibold mt-1">बैंक में UTR मिलान आवश्यक</p>
            </div>

            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-300 shadow-sm">
              <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
                {t('✅ सत्यापित भुगतान', 'Verified Amount')}
              </span>
              <div className="text-3xl font-black text-emerald-950 mt-1">
                ₹{walletTopUpRequests.filter(r => r.status === 'verified').reduce((s, r) => s + r.amount, 0)}
              </div>
              <p className="text-[10px] text-emerald-700 font-semibold mt-1">बैंक खाते में जमा राशि</p>
            </div>

            <div className="bg-red-50 p-5 rounded-2xl border border-red-300 shadow-sm">
              <span className="text-[11px] font-bold text-red-900 uppercase tracking-wider block">
                {t('🚨 फ्रॉड सस्पेंडेड', 'Fraud Suspended')}
              </span>
              <div className="text-3xl font-black text-red-950 mt-1">
                {walletTopUpRequests.filter(r => r.status === 'fraud_suspended').length}
              </div>
              <p className="text-[10px] text-red-700 font-semibold mt-1">फर्जी UTR / बैलेंस वापस काटा गया</p>
            </div>
          </div>

          {/* Official SafarGo QR Code & Merchant UPI Configuration Card */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl border border-indigo-800/40">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="p-3 bg-white rounded-2xl shadow-lg border-2 border-amber-400 shrink-0">
                  {adminQrConfig.qrCodeImageUrl ? (
                    <img 
                      src={adminQrConfig.qrCodeImageUrl} 
                      alt="SafarGo QR" 
                      className="w-20 h-20 object-contain rounded-lg"
                    />
                  ) : (
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=${adminQrConfig.merchantUpiId}&pn=SafarGo&cu=INR`)}`} 
                      alt="SafarGo QR" 
                      className="w-20 h-20 object-contain rounded-lg"
                    />
                  )}
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1.5">
                    <QrCode className="w-3.5 h-3.5" />
                    Official SafarGo Payment QR Code
                  </div>
                  <h3 className="text-xl font-black">{adminQrConfig.merchantName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-300">UPI ID:</span>
                    <span className="font-mono text-xs font-bold text-amber-300 bg-black/40 px-2 py-0.5 rounded border border-amber-400/30">
                      {adminQrConfig.merchantUpiId}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    एजेंट और ग्राहक जब भी वॉलेट में पैसे जोड़ेंगे, यही QR कोड और UPI ID दिखाई देगा।
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setNewMerchantUpi(adminQrConfig.merchantUpiId);
                  setNewMerchantName(adminQrConfig.merchantName);
                  setNewQrImage(adminQrConfig.qrCodeImageUrl || '');
                  setIsQrModalOpen(true);
                }}
                className="px-5 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-400/20 transition flex items-center justify-center gap-2 self-start md:self-auto active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>{t('📷 क्यूआर कोड व UPI आईडी बदलें', 'Change QR Code & UPI')}</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Top-Ups */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <span>{t('वॉलेट पेमेंट सत्यापन व फ्रॉड सुरक्षा डेस्क', 'Wallet Top-Up Payment & Anti-Fraud Audit')}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t(
                    'एजेंटों द्वारा जमा 12-अंकीय बैंक UTR चेक करें। फर्जी पाए जाने पर 1-क्लिक में फ्रॉड सस्पेंड करें।',
                    'Audit 12-digit bank UTR numbers. One-click fraud suspension immediately blocks scam agents and revokes credited balance.'
                  )}
                </p>
              </div>

              {/* Status Filter Badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'all', label: t('सभी', 'All'), count: walletTopUpRequests.length },
                  { id: 'pending_audit', label: t('⏳ समीक्षाधीन (Pending)', 'Pending'), count: walletTopUpRequests.filter(r => r.status === 'pending_audit').length },
                  { id: 'verified', label: t('✅ सत्यापित (Verified)', 'Verified'), count: walletTopUpRequests.filter(r => r.status === 'verified').length },
                  { id: 'fraud_suspended', label: t('🚨 फ्रॉड सस्पेंडेड (Suspended)', 'Suspended'), count: walletTopUpRequests.filter(r => r.status === 'fraud_suspended').length }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setPaymentStatusFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      paymentStatusFilter === f.id
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-mono">{f.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <input
                type="text"
                value={paymentSearchQuery}
                onChange={(e) => setPaymentSearchQuery(e.target.value)}
                placeholder={t('एजेंट का नाम, मोबाइल नंबर या 12-अंकीय UTR नंबर से खोजें...', 'Search by agent name, mobile or 12-digit UTR...')}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              {paymentSearchQuery && (
                <button
                  onClick={() => setPaymentSearchQuery('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Transactions List */}
          <div className="space-y-4">
            {walletTopUpRequests
              .filter(r => {
                if (paymentStatusFilter === 'pending_audit') return r.status === 'pending_audit';
                if (paymentStatusFilter === 'verified') return r.status === 'verified';
                if (paymentStatusFilter === 'fraud_suspended') return r.status === 'fraud_suspended';
                return true;
              })
              .filter(r => {
                if (!paymentSearchQuery.trim()) return true;
                const q = paymentSearchQuery.toLowerCase();
                return (
                  r.agentName.toLowerCase().includes(q) ||
                  r.shopName.toLowerCase().includes(q) ||
                  r.mobile.includes(q) ||
                  r.utr.toLowerCase().includes(q) ||
                  r.agentId.toLowerCase().includes(q)
                );
              })
              .map(req => (
                <div
                  key={req.id}
                  className={`bg-white rounded-3xl p-5 sm:p-6 shadow-sm border transition-all ${
                    req.status === 'fraud_suspended'
                      ? 'border-red-300 bg-red-50/20'
                      : req.status === 'verified'
                      ? 'border-emerald-200 bg-emerald-50/10'
                      : 'border-amber-200 bg-amber-50/20'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-md ${
                        req.status === 'fraud_suspended'
                          ? 'bg-red-600'
                          : req.status === 'verified'
                          ? 'bg-emerald-600'
                          : 'bg-amber-500'
                      }`}>
                        ₹
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-900 text-sm sm:text-base">{req.shopName}</h4>
                          <span className="font-mono text-xs text-slate-400 font-bold">({req.agentId})</span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-semibold text-slate-800">{req.agentName}</span>
                          <span>•</span>
                          <span className="font-mono">{req.mobile}</span>
                          <span>•</span>
                          <span className="text-[11px] text-slate-400">{req.date}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">जमा राशि</span>
                        <span className="text-lg font-black text-emerald-600">₹{req.amount.toFixed(2)}</span>
                      </div>
                      <div>
                        {req.status === 'fraud_suspended' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-800 border border-red-300">
                            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                            <span>{t('🚨 फ्रॉड सस्पेंड', 'Fraud Suspended')}</span>
                          </span>
                        ) : req.status === 'verified' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{t('✅ बैंक सत्यापित', 'Verified')}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>{t('⏳ समीक्षाधीन', 'Pending Audit')}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* UTR Verification Strip */}
                  <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        बैंक UTR / रेफ़रेंस नंबर (Anti-Fraud Checked)
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono font-black text-slate-900 text-sm tracking-wider bg-white px-2 py-0.5 rounded border border-slate-300">
                          {req.utr}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(req.utr);
                            alert(`UTR ${req.utr} कॉपी कर लिया गया!`);
                          }}
                          className="text-slate-400 hover:text-slate-700"
                          title="Copy UTR"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {req.status === 'fraud_suspended' ? (
                      <div className="text-red-700 font-semibold flex items-center gap-1.5 bg-red-100/70 px-3 py-1.5 rounded-xl border border-red-200">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>सस्पेंशन कारण: {req.rejectionReason || 'फर्जी UTR द्वारा वॉलेट फ्रॉड'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        {req.status !== 'verified' && (
                          <button
                            type="button"
                            onClick={() => {
                              verifyTopUpRequest(req.id);
                              confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
                              setAdminToast(`✅ UTR ${req.utr} (₹${req.amount}) सफलतापूर्वक बैंक में सत्यापित हो गया!`);
                              setTimeout(() => setAdminToast(''), 5000);
                            }}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t('✅ भुगतान सत्यापित करें', 'Verify Payment')}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setFraudModalTopUp(req);
                            setFraudReasonInput('फर्जी / अमान्य UTR दर्ज करके वॉलेट फ्रॉड का प्रयास');
                          }}
                          className="px-3.5 py-2 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 font-bold text-xs rounded-xl transition flex items-center gap-1.5 border border-red-200 active:scale-95"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>{t('🚨 फ्रॉड सस्पेंड (Suspend Fake UTR)', 'Suspend for Fake UTR')}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADMIN BUS MANAGEMENT FLEET DESK (ABHIBUS-STYLE COMPREHENSIVE CONSOLE)     */}
      {/* ========================================================================= */}
      {isAdmin && adminActiveTab === 'buses' && (
        <AdminBusManagement />
      )}

      {/* ========================================================================= */}
      {/* ADMIN TICKET REVIEW & VERIFICATION DESK                                  */}
      {/* ========================================================================= */}
      {isAdmin && adminActiveTab === 'ticket_review' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
                <Ticket className="w-3.5 h-3.5 text-rose-600" />
                SafarGo Ticket Verification & Renewal Center
              </div>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span>{t('🎫 एजेंट टिकट रिव्यू व ई-टिकट सत्यापन डेस्क', 'Agent Ticket Review & Verification Desk')}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                {t(
                  'एजेंट द्वारा बुक किए गए टिकटों, बैंक पेमेंट UTR और यात्री विवरण की जांच करें। सत्यापन करने पर एजेंट के खाते में ई-टिकट डाउनलोड अनलॉक होगा और ₹19.34 कमीशन स्वतः जुड़ेगा।',
                  'Review agent bookings, bank payment UTRs, and passenger manifests. Approving unlocks e-ticket download for the agent and auto-credits ₹19.34 commission.'
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 font-bold text-xs flex items-center gap-1.5 shadow-xs">
                <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>{pendingTicketsCount} {t('समीक्षाधीन टिकट', 'Pending Tickets')}</span>
              </span>
            </div>
          </div>

          {/* Quick Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {t('⏳ समीक्षाधीन (Pending)', 'Pending Review')}
              </span>
              <div className="text-2xl font-black text-amber-600 mt-1">{pendingTicketsCount}</div>
              <p className="text-[11px] text-amber-700 mt-0.5 font-medium">सत्यापन व e-Ticket लॉक</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {t('✅ सत्यापित (Verified)', 'Verified & Issued')}
              </span>
              <div className="text-2xl font-black text-emerald-600 mt-1">{verifiedTicketsCount}</div>
              <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">ई-टिकट डाउनलोड सक्रिय</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {t('💰 कुल बुकिंग मूल्य', 'Total Turnover')}
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                ₹{bookings.reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">SafarGo B2B नेटवर्क</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {t('🛡️ कमीशन दर', 'Commission Rate')}
              </span>
              <div className="text-2xl font-black text-indigo-600 mt-1">₹19.34</div>
              <p className="text-[11px] text-indigo-700 mt-0.5 font-medium">प्रति कन्फर्म टिकट फिक्स</p>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={ticketSearchQuery}
                  onChange={(e) => setTicketSearchQuery(e.target.value)}
                  placeholder={t('PNR, यात्री का नाम, मोबाइल, ऑपरेटर या 12-अंकीय UTR से खोजें...', 'Search by PNR, passenger, mobile, operator, or 12-digit UTR...')}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                {ticketSearchQuery && (
                  <button
                    onClick={() => setTicketSearchQuery('')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Status Filters */}
              <div className="flex flex-wrap gap-1.5 text-xs font-bold">
                <button
                  onClick={() => setTicketReviewFilter('all')}
                  className={`px-3 py-2 rounded-xl transition ${
                    ticketReviewFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t('सभी टिकट', 'All Tickets')} ({bookings.length})
                </button>
                <button
                  onClick={() => setTicketReviewFilter('pending')}
                  className={`px-3 py-2 rounded-xl transition flex items-center gap-1 ${
                    ticketReviewFilter === 'pending'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span>{t('समीक्षाधीन', 'Pending')} ({pendingTicketsCount})</span>
                </button>
                <button
                  onClick={() => setTicketReviewFilter('confirmed')}
                  className={`px-3 py-2 rounded-xl transition flex items-center gap-1 ${
                    ticketReviewFilter === 'confirmed'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t('सत्यापित', 'Verified')} ({verifiedTicketsCount})</span>
                </button>
                <button
                  onClick={() => setTicketReviewFilter('cancelled')}
                  className={`px-3 py-2 rounded-xl transition flex items-center gap-1 ${
                    ticketReviewFilter === 'cancelled'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{t('रद्द/अस्वीकृत', 'Rejected')} ({bookings.filter(b => b.status === 'cancelled').length})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Ticket Review List */}
          <div className="space-y-4">
            {bookings
              .filter(ticket => {
                if (ticketReviewFilter === 'pending') return ticket.status === 'pending';
                if (ticketReviewFilter === 'confirmed') return ticket.status === 'confirmed' || ticket.status === 'boarding_soon' || ticket.status === 'completed';
                if (ticketReviewFilter === 'cancelled') return ticket.status === 'cancelled';
                return true;
              })
              .filter(ticket => {
                if (!ticketSearchQuery.trim()) return true;
                const q = ticketSearchQuery.toLowerCase();
                return (
                  ticket.pnr.toLowerCase().includes(q) ||
                  ticket.passengerDetails.fullName.toLowerCase().includes(q) ||
                  ticket.passengerDetails.mobile.includes(q) ||
                  (ticket.utr && ticket.utr.toLowerCase().includes(q)) ||
                  (ticket.busDetails?.bus.operatorName.toLowerCase().includes(q)) ||
                  (ticket.agentId && ticket.agentId.toLowerCase().includes(q))
                );
              })
              .map(ticket => {
                const isPending = ticket.status === 'pending';
                const isConfirmed = ticket.status === 'confirmed' || ticket.status === 'boarding_soon' || ticket.status === 'completed';
                const isCancelled = ticket.status === 'cancelled';

                return (
                  <div
                    key={ticket.id}
                    className={`bg-white rounded-3xl p-5 sm:p-6 shadow-sm border transition-all space-y-4 ${
                      isPending 
                        ? 'border-amber-300 ring-2 ring-amber-400/20 shadow-amber-500/5' 
                        : isConfirmed 
                        ? 'border-emerald-200 hover:border-emerald-300' 
                        : 'border-slate-200 opacity-80'
                    }`}
                  >
                    {/* Top Identity & Status Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base shadow-sm ${
                          isPending ? 'bg-amber-100 text-amber-800' : isConfirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          <Ticket className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-slate-900 text-sm sm:text-base tracking-wider bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                              PNR: {ticket.pnr}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(ticket.pnr);
                                alert(`PNR ${ticket.pnr} कॉपी हो गया!`);
                              }}
                              className="text-slate-400 hover:text-slate-700"
                              title="Copy PNR"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            {ticket.isAgentBooking && (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                                B2B Agent
                              </span>
                            )}
                            {ticket.whatsAppStatus === 'sent' && (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center gap-1">
                                <MessageSquare className="w-3 h-3 text-emerald-600" />
                                <span>WhatsApp Sent {ticket.whatsAppSentAt ? `(${ticket.whatsAppSentAt})` : ''}</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                            <span>बुक तिथि: {ticket.bookingDate}</span>
                            <span>•</span>
                            <span>यात्रा तिथि: <strong className="text-slate-800">{ticket.travelDate}</strong></span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                            <span>{t('⏳ समीक्षाधीन (Pending Review)', 'Pending Audit')}</span>
                          </span>
                        ) : isConfirmed ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{t('✅ सत्यापित (Verified & e-Ticket Unlocked)', 'Verified')}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-900 border border-red-300">
                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                            <span>{t('❌ अस्वीकृत (Scam / Cancelled)', 'Rejected')}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle: Bus Route & Passenger Manifest */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      {/* Bus Route */}
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          बस ऑपरेटर एवं रूट
                        </span>
                        <p className="font-bold text-slate-900 text-sm">{ticket.busDetails?.bus.operatorName || 'SafarGo Express'}</p>
                        <p className="text-slate-600">
                          {ticket.busDetails?.bus.sourceCity || 'Delhi'} ➔ {ticket.busDetails?.bus.destinationCity || 'Jaipur'}
                        </p>
                        <p className="text-slate-400 text-[11px]">{ticket.busDetails?.bus.busType}</p>
                        <div className="pt-1 flex items-center justify-between text-[11px] text-emerald-700 font-semibold">
                          <span>प्रस्थान: {ticket.busDetails?.bus.departureTime}</span>
                          <span>आगमन: {ticket.busDetails?.bus.arrivalTime}</span>
                        </div>
                      </div>

                      {/* Passengers & Seats */}
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          यात्री विवरण व आवंटित सीटें
                        </span>
                        <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{ticket.passengerDetails.fullName}</span>
                        </p>
                        <p className="text-slate-600 font-mono flex items-center gap-1.5">
                          <PhoneCall className="w-3 h-3 text-slate-400" />
                          <span>+91 {ticket.passengerDetails.mobile}</span>
                        </p>
                        <p className="text-slate-500 text-[11px] truncate flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{ticket.passengerDetails.email}</span>
                        </p>
                        <div className="pt-1">
                          <span className="font-bold text-slate-700">सीटें: </span>
                          <span className="font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                            {ticket.busDetails?.selectedSeats.join(', ') || '1A'}
                          </span>
                        </div>
                      </div>

                      {/* Payment & UTR Strip */}
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          भुगतान एवं UTR नंबर
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">कुल किराया:</span>
                          <span className="text-base font-black text-slate-900">₹{ticket.totalAmount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">एजेंट कमीशन:</span>
                          <span className="font-black text-amber-600">+₹{(ticket.agentCommissionAmount || 19.34).toFixed(2)}</span>
                        </div>

                        {/* UTR Pill */}
                        <div className="mt-1 pt-1.5 border-t border-slate-200">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">बैंक UTR नंबर:</span>
                          <div className="flex items-center justify-between gap-1 mt-0.5">
                            <span className="font-mono font-black text-xs text-indigo-900 bg-indigo-50 px-2 py-1 rounded border border-indigo-200 tracking-wider">
                              {ticket.utr || 'UTR-NOT-PROVIDED'}
                            </span>
                            {ticket.utr && (
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(ticket.utr!);
                                  alert(`UTR ${ticket.utr} कॉपी हो गया!`);
                                }}
                                className="text-slate-400 hover:text-slate-700"
                                title="Copy UTR"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {ticket.agentId && (
                          <div className="text-[10px] text-slate-500 font-medium pt-1">
                            एजेंट ID: <strong className="font-mono text-slate-700">{ticket.agentId}</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Controls */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Dossier Preview Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTicketForDossier(ticket);
                            setIsTicketDossierModalOpen(true);
                          }}
                          className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 active:scale-95"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{t('📄 टिकट प्रीव्यू (Dossier / PDF)', 'Preview Ticket Dossier')}</span>
                        </button>

                        {/* Direct Print Button for verified tickets */}
                        {isConfirmed && (
                          <button
                            type="button"
                            onClick={() => window.print()}
                            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition flex items-center gap-1.5"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>{t('ई-टिकट प्रिंट करें', 'Print e-Ticket')}</span>
                          </button>
                        )}

                        {/* Direct WhatsApp Ticket Dispatch Button */}
                        <button
                          type="button"
                          disabled={sendingWhatsAppTicketId === ticket.id}
                          onClick={async () => {
                            setSendingWhatsAppTicketId(ticket.id);
                            try {
                              const res = await sendBookingWhatsApp(ticket);
                              if (res.success) {
                                setAdminToast(`✅ WhatsApp टिकट सफलतापूर्वक भेजा गया (+91 ${ticket.passengerDetails.mobile})`);
                              } else if (res.directWebUrl) {
                                window.open(res.directWebUrl, '_blank');
                                setAdminToast(`📲 WhatsApp वेब विंडो खोली गई (+91 ${ticket.passengerDetails.mobile})`);
                              }
                            } catch {
                              setAdminToast('WhatsApp भेजने में त्रुटि');
                            } finally {
                              setSendingWhatsAppTicketId(null);
                              setTimeout(() => setAdminToast(''), 4000);
                            }
                          }}
                          className="px-3.5 py-2.5 bg-[#25D366]/10 hover:bg-[#25D366] text-[#128C7E] hover:text-white border border-[#25D366]/40 font-bold rounded-xl transition flex items-center gap-1.5 active:scale-95 shadow-xs"
                          title="यात्री को सीधे WhatsApp पर टिकट भेजें"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{sendingWhatsAppTicketId === ticket.id ? 'भेज रहा है...' : 'WhatsApp टिकट'}</span>
                        </button>
                      </div>

                      {/* Verify or Reject Actions */}
                      <div className="flex items-center gap-2">
                        {isPending && (
                          <>
                            <button
                              type="button"
                              disabled={verifyingTicketId === ticket.id}
                              onClick={() => handleVerifyTicket(ticket.id)}
                              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-md shadow-emerald-600/30 transition flex items-center gap-1.5 active:scale-95"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>
                                {verifyingTicketId === ticket.id 
                                  ? t('सत्यापित हो रहा है...', 'Verifying...') 
                                  : t('✅ रिव्यू व सत्यापित करें (Verify Ticket)', 'Verify & Issue Ticket')}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setRejectModalTicket(ticket);
                                setRejectReasonInput('अमान्य अथवा फर्जी बैंक UTR नंबर दर्ज किया गया है।');
                                setSuspendAgentOnReject(false);
                              }}
                              className="px-3.5 py-2.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 font-bold rounded-xl transition flex items-center gap-1.5 border border-red-200"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>{t('🚨 फर्जी UTR - अस्वीकृत', 'Reject Fraud UTR')}</span>
                            </button>
                          </>
                        )}

                        {isCancelled && ticket.rejectionReason && (
                          <span className="text-red-700 text-xs font-semibold bg-red-50 px-3 py-1.5 rounded-xl border border-red-200">
                            कारण: {ticket.rejectionReason}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADMIN PROMO CODES & OFFERS MANAGEMENT DESK                                */}
      {/* ========================================================================= */}
      {isAdmin && adminActiveTab === 'promo_codes' && (
        <div className="space-y-6">
          {/* Header Stats & Action */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {t('कुल प्रोमो कोड', 'Total Promo Codes')}
              </span>
              <div className="text-3xl font-black text-slate-900 mt-1">{promoOffers.length}</div>
              <p className="text-[10px] text-slate-400 mt-1">सिस्टम में दर्ज कूपन</p>
            </div>

            <div className="bg-emerald-50 p-5 rounded-2xl border-2 border-emerald-300 shadow-sm">
              <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
                {t('✅ सक्रिय कोड (Active)', 'Active Offers')}
              </span>
              <div className="text-3xl font-black text-emerald-950 mt-1">
                {promoOffers.filter(p => p.status === 'active').length}
              </div>
              <p className="text-[10px] text-emerald-700 font-semibold mt-1">बुकिंग पर तुरंत छूट हेतु मान्य</p>
            </div>

            <div className="bg-slate-100 p-5 rounded-2xl border border-slate-300 shadow-sm">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                {t('❌ एक्सपायर कोड (Expired)', 'Expired Codes')}
              </span>
              <div className="text-3xl font-black text-slate-700 mt-1">
                {promoOffers.filter(p => p.status === 'expired').length}
              </div>
              <p className="text-[10px] text-slate-500 font-semibold mt-1">अमान्य कूपन</p>
            </div>

            <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-5 rounded-2xl shadow-md text-slate-950 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider block">
                  नया ऑफर बनाएं
                </span>
                <p className="text-xs font-semibold text-amber-950 mt-0.5">
                  त्यौहार या फर्स्ट-टाइम बुकिंग हेतु कोड जारी करें
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPromoCodeInput('');
                  setPromoTitleInput('');
                  setPromoDescInput('');
                  setPromoDiscountType('fixed');
                  setPromoDiscountVal(150);
                  setPromoMinBooking(300);
                  setPromoServiceType('bus');
                  setPromoValidTill('31 Dec 2026');
                  setIsPromoModalOpen(true);
                }}
                className="mt-3 w-full py-2 bg-slate-950 hover:bg-black text-white text-xs font-black rounded-xl transition shadow-md flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>+ नया कोड बनाएं</span>
              </button>
            </div>
          </div>

          {/* Search & Status Filters */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  {t('प्रोमो कोड सूची व स्थिति नियंत्रण', 'Promo Codes Directory')}
                </h3>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex flex-wrap gap-1.5 text-xs font-bold">
                <button
                  onClick={() => setPromoStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    promoStatusFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  सभी ({promoOffers.length})
                </button>
                <button
                  onClick={() => setPromoStatusFilter('active')}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    promoStatusFilter === 'active'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  सक्रिय ({promoOffers.filter(p => p.status === 'active').length})
                </button>
                <button
                  onClick={() => setPromoStatusFilter('expired')}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    promoStatusFilter === 'expired'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  एक्सपायर ({promoOffers.filter(p => p.status === 'expired').length})
                </button>
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <input
                type="text"
                value={promoSearchQuery}
                onChange={(e) => setPromoSearchQuery(e.target.value)}
                placeholder={t('प्रोमो कोड, शीर्षक अथवा सेवा प्रकार से खोजें...', 'Search by code, title or service...')}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              {promoSearchQuery && (
                <button
                  onClick={() => setPromoSearchQuery('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Promo Codes List Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promoOffers
              .filter(p => {
                if (promoStatusFilter === 'active') return p.status === 'active';
                if (promoStatusFilter === 'expired') return p.status === 'expired';
                return true;
              })
              .filter(p => {
                if (!promoSearchQuery.trim()) return true;
                const q = promoSearchQuery.toLowerCase();
                return (
                  p.code.toLowerCase().includes(q) ||
                  p.title.toLowerCase().includes(q) ||
                  p.description.toLowerCase().includes(q) ||
                  p.serviceType.toLowerCase().includes(q)
                );
              })
              .map(promo => {
                const isActive = promo.status === 'active';
                return (
                  <div
                    key={promo.id}
                    className={`bg-white rounded-3xl p-5 shadow-sm border transition flex flex-col justify-between ${
                      isActive
                        ? 'border-emerald-200 hover:border-emerald-300'
                        : 'border-slate-300 bg-slate-50/60 opacity-80'
                    }`}
                  >
                    <div>
                      {/* Top Header of Card */}
                      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base font-black px-2.5 py-1 rounded-xl bg-slate-900 text-amber-300 tracking-wider">
                            {promo.code}
                          </span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            promo.serviceType === 'bus' 
                              ? 'bg-blue-100 text-blue-800' 
                              : promo.serviceType === 'hotel' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {promo.serviceType.toUpperCase()}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <span className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-200 text-slate-700 border border-slate-300'
                        }`}>
                          {isActive ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-slate-500" />}
                          <span>{isActive ? 'ACTIVE' : 'EXPIRED'}</span>
                        </span>
                      </div>

                      {/* Content details */}
                      <div className="py-3 space-y-1.5">
                        <h4 className="font-black text-slate-900 text-sm">{promo.title}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">{promo.description}</p>
                        
                        <div className="pt-2 grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 block font-bold">छूट (Discount)</span>
                            <span className="font-black text-emerald-700">
                              {promo.discountType === 'fixed' ? `₹${promo.discountValue}` : `${promo.discountValue}%`}
                            </span>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 block font-bold">न्यूनतम बुकिंग</span>
                            <span className="font-black text-slate-800">₹{promo.minBookingAmount}</span>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 block font-bold">कुल उपयोग</span>
                            <span className="font-black text-indigo-700">{promo.usageCount} बार</span>
                          </div>
                        </div>

                        <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
                          <span>वैधता: <strong className="text-slate-600">{promo.validTill}</strong></span>
                          <span>निर्मित: {promo.createdAt}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: Mark Expired / Active + Delete */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const nextStatus = isActive ? 'expired' : 'active';
                          togglePromoOfferStatus(promo.id, nextStatus);
                          setAdminToast(isActive ? `प्रोमो कोड ${promo.code} को एक्सपायर मार्क किया गया!` : `प्रोमो कोड ${promo.code} सक्रिय किया गया!`);
                          setTimeout(() => setAdminToast(''), 3000);
                        }}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          isActive
                            ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {isActive ? (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            <span>एक्सपायर करें (Mark Expired)</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>पुनः सक्रिय करें (Activate)</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`क्या आप वाकई प्रोमो कोड "${promo.code}" को डिलीट करना चाहते हैं?`)) {
                            deletePromoOffer(promo.id);
                            setAdminToast(`प्रोमो कोड ${promo.code} डिलीट कर दिया गया।`);
                            setTimeout(() => setAdminToast(''), 3000);
                          }
                        }}
                        title="Delete promo code"
                        className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 border border-slate-200 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>

          {promoOffers.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-2">
              <Tag className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-bold text-sm">कोई प्रोमो कोड नहीं मिला</p>
              <p className="text-xs">नया कूपन बनाने के लिए ऊपर '+ नया कोड बनाएं' पर क्लिक करें।</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADMIN API GATEWAYS (YOUPI PG & OPENWA WHATSAPP) MANAGEMENT VIEW           */}
      {/* ========================================================================= */}
      {isAdmin && adminActiveTab === 'gateways' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-6 rounded-3xl shadow-lg border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-md">
                <Zap className="w-6 h-6 fill-slate-950" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <span>{t('🔌 सफ़रगो API गेटवे एकीकरण (YouPI PG & OpenWA)', 'SafarGo API Gateways (YouPI & OpenWA)')}</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  {t(
                    '0% गेटवे फीस UPI पेमेंट (YouPI-PG) एवं स्वचालित WhatsApp ई-टिकट डिस्पैच इंजन (OpenWA) का लाइव नियंत्रण कक्ष।',
                    'Real-time control center for 0% fee UPI payment gateway (YouPI-PG) and automated WhatsApp e-ticket dispatch (OpenWA).'
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Dual Engine Active</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* GATEWAY 1: YouPI PG V2 */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-black">
                    <Zap className="w-5 h-5 text-amber-600 fill-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-black text-base text-slate-900">YouPI-PG V2 UPI Gateway</h4>
                    <p className="text-xs text-slate-500">0% Payment Gateway • Instant 1-Tap App Switcher</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Ready / Standby
                </span>
              </div>

              {/* Ping Connection Box */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">गेटवे कनेक्शन स्टेटस</span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">
                    {youpiTestResult ? youpiTestResult.message : 'YouPI कोर सर्वर (Port 6100 / 7000) पर टेस्ट करें'}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={youpiTesting}
                  onClick={async () => {
                    setYoupiTesting(true);
                    setYoupiTestResult(null);
                    const res = await testYoupiConnection(youpiApiUrlInput);
                    setYoupiTestResult(res);
                    setYoupiTesting(false);
                  }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${youpiTesting ? 'animate-spin' : ''}`} />
                  <span>{youpiTesting ? 'जांच रहा है...' : 'टेस्ट पिंग (Ping)'}</span>
                </button>
              </div>

              {/* YouPI Form Fields */}
              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    YouPI API Base URL (Payment Core API)
                  </label>
                  <input
                    type="text"
                    value={youpiApiUrlInput}
                    onChange={(e) => setYoupiApiUrlInput(e.target.value)}
                    placeholder="http://localhost:6100"
                    className="w-full font-mono text-xs font-bold px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">YouPI Payment Core पोर्ट 6100 या Checkout पोर्टल 7000 का पता</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Merchant ID
                    </label>
                    <input
                      type="text"
                      value={youpiMerchantIdInput}
                      onChange={(e) => setYoupiMerchantIdInput(e.target.value)}
                      placeholder="SFG-MERCHANT-001"
                      className="w-full font-mono text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Merchant UPI VPA (प्राप्तकर्ता VPA)
                    </label>
                    <input
                      type="text"
                      value={youpiVpaInput}
                      onChange={(e) => setYoupiVpaInput(e.target.value)}
                      placeholder="safargo@okicici"
                      className="w-full font-mono text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    व्यापारी / फर्म का नाम (NPCI Payee Name)
                  </label>
                  <input
                    type="text"
                    value={youpiNameInput}
                    onChange={(e) => setYoupiNameInput(e.target.value)}
                    placeholder="SafarGo Travel Super App"
                    className="w-full text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <label className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={youpiSandboxInput}
                    onChange={(e) => setYoupiSandboxInput(e.target.checked)}
                    className="text-emerald-600 rounded"
                  />
                  <div>
                    <span className="font-bold text-emerald-950">स्मार्ट फॉलबैक एवं सैंडबॉक्स मोड सक्रिय रखें</span>
                    <p className="text-[10px] text-emerald-800">YouPI बैकएंड शुरू न होने पर भी चेकआउट कभी फेल नहीं होगा।</p>
                  </div>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    updateYoupiConfig({
                      apiUrl: youpiApiUrlInput,
                      merchantId: youpiMerchantIdInput,
                      merchantUpiVpa: youpiVpaInput,
                      merchantName: youpiNameInput,
                      autoConfirmSandbox: youpiSandboxInput
                    });
                    setAdminToast('✅ YouPI PG गेटवे कॉन्फ़िगरेशन सफलतापूर्वक सुरक्षित किया गया!');
                    setTimeout(() => setAdminToast(''), 4000);
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>YouPI PG सेटिंग्स सेव करें</span>
                </button>
              </div>
            </div>

            {/* GATEWAY 2: OpenWA WhatsApp Gateway */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#25D366]/20 text-[#128C7E] flex items-center justify-center font-black">
                    <MessageSquare className="w-5 h-5 text-[#25D366]" />
                  </div>
                  <div>
                    <h4 className="font-black text-base text-slate-900">OpenWA WhatsApp Gateway</h4>
                    <p className="text-xs text-slate-500">Automated e-Ticket & Notification Engine</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-[#25D366]/20 text-[#128C7E] border border-[#25D366]/40">
                  Ready / Connected
                </span>
              </div>

              {/* Ping Connection Box */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">WhatsApp API स्टेटस</span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">
                    {openWaTestResult ? openWaTestResult.message : 'OpenWA सर्वर (Port 2785 /api) पर टेस्ट करें'}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={openWaTesting}
                  onClick={async () => {
                    setOpenWaTesting(true);
                    setOpenWaTestResult(null);
                    const res = await testOpenWaConnection(openWaApiUrlInput, openWaSessInput);
                    setOpenWaTestResult(res);
                    setOpenWaTesting(false);
                  }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${openWaTesting ? 'animate-spin' : ''}`} />
                  <span>{openWaTesting ? 'जांच रहा है...' : 'टेस्ट पिंग (Ping)'}</span>
                </button>
              </div>

              {/* OpenWA Form Fields */}
              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    OpenWA API Base URL
                  </label>
                  <input
                    type="text"
                    value={openWaApiUrlInput}
                    onChange={(e) => setOpenWaApiUrlInput(e.target.value)}
                    placeholder="http://localhost:2785/api"
                    className="w-full font-mono text-xs font-bold px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">OpenWA Docker / NestJS API पोर्ट 2785 का एंडपॉइंट</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Session ID (सत्र नाम)
                    </label>
                    <input
                      type="text"
                      value={openWaSessInput}
                      onChange={(e) => setOpenWaSessInput(e.target.value)}
                      placeholder="safargo-session"
                      className="w-full font-mono text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      X-API-Key (वैकल्पिक)
                    </label>
                    <input
                      type="password"
                      value={openWaKeyInput}
                      onChange={(e) => setOpenWaKeyInput(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full font-mono text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={openWaFallbackInput}
                    onChange={(e) => setOpenWaFallbackInput(e.target.checked)}
                    className="text-emerald-600 rounded"
                  />
                  <div>
                    <span className="font-bold text-slate-900">1-क्लिक WhatsApp वेब फॉलबैक लिंक चालू रखें</span>
                    <p className="text-[10px] text-slate-500">API ऑफलाइन होने पर सीधे wa.me लिंक से 1-क्लिक में टिकट शेयर होगा।</p>
                  </div>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    updateOpenWaConfig({
                      apiUrl: openWaApiUrlInput,
                      sessionId: openWaSessInput,
                      apiKey: openWaKeyInput,
                      fallbackToWhatsAppWeb: openWaFallbackInput
                    });
                    setAdminToast('✅ OpenWA WhatsApp गेटवे कॉन्फ़िगरेशन सफलतापूर्वक सुरक्षित किया गया!');
                    setTimeout(() => setAdminToast(''), 4000);
                  }}
                  className="w-full py-3 bg-[#25D366] hover:bg-[#1ebe5d] active:scale-95 text-white font-black rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>OpenWA WhatsApp सेटिंग्स सेव करें</span>
                </button>
              </div>
            </div>

            {/* GATEWAY 3: Google Maps Platform System */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-5 lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                    <Navigation className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-base text-slate-900">Google Maps Platform™ System Integration</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Universal Live
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Live Bus GPS Tracking, Boarding Point Geo-Search, Cab Route Corridors & Turn-by-Turn Navigation</p>
                  </div>
                </div>

                <a
                  href="https://console.cloud.google.com/google/maps-apis/overview?utm_campaign=gmp_git_agentskills_v1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1 self-start sm:self-auto border border-slate-300"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Google Cloud Console</span>
                </a>
              </div>

              {/* Status & Modules Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="font-bold text-slate-500 text-[10px] uppercase block">बस जीपीएस ट्रैकिंग</span>
                  <span className="text-emerald-700 font-extrabold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> LiveRouteModal Active
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="font-bold text-slate-500 text-[10px] uppercase block">बोर्डिंग स्टॉप नेविगेशन</span>
                  <span className="text-emerald-700 font-extrabold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> All Stops Linked
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="font-bold text-slate-500 text-[10px] uppercase block">कैब रूट कॉरिडोर</span>
                  <span className="text-emerald-700 font-extrabold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Cabs Preview Active
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="font-bold text-slate-500 text-[10px] uppercase block">रेंडरिंग इंजन</span>
                  <span className="text-indigo-700 font-extrabold flex items-center gap-1 mt-0.5">
                    <Navigation className="w-3.5 h-3.5" /> @vis.gl + Embed Fallback
                  </span>
                </div>
              </div>

              {/* API Key Form */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Google Maps Platform API Key (वैकल्पिक / कस्टम प्रोडक्शन की)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={gmapsKeyInput}
                      onChange={(e) => setGmapsKeyInput(e.target.value)}
                      placeholder="AIzaSy... (खाली छोड़ने पर ऑटो-फॉलबैक एम्बेड मोड काम करेगा)"
                      className="flex-1 font-mono text-xs font-bold px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setStoredGoogleMapsApiKey(gmapsKeyInput);
                        setAdminToast('✅ Google Maps API Key सफलतापूर्वक सुरक्षित की गई!');
                        setTimeout(() => setAdminToast(''), 4000);
                      }}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black rounded-xl shadow-md transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>सेव करें</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    बिना किसी की के भी SafarGo का गूगल मैप्स नेविगेशन व लाइव रूट सिस्टम 100% सुचारू रूप से कार्य करता है।
                  </p>
                </div>

                {/* Test Action */}
                <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-indigo-950">लाइव टेस्ट रूट: Indore → Bhopal (195 KM Highway Corridor)</span>
                  </div>
                  <a
                    href={getGoogleMapsDirectionsUrl('Indore, MP', 'Bhopal, MP', 'driving')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 self-start sm:self-auto transition"
                  >
                    <span>🗺️ गूगल मैप्स में खोलें</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* REAL-TIME TEST MESSENGER TOOL */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                </span>
                <div>
                  <h4 className="font-black text-sm text-slate-900">लाइव WhatsApp मैसेज डिस्पैच टेस्टर (Test Console)</h4>
                  <p className="text-xs text-slate-500">किसी भी मोबाइल नंबर पर लाइव WhatsApp टेस्ट संदेश भेजकर सत्यापन करें</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  प्राप्तकर्ता मोबाइल नंबर (10 अंक)
                </label>
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2">
                  <span className="font-bold text-slate-500">+91</span>
                  <input
                    type="text"
                    value={testWaPhone}
                    onChange={(e) => setTestWaPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9811000001"
                    className="flex-1 font-mono font-bold bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  टेस्ट संदेश सामग्री (Message Payload)
                </label>
                <input
                  type="text"
                  value={testWaMessage}
                  onChange={(e) => setTestWaMessage(e.target.value)}
                  className="w-full font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs">
                {testWaResult && (
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    {testWaResult}
                  </span>
                )}
              </div>

              <button
                type="button"
                disabled={sendingTestWa}
                onClick={async () => {
                  if (!testWaPhone || testWaPhone.length < 10) {
                    alert('कृपया 10-अंकीय मोबाइल नंबर दर्ज करें');
                    return;
                  }
                  setSendingTestWa(true);
                  setTestWaResult(null);
                  try {
                    const res = await sendOpenWaMessage(testWaPhone, testWaMessage);
                    if (res.success) {
                      setTestWaResult(`✅ WhatsApp API से भेजा गया (+91 ${testWaPhone})`);
                    } else if (res.directWebUrl) {
                      window.open(res.directWebUrl, '_blank');
                      setTestWaResult(`📲 WhatsApp वेब विंडो खोली गई (+91 ${testWaPhone})`);
                    }
                  } catch (e: any) {
                    setTestWaResult(`त्रुटि: ${e?.message || 'संदेश नहीं भेजा जा सका'}`);
                  } finally {
                    setSendingTestWa(false);
                  }
                }}
                className="px-5 py-2.5 bg-[#25D366] hover:bg-[#1ebe5d] active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{sendingTestWa ? 'भेज रहा है...' : 'टेस्ट WhatsApp भेजें'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DEDICATED ADMIN MARKETING & FESTIVAL POSTER STUDIO                        */}
      {/* ========================================================================= */}
      {isAdmin && adminActiveTab === 'marketing' && (
        <div className="space-y-6 animate-fade-in">
          <AgentMarketingStudio />
        </div>
      )}

      {/* ========================================================================= */}
      {/* STANDARD AGENT EARNING DESK (SHOWN TO AGENTS, OR ADMIN IN DESK MODE)     */}
      {/* ========================================================================= */}
      {(!isAdmin || adminActiveTab === 'desk') && (
        <>
          {/* Top Banner with Toggle */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /> SafarGo B2B Partner Portal • Fixed ₹19.34
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {t('सफ़रगो ट्रेवल एजेंट हब • फिक्स ₹19.34 कमीशन', 'Fixed ₹19.34 Commission on Every Booking')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              {t(
                'ग्राहकों और रिश्तेदारों के लिए बस और होटल टिकट बुक करें और तुरंत फ्लैट ₹19.34 प्रति बुकिंग कमीशन कमाएं। 24x7 तुरंत बैंक में निकालें या रविवार ऑटो-पेआउट पाएं!',
                'Book bus seats & hotel stays for customers. Earn a guaranteed flat ₹19.34 commission per booking. Withdraw instantly 24x7 to UPI/Bank or get auto-credited every Sunday!'
              )}
            </p>
          </div>

          {/* Toggle Switch */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 self-start md:self-auto flex items-center gap-4">
            <div>
              <p className="text-xs font-bold text-white">{t('एजेंट बुकिंग मोड', 'Agent Mode')}</p>
              <p className="text-[10px] text-amber-300 font-semibold">
                {isAgentMode ? t('चालू: ₹19.34 कमीशन सक्रिय', 'Active: ₹19.34 / Booking') : t('सामान्य बुकिंग', 'Disabled')}
              </p>
            </div>
            <button
              onClick={() => setIsAgentMode(!isAgentMode)}
              className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                isAgentMode ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                  isAgentMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row: Wallet Balance + Instant Withdraw */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Wallet Balance with Instant Withdrawal CTA */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{t('वॉलेट बैलेंस (उपलब्ध)', 'Available Balance')}</span>
              <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Wallet className="w-5 h-5" />
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900">
              ₹{agentWalletBalance.toFixed(2)}
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {t('तत्काल निकासी के लिए उपलब्ध', 'Ready for Instant Withdrawal')}
            </p>
          </div>

          {/* Instant Withdraw Button */}
          <button
            onClick={handleOpenWithdraw}
            disabled={agentWalletBalance <= 0}
            className={`w-full mt-4 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-md ${
              agentWalletBalance > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 active:scale-95'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>{t('पैसे निकालें (Withdraw Cash)', 'Withdraw to UPI / Bank')}</span>
          </button>
        </div>

        {/* Fixed Commission Rate Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{t('फिक्स कमीशन दर', 'Fixed Commission Rate')}</span>
              <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </span>
            </div>
            <div className="text-3xl font-black text-amber-600">
              ₹19.34
              <span className="text-xs font-normal text-slate-500"> / {t('प्रति बुकिंग', 'booking')}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {t('बस व होटल की प्रत्येक बुकिंग पर फ्लैट ₹19.34 अर्जित करें', 'Guaranteed ₹19.34 per confirmed booking')}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">{t('कुल अर्जित कमीशन:', 'Total Lifetime:')}</span>
            <span className="font-black text-slate-900">₹{totalCommissionEarned.toFixed(2)}</span>
          </div>
        </div>

        {/* Customer Bookings Done */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{t('कुल ग्राहक बुकिंग', 'Agent Bookings')}</span>
              <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Users className="w-5 h-5" />
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900">{bookings.length} {t('टिकटें', 'Bookings')}</div>
            <p className="text-[11px] text-slate-400 mt-1">{t('सफ़रगो गोल्ड पार्टनर सर्टिफाइड', 'SafarGo Gold Partner Level')}</p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">{t('पेंडिंग पेआउट:', 'Pending Payout:')}</span>
            <span className="font-black text-emerald-700">₹{agentWalletBalance.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Dual Withdrawal & Sunday Payout Explanation Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-5 text-slate-800">
        <h4 className="font-bold text-sm text-blue-950 flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>{t('निकासी व्यवस्था (Instant Withdrawal & Sunday Auto-Payout)', 'Withdrawal & Sunday Auto-Payout System')}</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-slate-600">
          <div className="bg-white p-3.5 rounded-2xl border border-blue-100 shadow-xs">
            <p className="font-bold text-slate-900 flex items-center gap-1.5 text-emerald-700">
              ⚡ {t('1. तत्काल 24x7 निकासी (Instant Transfer):', '1. Instant Withdrawal (24x7):')}
            </p>
            <p className="mt-1">
              {t(
                'आप कभी भी "पैसे निकालें" बटन पर क्लिक करके मात्र 5 सेकंड में अपना कमीशन सीधे अपने UPI या बैंक खाते में ट्रांसफर कर सकते हैं।',
                'Click "Withdraw Cash" anytime to transfer your balance to UPI or Bank Account in just 5 seconds.'
              )}
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-blue-100 shadow-xs">
            <p className="font-bold text-slate-900 flex items-center gap-1.5 text-indigo-700">
              🗓️ {t('2. रविवार ऑटो-पेआउट (Sunday Automated Cycle):', '2. Automated Sunday Payout:')}
            </p>
            <p className="mt-1">
              {t(
                'यदि आप स्वयं निकासी नहीं करते, तो आपका शेष वॉलेट बैलेंस प्रत्येक रविवार सुबह 10:00 बजे आपके पंजीकृत बैंक खाते में स्वतः ट्रांसफर कर दिया जाता है।',
                'Any remaining wallet balance is automatically settled into your registered bank account every Sunday morning at 10 AM.'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Start Booking CTA for Customers */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">{t('ग्राहक के लिए टिकट बुक करें (कमाएं ₹19.34)', 'Book Ticket for Customer')}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('प्रत्येक बुकिंग पर सीधा ₹19.34 फिक्स कमीशन आपके वॉलेट में जुड़ेगा।', 'Flat ₹19.34 fixed commission added instantly on every ticket confirmation.')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsAgentMode(true);
              setActiveService('bus');
              setCurrentStep('search');
            }}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 transition flex items-center gap-1.5"
          >
            <Bus className="w-4 h-4" />
            <span>{t('बस बुक करें (+₹19.34)', 'Book Bus (+₹19.34)')}</span>
          </button>
          <button
            onClick={() => {
              setIsAgentMode(true);
              setActiveService('hotel');
              setCurrentStep('search');
            }}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
          >
            <Building2 className="w-4 h-4" />
            <span>{t('होटल बुक करें (+₹19.34)', 'Book Hotel (+₹19.34)')}</span>
          </button>
        </div>
      </div>

      {/* Bank Payout & Withdrawal History */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">{t('निकासी व पेआउट हिस्ट्री (Payout History)', 'Withdrawal & Payout History')}</h3>
          <span className="text-xs text-slate-400">{agentPayoutHistory.length} {t('लेन-देन', 'records')}</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {agentPayoutHistory.map((payout) => (
            <div key={payout.id} className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <p className="font-bold text-slate-900">{payout.destination || 'Bank Account (**4910)'}</p>
                  <p className="text-[11px] text-slate-400">UTR: {payout.utr} • {payout.date}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-black text-sm text-emerald-700">+₹{payout.amount.toFixed(2)}</span>
                <span className="text-[10px] text-slate-400 block font-semibold">{t('सफल (Transfer Success)', 'SUCCESS')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent WhatsApp Marketing & Promotional Banner Studio */}
      <AgentMarketingStudio />
      </>
      )}

      {/* Instant Withdrawal Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <ArrowDownToLine className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">{t('कमीशन निकासी (Instant Withdrawal)', 'Instant Commission Withdrawal')}</h3>
                  <p className="text-[11px] text-slate-400">{t('उपलब्ध बैलेंस:', 'Available Balance:')} ₹{agentWalletBalance.toFixed(2)}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsWithdrawModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!withdrawSuccess ? (
              <form onSubmit={handleProcessWithdrawal} className="space-y-4 text-xs">
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
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                      className="w-full font-black text-base pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Quick Pill options */}
                  <div className="flex gap-2 mt-2">
                    {[200, 500, Math.floor(agentWalletBalance)].map((amt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setWithdrawAmount(amt)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-semibold text-slate-700"
                      >
                        {idx === 2 ? t('पूरा बैलेंस', 'Full Balance') : `₹${amt}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transfer Destination Tabs */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">{t('ट्रांसफर माध्यम चुनें', 'Transfer Mode')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPayoutMethod('upi')}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                        payoutMethod === 'upi'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <QrCode className="w-4 h-4" />
                      <span>{t('UPI (तुरंत 5 सेकंड)', 'UPI (Instant)')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPayoutMethod('bank')}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                        payoutMethod === 'bank'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <Building className="w-4 h-4" />
                      <span>{t('बैंक खाता (IMPS)', 'Bank A/C')}</span>
                    </button>
                  </div>
                </div>

                {/* Conditional Inputs */}
                {payoutMethod === 'upi' ? (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{t('अपनी UPI ID दर्ज करें', 'Enter UPI ID (VPA)')}</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. mobile@paytm / name@okhdfcbank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">GPay, PhonePe, Paytm, BHIM UPI</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">{t('बैंक खाता संख्या', 'Account Number')}</label>
                      <input
                        type="text"
                        required
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                        className="w-full font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">{t('IFSC कोड', 'IFSC Code')}</label>
                      <input
                        type="text"
                        required
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value)}
                        className="w-full font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md shadow-emerald-600/30 transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  <span>{t(`₹${withdrawAmount.toFixed(2)} अभी ट्रांसफर करें`, `Transfer ₹${withdrawAmount.toFixed(2)} Now`)}</span>
                </button>
              </form>
            ) : (
              <div className="text-center py-4 space-y-4 text-xs">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h4 className="text-lg font-black text-slate-900">{t('निकासी अनुरोध सफल!', 'Withdrawal Successful!')}</h4>
                <p className="text-slate-500">
                  {t(`₹${withdrawAmount.toFixed(2)} आपके खाते में तुरंत ट्रांसफर कर दिया गया है।`, `₹${withdrawAmount.toFixed(2)} has been credited successfully.`)}
                </p>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-left space-y-1">
                  <p><span className="text-slate-400">लेन-देन UTR:</span> <span className="font-mono font-bold text-slate-900">{lastTxnUtr}</span></p>
                  <p><span className="text-slate-400">माध्यम:</span> <span className="font-bold text-slate-900">{payoutMethod === 'upi' ? upiId : `${bankName} (${bankAccount})`}</span></p>
                  <p><span className="text-slate-400">शेष बैलेंस:</span> <span className="font-bold text-emerald-700">₹{agentWalletBalance.toFixed(2)}</span></p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition"
                >
                  {t('पूर्ण (Done)', 'Done')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 1. Official PDF Application Dossier Modal */}
      <ApplicationDossierModal
        agent={selectedDossierAgent}
        isOpen={isDossierModalOpen}
        onClose={() => {
          setIsDossierModalOpen(false);
          setSelectedDossierAgent(null);
        }}
        isAdmin={isAdmin}
        onApprove={handleApproveAgent}
        isApproving={approvingId === selectedDossierAgent?.id}
      />

      {/* 3. Agent Balance Adjustment Modal */}
      {balanceModalAgent && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                  <Wallet className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-base">वॉलेट बैलेंस एडजस्ट करें</h4>
                  <p className="text-xs text-slate-500">{balanceModalAgent.fullName} ({balanceModalAgent.id})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBalanceModalAgent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBalanceAdjustType('credit')}
                  className={`py-2.5 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                    balanceAdjustType === 'credit'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>+ क्रेडिट (जोड़ें)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBalanceAdjustType('debit')}
                  className={`py-2.5 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                    balanceAdjustType === 'debit'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>- डेबिट (काटें)</span>
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  राशि (रुपये में) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    min="1"
                    value={balanceAdjustAmount}
                    onChange={(e) => setBalanceAdjustAmount(Math.max(1, Number(e.target.value)))}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  विवरण / ऑडिट नोट *
                </label>
                <input
                  type="text"
                  value={balanceAdjustNote}
                  onChange={(e) => setBalanceAdjustNote(e.target.value)}
                  placeholder="उदा. प्रोत्साहन बोनस / बैंक जमा समाधान"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                <span>वर्तमान बैलेंस: <strong>₹{(balanceModalAgent.walletBalance || 0).toFixed(2)}</strong></span>
                <span className="block mt-0.5">नया संभावित बैलेंस: <strong>₹{Math.max(0, (balanceModalAgent.walletBalance || 0) + (balanceAdjustType === 'credit' ? balanceAdjustAmount : -balanceAdjustAmount)).toFixed(2)}</strong></span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setBalanceModalAgent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={handleConfirmAdjustBalance}
                className={`px-5 py-2 text-white font-bold text-xs rounded-xl shadow-md transition ${
                  balanceAdjustType === 'credit' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                बैलेंस अपडेट करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Agent Fraud & Suspension Dialog */}
      {suspendModalAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-red-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-red-600 font-black text-sm sm:text-base">
                <Ban className="w-5 h-5" />
                <span>एजेंट आईडी सस्पेंड करें</span>
              </div>
              <button 
                onClick={() => setSuspendModalAgent(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-900 space-y-1">
              <p className="font-bold">⚠️ आईडी सस्पेंड होने पर प्रभाव:</p>
              <p>एजेंट पोर्टल में लॉगिन तुरंत ब्लॉक हो जाएगा। एजेंट कोई नई बुकिंग या पेआउट नहीं कर पाएगा।</p>
            </div>

            <div className="text-xs space-y-1">
              <span className="text-slate-400 font-bold uppercase">लक्षित एजेंट:</span>
              <p className="font-black text-slate-900">{suspendModalAgent.shopName} ({suspendModalAgent.fullName})</p>
              <p className="font-mono text-slate-500">{suspendModalAgent.id} • {suspendModalAgent.mobile}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                सस्पेंशन का कारण दर्ज करें (Reason):
              </label>
              <input
                type="text"
                value={suspendReasonInput}
                onChange={(e) => setSuspendReasonInput(e.target.value)}
                placeholder="उदा. धोखाधड़ी, फर्जी टिकट या कंपनी नियमों का उल्लंघन"
                className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            {/* Quick Reason Suggestions */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">त्वरित कारण चुनें:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'धोखाधड़ी / फर्जी टिकट बुकिंग',
                  'पहचान दस्तावेज में विसंगति',
                  'कंपनी आचार संहिता उल्लंघन',
                  'ग्राहक शिकायत व अनाधिकृत पेआउट'
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setSuspendReasonInput(reason)}
                    className="text-[10px] font-semibold bg-slate-100 hover:bg-red-50 hover:text-red-700 px-2.5 py-1 rounded-lg border border-slate-200 transition"
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setSuspendModalAgent(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={() => {
                  suspendAgent(suspendModalAgent.id, suspendReasonInput);
                  setAdminToast(`🚫 एजेंट ${suspendModalAgent.fullName} (${suspendModalAgent.id}) की आईडी सस्पेंड कर दी गई है।`);
                  setTimeout(() => setAdminToast(''), 6000);
                  setSuspendModalAgent(null);
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-md transition"
              >
                सस्पेंशन लागू करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Admin Direct Password Reset Dialog */}
      {passwordModalAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-black text-sm sm:text-base">
                <Key className="w-5 h-5 text-amber-500" />
                <span>एजेंट का नया पासवर्ड सेट करें</span>
              </div>
              <button 
                onClick={() => setPasswordModalAgent(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-1">
              <span className="text-slate-400 font-bold uppercase">एजेंट:</span>
              <p className="font-black text-slate-900">{passwordModalAgent.shopName} ({passwordModalAgent.fullName})</p>
              <p className="font-mono text-slate-500">{passwordModalAgent.email} • {passwordModalAgent.mobile}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                नया पासवर्ड दर्ज करें:
              </label>
              <input
                type="text"
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                placeholder="e.g. safargo@agent2026"
                className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setPasswordModalAgent(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                रद्द करें
              </button>
              <button
                type="button"
                disabled={!newPasswordInput.trim()}
                onClick={() => {
                  setAgentPassword(passwordModalAgent.id, newPasswordInput.trim());
                  confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
                  setAdminToast(`✅ एजेंट ${passwordModalAgent.fullName} का नया पासवर्ड सुरक्षित रूप से सेट कर दिया गया है!`);
                  setTimeout(() => setAdminToast(''), 5000);
                  setPasswordModalAgent(null);
                }}
                className={`flex-1 py-2.5 text-xs font-black rounded-xl shadow-md transition ${
                  newPasswordInput.trim()
                    ? 'bg-amber-400 hover:bg-amber-500 text-slate-950'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                पासवर्ड सेव करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADMIN MODAL: SAFARGO QR CODE & UPI CONFIGURATION                          */}
      {/* ========================================================================= */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-up space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-indigo-600" />
                <span>सफ़रगो मर्चेंट QR कोड व UPI कॉन्फ़िगरेशन</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQrConfig} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  मर्चेंट का नाम (Business / Firm Name):
                </label>
                <input
                  type="text"
                  required
                  value={newMerchantName}
                  onChange={(e) => setNewMerchantName(e.target.value)}
                  placeholder="e.g. SafarGo Mobility Services Ltd"
                  className="w-full font-semibold px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  मर्चेंट UPI ID (भुगतान प्राप्त करने हेतु):
                </label>
                <input
                  type="text"
                  required
                  value={newMerchantUpi}
                  onChange={(e) => setNewMerchantUpi(e.target.value)}
                  placeholder="e.g. safargo.travel@icici"
                  className="w-full font-mono font-semibold px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  QR कोड इमेज अपलोड करें (PNG/JPG):
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-dashed border-slate-300">
                    <Upload className="w-4 h-4 text-slate-600" />
                    <span>इमेज फ़ाइल चुनें</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrImageUpload}
                      className="hidden"
                    />
                  </label>
                  {newQrImage && (
                    <button
                      type="button"
                      onClick={() => setNewQrImage('')}
                      className="text-red-500 hover:text-red-700 text-[11px] font-bold"
                    >
                      हटाएं
                    </button>
                  )}
                </div>
              </div>

              {/* QR Preview */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center">
                {newQrImage ? (
                  <img
                    src={newQrImage}
                    alt="Uploaded QR"
                    className="w-32 h-32 object-contain rounded-xl shadow-inner border border-slate-200 bg-white p-1"
                  />
                ) : (
                  <div className="text-center p-2">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=${newMerchantUpi}&pn=${encodeURIComponent(newMerchantName)}&cu=INR`)}`}
                      alt="Generated Dynamic QR"
                      className="w-32 h-32 object-contain mx-auto rounded-xl shadow-inner border border-slate-200 bg-white p-1"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">ऑटो-जेनरेटेड डायनामिक QR कोड</p>
                  </div>
                )}
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsQrModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md transition active:scale-95"
                >
                  सेटिंग्स सेव करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADMIN MODAL: FRAUD SUSPEND CONFIRMATION MODAL                            */}
      {/* ========================================================================= */}
      {fraudModalTopUp && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-red-500 animate-scale-up space-y-4">
            <div className="flex items-center gap-3 text-red-600 pb-2 border-b border-red-100">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="text-base font-black text-slate-900">🚨 फर्जी UTR - तत्काल खाता सस्पेंड</h3>
                <p className="text-[11px] text-red-600 font-semibold">धोखाधड़ी निवारण एवं बैलेंस रिवोक प्रणाली</p>
              </div>
            </div>

            <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-950 space-y-2">
              <div className="flex justify-between font-bold">
                <span className="text-slate-500">एजेंट:</span>
                <span>{fraudModalTopUp.agentName} ({fraudModalTopUp.shopName})</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-500">मोबाइल / आईडी:</span>
                <span className="font-mono">{fraudModalTopUp.mobile} • {fraudModalTopUp.agentId}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-500">जमा राशि:</span>
                <span className="text-red-700 text-sm font-black">₹{fraudModalTopUp.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-500">दावा किया गया UTR:</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-red-200">{fraudModalTopUp.utr}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              ⚠️ सस्पेंड करते ही एजेंट के वॉलेट से यह <strong>₹{fraudModalTopUp.amount}</strong> तुरंत काट ली जाएगी, एजेंट की आईडी लॉक हो जाएगी और वह कभी लॉगिन नहीं कर सकेगा।
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                सस्पेंशन कारण (कारण ऑडिट में दर्ज होगा):
              </label>
              <input
                type="text"
                value={fraudReasonInput}
                onChange={(e) => setFraudReasonInput(e.target.value)}
                placeholder="उदा. बैंक खाते में राशि प्राप्त नहीं हुई / फर्जी UTR फ्रॉड"
                className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setFraudModalTopUp(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                कैंसिल
              </button>
              <button
                type="button"
                onClick={handleConfirmFraudSuspend}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-md transition active:scale-95"
              >
                🚨 सस्पेंड व बैलेंस जब्त करें
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ========================================================================= */}
      {/* ADMIN MODAL: FULL TICKET DOSSIER & PDF PREVIEW                           */}
      {/* ========================================================================= */}
      {isTicketDossierModalOpen && selectedTicketForDossier && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scale-up space-y-6 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-100 text-rose-700 rounded-2xl">
                  <Ticket className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {t('📄 आधिकारिक ई-टिकट एवं ऑडिट डॉसियर', 'Official e-Ticket & Inspection Dossier')}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    PNR: <strong className="text-slate-900">{selectedTicketForDossier.pnr}</strong> • SafarGo Central HQ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsTicketDossierModalOpen(false);
                  setSelectedTicketForDossier(null);
                }}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Ticket Dossier Body */}
            <div className="space-y-4 text-xs" id="admin-ticket-dossier">
              {/* Top Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider mb-1">
                    SafarGo Mobility Network
                  </div>
                  <h4 className="text-base font-black">
                    {selectedTicketForDossier.busDetails?.bus.operatorName || 'SafarGo Express'}
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    {selectedTicketForDossier.busDetails?.bus.sourceCity} ➔ {selectedTicketForDossier.busDetails?.bus.destinationCity} • {selectedTicketForDossier.busDetails?.bus.busType}
                  </p>
                </div>

                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                    selectedTicketForDossier.status === 'pending'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                      : selectedTicketForDossier.status === 'confirmed'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                      : 'bg-red-500/20 text-red-300 border-red-400/50'
                  }`}>
                    {selectedTicketForDossier.status === 'pending' ? '⏳ समीक्षाधीन' : selectedTicketForDossier.status === 'confirmed' ? '✅ सत्यापित' : '❌ अस्वीकृत'}
                  </span>
                  <div className="font-mono text-xs text-amber-400 mt-1 font-bold">
                    PNR: {selectedTicketForDossier.pnr}
                  </div>
                </div>
              </div>

              {/* Journey & Passenger Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">प्रस्थान एवं आगमन</span>
                  <p className="font-bold text-slate-900 text-sm">
                    {selectedTicketForDossier.travelDate} ({selectedTicketForDossier.busDetails?.bus.departureTime})
                  </p>
                  <p className="text-emerald-700 font-semibold text-[11px]">
                    बोर्डिंग: {selectedTicketForDossier.busDetails?.boardingPoint.name}
                  </p>
                  <p className="text-slate-500 text-[10px]">
                    {selectedTicketForDossier.busDetails?.boardingPoint.address}
                  </p>
                  <p className="text-indigo-700 font-semibold text-[11px] pt-1">
                    ड्रॉपिंग: {selectedTicketForDossier.busDetails?.droppingPoint.name}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">यात्री विवरण</span>
                  <p className="font-bold text-slate-900 text-sm">{selectedTicketForDossier.passengerDetails.fullName}</p>
                  <p className="text-slate-600 font-mono">मोबाइल: +91 {selectedTicketForDossier.passengerDetails.mobile}</p>
                  <p className="text-slate-500 text-[11px]">ईमेल: {selectedTicketForDossier.passengerDetails.email}</p>
                  <div className="pt-1">
                    <span className="font-bold text-slate-700">सीटें: </span>
                    <span className="font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {selectedTicketForDossier.busDetails?.selectedSeats.join(', ') || '1A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment & Audit Strip */}
              <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-amber-950">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>बैंक भुगतान एवं UTR ऑडिट विवरण</span>
                  </span>
                  <span className="text-sm font-black text-slate-900">कुल देय: ₹{selectedTicketForDossier.totalAmount}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                  <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                    <span className="text-slate-400 block font-semibold">बैंक UTR नंबर:</span>
                    <span className="font-mono font-black text-indigo-950 text-xs block truncate">
                      {selectedTicketForDossier.utr || 'N/A'}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                    <span className="text-slate-400 block font-semibold">एजेंट ID:</span>
                    <span className="font-mono font-bold text-slate-800 text-xs block">
                      {selectedTicketForDossier.agentId || 'SFG-AGENT-2026-9041'}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                    <span className="text-slate-400 block font-semibold">फिक्स कमीशन:</span>
                    <span className="font-black text-emerald-700 text-xs block">
                      +₹{(selectedTicketForDossier.agentCommissionAmount || 19.34).toFixed(2)}
                    </span>
                  </div>
                </div>

                {selectedTicketForDossier.verifiedAt && (
                  <p className="text-[10px] text-emerald-700 font-semibold">
                    ✓ सुपर एडमिन द्वारा सत्यापन समय: {selectedTicketForDossier.verifiedAt}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Actions Toolbar */}
            <div className="pt-2 flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>ई-टिकट प्रिंट करें (Print PDF)</span>
              </button>

              {selectedTicketForDossier.status === 'pending' && (
                <button
                  type="button"
                  onClick={async () => {
                    await handleVerifyTicket(selectedTicketForDossier.id);
                    setIsTicketDossierModalOpen(false);
                    setSelectedTicketForDossier(null);
                  }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>✅ अभी सत्यापित करें (Verify Ticket)</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsTicketDossierModalOpen(false);
                  setSelectedTicketForDossier(null);
                }}
                className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition"
              >
                बंद करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADMIN MODAL: REJECT SCAM / FAKE UTR TICKET                                */}
      {/* ========================================================================= */}
      {rejectModalTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-up space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <span>फर्जी UTR - टिकट अस्वीकृत करें</span>
              </h3>
              <button
                type="button"
                onClick={() => setRejectModalTicket(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <p><strong>PNR:</strong> <span className="font-mono text-indigo-700">{rejectModalTicket.pnr}</span></p>
              <p><strong>यात्री:</strong> {rejectModalTicket.passengerDetails.fullName}</p>
              <p><strong>दर्ज बैंक UTR:</strong> <span className="font-mono font-bold text-red-700">{rejectModalTicket.utr || 'N/A'}</span></p>
              <p><strong>राशि:</strong> ₹{rejectModalTicket.totalAmount}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                अस्वीकृति का कारण:
              </label>
              <textarea
                rows={3}
                value={rejectReasonInput}
                onChange={(e) => setRejectReasonInput(e.target.value)}
                className="w-full text-xs font-semibold p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            {rejectModalTicket.agentId && (
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-red-700 bg-red-50 p-3 rounded-xl border border-red-200">
                <input
                  type="checkbox"
                  checked={suspendAgentOnReject}
                  onChange={(e) => setSuspendAgentOnReject(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <span>🚨 इस फर्जी UTR के लिए एजेंट खाता भी सस्पेंड करें</span>
              </label>
            )}

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setRejectModalTicket(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectTicket}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-md transition active:scale-95"
              >
                टिकट अस्वीकृत करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE NEW PROMO CODE MODAL                                               */}
      {/* ========================================================================= */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scale-up space-y-4 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Tag className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    नया प्रोमो कोड व डिस्काउंट ऑफर बनाएं
                  </h3>
                  <p className="text-xs text-slate-400">
                    SafarGo Realtime Database Promo Manager
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPromoModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!promoCodeInput.trim()) {
                  alert('कृपया वैध प्रोमो कोड दर्ज करें');
                  return;
                }
                const codeUpper = promoCodeInput.trim().toUpperCase();
                addPromoOffer({
                  code: codeUpper,
                  title: promoTitleInput.trim() || `${codeUpper} Discount`,
                  description: promoDescInput.trim() || `Save on your bookings with ${codeUpper}`,
                  discountType: promoDiscountType,
                  discountValue: Number(promoDiscountVal) || 100,
                  minBookingAmount: Number(promoMinBooking) || 300,
                  serviceType: promoServiceType,
                  validTill: promoValidTill.trim() || '31 Dec 2026',
                  status: 'active'
                });
                setIsPromoModalOpen(false);
                confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
                setAdminToast(`नया प्रोमो कोड ${codeUpper} सफलतापूर्वक सक्रिय किया गया!`);
                setTimeout(() => setAdminToast(''), 3500);
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-bold text-slate-700 mb-1">
                    प्रोमो कोड (Coupon Code) *
                  </label>
                  <input
                    type="text"
                    required
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                    placeholder="उदा. FESTIVAL200"
                    className="w-full font-mono font-black uppercase px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white tracking-wider"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-bold text-slate-700 mb-1">
                    सेवा प्रकार (Applies To)
                  </label>
                  <select
                    value={promoServiceType}
                    onChange={(e) => setPromoServiceType(e.target.value as any)}
                    className="w-full font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  >
                    <option value="bus">केवल बस बुकिंग (Bus Only)</option>
                    <option value="hotel">केवल होटल स्टे (Hotel Only)</option>
                    <option value="all">सभी सेवाएं (All Services)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ऑफर शीर्षक (Title) *
                </label>
                <input
                  type="text"
                  required
                  value={promoTitleInput}
                  onChange={(e) => setPromoTitleInput(e.target.value)}
                  placeholder="उदा. दिवाली बम्पर डिस्काउंट"
                  className="w-full font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  विवरण (Description)
                </label>
                <input
                  type="text"
                  value={promoDescInput}
                  onChange={(e) => setPromoDescInput(e.target.value)}
                  placeholder="उदा. वोल्वो व एसी स्लीपर बसों पर ₹200 की फ्लैट छूट"
                  className="w-full font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    छूट का प्रकार (Discount Type)
                  </label>
                  <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                    <button
                      type="button"
                      onClick={() => setPromoDiscountType('fixed')}
                      className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] transition ${
                        promoDiscountType === 'fixed'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      फ्लैट ₹ (Flat)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPromoDiscountType('percentage')}
                      className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] transition ${
                        promoDiscountType === 'percentage'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      प्रतिशत %
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {promoDiscountType === 'fixed' ? 'छूट राशि (₹)' : 'छूट प्रतिशत (%)'} *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={promoDiscountVal}
                    onChange={(e) => setPromoDiscountVal(Number(e.target.value))}
                    className="w-full font-black px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    न्यूनतम बुकिंग मूल्य (Min Fare ₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={promoMinBooking}
                    onChange={(e) => setPromoMinBooking(Number(e.target.value))}
                    className="w-full font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    वैधता तिथि (Valid Till)
                  </label>
                  <input
                    type="text"
                    value={promoValidTill}
                    onChange={(e) => setPromoValidTill(e.target.value)}
                    placeholder="31 Dec 2026"
                    className="w-full font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  रद्द करें (Cancel)
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>सक्रिय कोड जारी करें</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
