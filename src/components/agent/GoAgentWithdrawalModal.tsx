import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import {
  X,
  Wallet,
  Building,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  TrendingDown,
  Clock,
  Sparkles,
  Lock,
  Calendar,
} from 'lucide-react';
import { sendWhatsAppOtp, verifyWhatsAppOtp } from '../../lib/whatsappService';

interface GoAgentWithdrawalModalProps {
  onClose: () => void;
  initialMode?: 'salary' | 'wallet';
}

export const GoAgentWithdrawalModal: React.FC<GoAgentWithdrawalModalProps> = ({
  onClose,
}) => {
  const { currentUser } = useAuth();
  const {
    agentWalletBalance,
    withdrawFromGoWallet,
    requestPayout,
    agentPayoutRequests,
  } = useData();
  const { error, success } = useToast();

  const safeBalance = Math.max(0, Number(agentWalletBalance) || 0);

  // Check if there is already an active pending withdrawal for this agent
  const pendingPayout = (agentPayoutRequests || []).find(
    (p) => p.status === 'pending' || p.status === 'processing'
  );

  const [payoutMethod, setPayoutMethod] = useState<'upi' | 'bank'>('upi');
  const [walletAmount, setWalletAmount] = useState<string>(
    safeBalance > 0 ? String(safeBalance) : '500'
  );

  // WhatsApp 2FA OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpUrl, setOtpUrl] = useState('');

  // UPI Fields
  const [upiId, setUpiId] = useState('');

  // Bank Fields
  const [bankName, setBankName] = useState(currentUser?.bank_name || '');
  const [accountHolder, setAccountHolder] = useState(
    currentUser?.bank_account_holder || currentUser?.full_name || ''
  );
  const [accountNumber, setAccountNumber] = useState(currentUser?.bank_account_number || '');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState(
    currentUser?.bank_account_number || ''
  );
  const [ifscCode, setIfscCode] = useState(currentUser?.bank_ifsc || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [withdrawnAmount, setWithdrawnAmount] = useState(0);

  // Sunday Weekly Payout Policy: Every Sunday (हर रविवार साप्ताहिक सेटलमेंट)
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday
  const isSunday = dayOfWeek === 0;
  const [emergencyOverride, setEmergencyOverride] = useState(false);
  const isWithdrawalAllowed = isSunday || emergencyOverride;

  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  const nextSunday = new Date();
  nextSunday.setDate(today.getDate() + (dayOfWeek === 0 ? 0 : daysUntilSunday));
  const nextSundayFormatted = nextSunday.toLocaleDateString('hi-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const parsedWalletAmount = parseFloat(walletAmount) || 0;

  const handleSendWithdrawalOtp = async () => {
    if (!currentUser?.mobile) {
      error('मोबाइल अनुपलब्ध', 'आपके खाते में कोई पंजीकृत मोबाइल नंबर नहीं है।');
      return;
    }
    if (parsedWalletAmount < 100) {
      error('न्यूनतम निकासी', 'न्यूनतम निकासी राशि ₹100 होनी चाहिए।');
      return;
    }
    if (parsedWalletAmount > safeBalance) {
      error('अपर्याप्त बैलेंस', `आपके वॉलेट में केवल ₹${safeBalance.toLocaleString('en-IN')} उपलब्ध हैं।`);
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await sendWhatsAppOtp({
        mobile: currentUser.mobile,
        purpose: 'withdrawal',
        agentName: currentUser.full_name,
        amount: parsedWalletAmount,
        email: currentUser.email,
      });
      if (res.success) {
        setOtpSent(true);
        setOtpUrl(res.directWhatsAppUrl);
        success('WhatsApp OTP भेजा गया! 📲', `6-अंकीय कोड +91 ${currentUser.mobile} के WhatsApp पर भेजा गया है।`);
      } else {
        error('प्रेषण विफल', res.message);
      }
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyWithdrawalOtp = () => {
    if (!enteredOtp || enteredOtp.trim().length !== 6) {
      error('अमान्य OTP', 'कृपया 6-अंकीय कोड दर्ज करें।');
      return;
    }
    const res = verifyWhatsAppOtp(currentUser?.mobile || '', enteredOtp.trim(), 'withdrawal');
    if (res.verified) {
      setIsOtpVerified(true);
      success('OTP सत्यापित! ✓', 'सुरक्षा 2FA सत्यापन पूर्ण। अब निकासी सबमिट करें।');
    } else {
      error('सत्यापन विफल', res.message);
    }
  };

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!isOtpVerified) {
      error('WhatsApp OTP आवश्यक', 'कृपया निकासी सबमिट करने से पहले WhatsApp पर भेजा गया OTP सत्यापित करें।');
      return;
    }

    if (!isWithdrawalAllowed) {
      error(
        'रविवार निकासी नियम',
        `साप्ताहिक निकासी केवल प्रत्येक रविवार को उपलब्ध है। आगामी रविवार: ${nextSundayFormatted}`
      );
      return;
    }

    if (parsedWalletAmount < 100) {
      error('न्यूनतम निकासी', 'न्यूनतम निकासी राशि ₹100 है।');
      return;
    }

    if (parsedWalletAmount > safeBalance) {
      error('अपर्याप्त बैलेंस', `आपके वॉलेट में केवल ₹${safeBalance.toLocaleString('en-IN')} उपलब्ध हैं।`);
      return;
    }

    // Destination validation
    let destination = '';
    if (payoutMethod === 'upi') {
      const cleanUpi = upiId.trim();
      const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
      if (!cleanUpi || !upiRegex.test(cleanUpi)) {
        error('अमान्य UPI ID', 'कृपया सही UPI ID दर्ज करें (उदा. 9826011223@paytm)।');
        return;
      }
      destination = cleanUpi;
    } else {
      if (!accountHolder.trim()) {
        error('खाताधारक का नाम', 'कृपया बैंक खाताधारक का नाम दर्ज करें।');
        return;
      }
      if (!accountNumber.trim() || accountNumber.trim() !== confirmAccountNumber.trim()) {
        error('खाता संख्या बेमेल', 'दोनों जगह दर्ज खाता संख्या एक समान होनी चाहिए।');
        return;
      }
      const cleanIfsc = ifscCode.trim().toUpperCase();
      if (cleanIfsc.length !== 11) {
        error('अमान्य IFSC कोड', 'IFSC कोड 11 अक्षरों का होना चाहिए (उदा. SBIN0001234)।');
        return;
      }
      destination = `${bankName || 'Bank'} A/c: ${accountNumber} (IFSC: ${cleanIfsc}, Holder: ${accountHolder})`;
    }

    setIsSubmitting(true);
    try {
      const ok = await withdrawFromGoWallet(parsedWalletAmount, payoutMethod, destination);
      if (ok) {
        if (requestPayout) {
          await requestPayout({
            amount: parsedWalletAmount,
            payout_method: payoutMethod === 'bank' ? 'bank_transfer' : 'upi',
            upi_id: payoutMethod === 'upi' ? destination : undefined,
            bank_account_holder: payoutMethod === 'bank' ? accountHolder : undefined,
            bank_account_number: payoutMethod === 'bank' ? accountNumber : undefined,
            bank_ifsc: payoutMethod === 'bank' ? ifscCode.trim().toUpperCase() : undefined,
            bank_name: payoutMethod === 'bank' ? bankName : undefined,
            admin_notes: `⚡ GO Agent साप्ताहिक निकासी (Sunday Payout): ${destination}`,
          }).catch(console.warn);
        }

        setWithdrawnAmount(parsedWalletAmount);
        setIsSuccess(true);
        success('निकासी अनुरोध सबमिट हुआ!', `₹${parsedWalletAmount} की निकासी एडमिन डेस्क को भेज दी गई है।`);
      }
    } catch (err: any) {
      error('Withdrawal Error', err?.message || 'निकासी प्रक्रिया में त्रुटि हुई।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-400/80 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden text-white max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border-b border-amber-400/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center border border-amber-400/40">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>साप्ताहिक Go Wallet निकासी</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-bold uppercase">
                  Weekly Payout
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                हर रविवार (Every Sunday) सीधे बैंक या UPI खाते में पेआउट
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">

          {/* CASE A: PENDING PAYOUT REQUEST ALREADY ACTIVE (Cannot submit another until approved) */}
          {pendingPayout ? (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-950/70 via-slate-900 to-slate-950 border-2 border-amber-400 text-center space-y-4 shadow-xl">
                <div className="w-16 h-16 rounded-full bg-amber-400/20 border-2 border-amber-400 text-amber-300 mx-auto flex items-center justify-center animate-pulse">
                  <Clock className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                    प्रतीक्षारत (Pending Approval)
                  </span>
                  <h4 className="text-lg font-black text-white pt-2">
                    आपकी निकासी प्रक्रियाधीन है
                  </h4>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                    आपने पहले ही निकासी का अनुरोध सबमिट किया हुआ है। एडमिन द्वारा स्वीकृति मिलते ही राशि आपके खाते में भेज दी जाएगी।
                  </p>
                </div>

                {/* Details Card */}
                <div className="bg-slate-950/80 rounded-2xl p-4 border border-amber-500/30 text-left space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">अनुरोधित राशि:</span>
                    <span className="text-lg font-black text-amber-300 font-mono">
                      ₹{pendingPayout.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">भुगतान माध्यम:</span>
                    <span className="font-bold text-white uppercase">
                      {pendingPayout.payout_method === 'bank_transfer' ? '🏦 बैंक ट्रांसफर' : '📱 UPI ID'}
                    </span>
                  </div>
                  {pendingPayout.upi_id && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">UPI ID:</span>
                      <span className="font-mono text-emerald-400">{pendingPayout.upi_id}</span>
                    </div>
                  )}
                  {pendingPayout.bank_account_number && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">खाता संख्या:</span>
                      <span className="font-mono text-emerald-400">
                        •••• {pendingPayout.bank_account_number.slice(-4)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">अनुरोध तिथि:</span>
                    <span className="text-slate-300">
                      {new Date(pendingPayout.created_at).toLocaleDateString('hi-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800">
                    <span className="text-slate-400">स्थिति:</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black flex items-center gap-1">
                      <Clock className="w-3 h-3 animate-spin" />
                      एडमिन स्वीकृति प्रक्रियाधीन (हर रविवार सेटलमेंट)
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-blue-950/40 rounded-2xl border border-blue-500/30 text-[11px] text-blue-300 text-left flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>सुरक्षा नियम:</strong> एक समय में केवल एक निकासी अनुरोध लंबित रह सकता है। एडमिन द्वारा इस अनुरोध को प्रोसेस करने के बाद ही आप नया अनुरोध कर सकेंगे।
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-xl text-xs transition cursor-pointer"
                >
                  डैशबोर्ड पर वापस जाएं
                </button>
              </div>
            </div>
          ) : isSuccess ? (
            /* CASE B: JUST COMPLETED SUCCESS VIEW */
            <div className="p-6 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-emerald-400">निकासी अनुरोध दर्ज हुआ!</h4>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  ₹{withdrawnAmount.toLocaleString('en-IN')} का निकासी अनुरोध एडमिन डेस्क को भेजा गया है। हर रविवार को पेआउट सीधे आपके खाते में क्रेडिट कर दिया जाता है।
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer"
              >
                पूर्ण (Done)
              </button>
            </div>
          ) : (
            /* CASE C: NEW WITHDRAWAL REQUEST FORM */
            <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
              
              {/* Go Wallet Balance Pill */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border border-emerald-500/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">उपलब्ध Go Wallet बैलेंस</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">
                    ₹{safeBalance.toLocaleString('en-IN')}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                  साप्ताहिक निकासी
                </span>
              </div>

              {/* Sunday Policy Info Banner */}
              <div className={`p-3.5 rounded-2xl border text-left flex items-start gap-2.5 ${
                isSunday
                  ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
                  : 'bg-amber-950/50 border-amber-500/40 text-amber-300'
              }`}>
                <Calendar className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <div className="space-y-0.5">
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <span>साप्ताहिक रविवार पेआउट नियम (Every Sunday Withdrawal)</span>
                    {isSunday && (
                      <span className="px-2 py-0.2 rounded-full bg-emerald-400 text-slate-950 text-[9px] font-black">
                        आज रविवार है!
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    {isSunday
                      ? 'आज रविवार है — आप आज बिना किसी रुकावट के अपनी कमाई की निकासी का अनुरोध कर सकते हैं।'
                      : `निकासी हर रविवार को प्रोसेस होती है। आगामी रविवार: ${nextSundayFormatted}`}
                  </p>
                  {!isSunday && (
                    <button
                      type="button"
                      onClick={() => setEmergencyOverride(true)}
                      className="text-[10px] text-amber-400 underline font-bold mt-1 inline-block cursor-pointer"
                    >
                      आपातकालीन निकासी अनुरोध भेजें (Emergency Payout Request)
                    </button>
                  )}
                </div>
              </div>

              {/* Withdrawal Amount Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-300 text-xs">
                    निकासी राशि (Amount in ₹) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setWalletAmount(String(safeBalance))}
                    className="text-[10px] font-bold text-amber-400 hover:underline cursor-pointer"
                  >
                    पूरा बैलेंस निकालें (₹{safeBalance.toLocaleString('en-IN')})
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 font-bold text-slate-500 text-sm">₹</span>
                  <input
                    type="number"
                    min="100"
                    max={safeBalance || 100000}
                    value={walletAmount}
                    onChange={(e) => setWalletAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono font-bold text-sm focus:border-amber-400 outline-none"
                    placeholder="500"
                    required
                  />
                </div>
                <span className="text-[10px] text-slate-400 block">न्यूनतम निकासी: ₹100</span>
              </div>

              {/* Payout Method Tabs (UPI vs Bank) */}
              <div className="space-y-2">
                <label className="font-bold text-slate-300 text-xs block">
                  भुगतान माध्यम चुनें (Payout Method)
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('upi')}
                    className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition cursor-pointer text-xs ${
                      payoutMethod === 'upi'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>UPI ID (तुरंत)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('bank')}
                    className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition cursor-pointer text-xs ${
                      payoutMethod === 'bank'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    <span>बैंक खाता (NEFT/IMPS)</span>
                  </button>
                </div>
              </div>

              {/* Method Specific Fields */}
              {payoutMethod === 'upi' ? (
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 text-xs block">
                    आपकी UPI ID *
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="उदा. 9826011223@paytm या name@okhdfcbank"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:border-amber-400 outline-none"
                    required
                  />
                </div>
              ) : (
                <div className="space-y-2.5 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                  <div>
                    <label className="font-bold text-slate-300 text-[11px] block mb-1">
                      खाताधारक का नाम *
                    </label>
                    <input
                      type="text"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      placeholder="नाम जो बैंक पासबुक में है"
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-300 text-[11px] block mb-1">
                        बैंक का नाम *
                      </label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="SBI, HDFC, आदि"
                        className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-amber-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 text-[11px] block mb-1">
                        IFSC कोड *
                      </label>
                      <input
                        type="text"
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                        placeholder="SBIN0001234"
                        maxLength={11}
                        className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs outline-none focus:border-amber-400 uppercase"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 text-[11px] block mb-1">
                      खाता संख्या *
                    </label>
                    <input
                      type="password"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="खाता संख्या दर्ज करें"
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 text-[11px] block mb-1">
                      खाता संख्या की पुष्टि करें *
                    </label>
                    <input
                      type="text"
                      value={confirmAccountNumber}
                      onChange={(e) => setConfirmAccountNumber(e.target.value)}
                      placeholder="खाता संख्या पुनः दर्ज करें"
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                </div>
              )}

              {/* 2FA WhatsApp OTP Security Guard */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white text-xs">WhatsApp 2FA सुरक्षा सत्यापन</span>
                  </div>
                  {isOtpVerified && (
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/40">
                      ✓ सत्यापित (Verified)
                    </span>
                  )}
                </div>

                {!isOtpVerified ? (
                  <div className="space-y-2">
                    {!otpSent ? (
                      <button
                        type="button"
                        disabled={isSendingOtp}
                        onClick={handleSendWithdrawalOtp}
                        className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>{isSendingOtp ? 'OTP भेजा जा रहा है...' : 'WhatsApp पर OTP भेजें'}</span>
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            value={enteredOtp}
                            onChange={(e) => setEnteredOtp(e.target.value)}
                            placeholder="6-अंकीय OTP दर्ज करें"
                            className="flex-1 p-2 bg-slate-900 border border-amber-400 rounded-xl text-white font-mono text-center tracking-widest text-sm outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyWithdrawalOtp}
                            className="px-4 py-2 bg-amber-400 text-slate-950 font-black rounded-xl text-xs hover:bg-amber-300 cursor-pointer"
                          >
                            सत्यापित करें
                          </button>
                        </div>
                        {otpUrl && (
                          <a
                            href={otpUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-emerald-400 hover:underline block text-center"
                          >
                            सीधे WhatsApp पर OTP देखें ➔
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-emerald-300">
                    2FA सुरक्षा सत्यापन पूर्ण हो चुका है। अब आप निकासी सबमिट कर सकते हैं।
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !isOtpVerified || parsedWalletAmount < 100 || parsedWalletAmount > safeBalance}
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black rounded-2xl text-xs shadow-xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'अनुरोध सबमिट हो रहा है...'
                    : `₹${parsedWalletAmount.toLocaleString('en-IN')} निकासी अनुरोध सबमिट करें`}
                </span>
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
