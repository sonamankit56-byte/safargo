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
  Award
} from 'lucide-react';

interface GoAgentWithdrawalModalProps {
  onClose: () => void;
  initialMode?: 'salary' | 'wallet';
}

export const GoAgentWithdrawalModal: React.FC<GoAgentWithdrawalModalProps> = ({
  onClose,
  initialMode = 'salary',
}) => {
  const { currentUser } = useAuth();
  const {
    agentWalletBalance,
    withdrawFromGoWallet,
    withdrawMonthlySalary,
    requestPayout,
    bookings,
  } = useData();
  const { error, success } = useToast();

  const [withdrawalType, setWithdrawalType] = useState<'salary' | 'wallet'>(initialMode);
  const [payoutMethod, setPayoutMethod] = useState<'upi' | 'bank'>('upi');
  const [walletAmount, setWalletAmount] = useState<string>('500');

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

  // Sunday Withdrawal Rule: Allowed only on Sundays (हर रविवार)
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

  // Calculate 280 Target Cycle status
  const TARGET_SALARY_TICKETS = 280;
  const FIXED_MONTHLY_SALARY = 10000;

  const myConfirmedBookings = (bookings || []).filter(
    (b) => b.agent_id === currentUser?.id && b.status === 'confirmed'
  );
  const totalConfirmedBookings = myConfirmedBookings.length;

  const agentSalaryClaims = JSON.parse(
    localStorage.getItem(`safargo_salary_claims_${currentUser?.id}`) || '0'
  );

  // Active tickets in current target cycle after deducting 280 for each salary claimed
  const currentCycleTickets = Math.max(
    0,
    totalConfirmedBookings - agentSalaryClaims * TARGET_SALARY_TICKETS
  );
  const isSalaryTargetMet = currentCycleTickets >= TARGET_SALARY_TICKETS;
  const remainingTicketsForSalary = Math.max(0, TARGET_SALARY_TICKETS - currentCycleTickets);
  const salaryProgressPercent = Math.min(
    100,
    Math.round((currentCycleTickets / TARGET_SALARY_TICKETS) * 100)
  );

  const safeBalance = Number(agentWalletBalance) || 0;
  const parsedWalletAmount = parseFloat(walletAmount) || 0;

  const effectiveAmount = withdrawalType === 'salary' ? FIXED_MONTHLY_SALARY : parsedWalletAmount;

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!isWithdrawalAllowed) {
      error(
        'रविवार निकासी नियम',
        `निकासी केवल प्रत्येक रविवार (Every Sunday) को ही उपलब्ध है। अगली निकासी तिथि: ${nextSundayFormatted}`
      );
      return;
    }

    // Destination validation
    let destination = '';
    if (payoutMethod === 'upi') {
      const cleanUpi = upiId.trim();
      const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
      if (!cleanUpi || !upiRegex.test(cleanUpi)) {
        error(
          'अमान्य UPI ID',
          'कृपया सही UPI ID दर्ज करें (उदा. 9826011223@paytm या name@okhdfcbank)।'
        );
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
      if (withdrawalType === 'salary') {
        // Mode 1: Monthly Fixed Salary Withdrawal (Requires 280 tickets completed)
        if (!isSalaryTargetMet) {
          error(
            'लक्ष्य अपूर्ण',
            `₹10,000 फिक्स्ड वेतन के लिए 280 टिकट पूरे होने चाहिए। आपके पास अभी ${currentCycleTickets} टिकट हैं।`
          );
          return;
        }

        const ok = await withdrawMonthlySalary(payoutMethod, destination);
        if (ok) {
          setWithdrawnAmount(FIXED_MONTHLY_SALARY);
          setIsSuccess(true);
        }
      } else {
        // Mode 2: Regular Wallet Balance Withdrawal
        if (parsedWalletAmount < 100) {
          error('न्यूनतम निकासी', 'न्यूनतम निकासी राशि ₹100 है।');
          return;
        }

        if (parsedWalletAmount > safeBalance) {
          error(
            'अपर्याप्त बैलेंस',
            `आपके वॉलेट में केवल ₹${safeBalance.toLocaleString('en-IN')} उपलब्ध हैं।`
          );
          return;
        }

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
              admin_notes: `⚡ GO Agent निकासी अनुरोध: ${destination}`,
            }).catch(console.warn);
          }

          setWithdrawnAmount(parsedWalletAmount);
          setIsSuccess(true);
        }
      }
    } catch (err: any) {
      error('Withdrawal Error', err?.message || 'निकासी प्रक्रिया में त्रुटि हुई।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl max-w-lg w-full text-white shadow-2xl overflow-hidden my-4">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/50 border-b border-amber-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base text-white">
                  GO Agent निकासी डेस्क (Payout Terminal)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                  रविवार निकासी
                </span>
              </div>
              <p className="text-[11px] text-amber-300 font-medium">
                मासिक फिक्स्ड वेतन (₹10,000) अथवा वॉलेट बैलेंस ट्रांसफर करें
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Screen */}
        {isSuccess ? (
          <div className="p-6 sm:p-8 text-center space-y-5 animate-in zoom-in-95">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase font-black tracking-widest text-emerald-400">
                {withdrawalType === 'salary' ? '🎉 मासिक वेतन निकासी सफल!' : 'निकासी अनुरोध सफल!'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-mono">
                ₹{withdrawnAmount.toLocaleString('en-IN')}.00
              </h2>
              <p className="text-xs text-slate-300">
                {withdrawalType === 'salary' ? (
                  <>
                    ₹10,000 फिक्स्ड वेतन आपके <strong>{payoutMethod === 'upi' ? 'UPI खाते' : 'बैंक खाते'}</strong> में भेज दिया गया है। <strong>280 टिकट लक्ष्य से माइनस कर दिए गए हैं</strong>।
                  </>
                ) : (
                  <>
                    राशि आपके Go Wallet से निकाल ली गई है और <strong>{payoutMethod === 'upi' ? 'UPI खाते' : 'बैंक खाते'}</strong> में भेजी जा रही है।
                  </>
                )}
              </p>
            </div>

            {withdrawalType === 'salary' && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/40 text-xs text-amber-300 font-medium text-left">
                🎯 <strong>नया चक्र प्रारंभ:</strong> 280 टिकट आपके सक्रिय लक्ष्य से घटा दिए गए हैं। अगले ₹10,000 वेतन के लिए पुनः 280 टिकट का लक्ष्य सक्रिय हो गया है।
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-sm transition shadow-lg cursor-pointer"
            >
              पूर्ण (Done)
            </button>
          </div>
        ) : (
          <form onSubmit={handleWithdrawalSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
            {/* Mode Switcher: Salary vs Wallet */}
            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
              <button
                type="button"
                onClick={() => setWithdrawalType('salary')}
                className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer text-xs ${
                  withdrawalType === 'salary'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>₹10k मासिक वेतन (280 लक्ष्य)</span>
              </button>

              <button
                type="button"
                onClick={() => setWithdrawalType('wallet')}
                className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer text-xs ${
                  withdrawalType === 'wallet'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>वॉलेट बैलेंस (₹{safeBalance.toLocaleString('en-IN')})</span>
              </button>
            </div>

            {/* TAB A: 10K MONTHLY SALARY MODE */}
            {withdrawalType === 'salary' && (
              <div className="space-y-3">
                {isSalaryTargetMet ? (
                  /* Target Completed Banner */
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-emerald-500/20 border-2 border-emerald-400 text-left space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-black text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        🎉 280 टिकट लक्ष्य पूर्ण! ₹10,000 फिक्स्ड वेतन अनलॉक
                      </span>
                      <span className="text-[10px] bg-emerald-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                        वेतन अनलॉक
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      सख्त नियम के अनुसार 280 टिकट लक्ष्य पूर्ण होने पर आपको <strong>फिक्स्ड ₹10,000 मासिक वेतन</strong> मिलता है (कोई अतिरिक्त कमीशन अलग से नहीं)। निकासी करने पर <strong>280 टिकट लक्ष्य से माइनस हो जाएंगे</strong>।
                    </p>
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-emerald-500/30 flex justify-between items-center font-mono">
                      <span className="text-slate-400 text-[11px]">निकासी वेतन राशि:</span>
                      <span className="text-xl font-black text-emerald-400">₹10,000.00</span>
                    </div>
                  </div>
                ) : (
                  /* Target Locked Banner */
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/10 border-2 border-amber-500/40 text-left space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-black text-amber-300">
                        <Lock className="w-4 h-4 text-amber-400" />
                        ₹10,000 मासिक वेतन निकासी अभी लॉक है
                      </span>
                      <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                        {remainingTicketsForSalary} टिकट बाकी
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      GO Agent नियम: <strong>280 टिकट का लक्ष्य पूरा होने पर ही ₹10,000 वेतन निकासी का विकल्प खुलेगा।</strong> लक्ष्य से कम टिकट होने पर केवल प्रति टिकट ₹20 कमीशन मिलता है।
                    </p>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-slate-300">
                        <span>प्रगति: {currentCycleTickets} / {TARGET_SALARY_TICKETS} टिकट</span>
                        <span className="text-amber-400 font-mono">{salaryProgressPercent}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-700">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all"
                          style={{ width: `${salaryProgressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB B: WALLET BALANCE MODE */}
            {withdrawalType === 'wallet' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      उपलब्ध Go Wallet बैलेंस
                    </span>
                    <span className="text-xl font-black text-emerald-400 font-mono">
                      ₹{safeBalance.toLocaleString('en-IN')}.00
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWalletAmount(safeBalance.toString())}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs transition border border-amber-400/30 cursor-pointer"
                  >
                    पूरा निकालें (Max)
                  </button>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 text-[11px] mb-1">
                    निकासी राशि (Withdrawal Amount) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={100}
                      max={safeBalance}
                      required
                      value={walletAmount}
                      onChange={(e) => setWalletAmount(e.target.value)}
                      placeholder="कम से कम ₹100"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold text-base outline-none focus:border-emerald-400 transition"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">न्यूनतम निकासी राशि ₹100 है।</p>
                </div>
              </div>
            )}

            {/* Sunday Withdrawal Day Policy Banner */}
            {isSunday ? (
              <div className="p-3 rounded-2xl bg-emerald-500/15 border-2 border-emerald-400 text-emerald-300 flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  <span>🟢 आज रविवार है! साप्ताहिक निकासी विंडो खुली है (Sunday Active)</span>
                </div>
                <span className="text-[10px] bg-emerald-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                  विंडो ओपन
                </span>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/40 text-xs space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-amber-300 font-black">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>साप्ताहिक रविवार निकासी नियम (Every Sunday Withdrawal)</span>
                  </div>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 font-mono px-2 py-0.5 rounded-full border border-amber-400/30">
                    {daysUntilSunday} दिन शेष
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  GO Agent वेतन एवं वॉलेट से राशि की निकासी केवल <strong>प्रत्येक रविवार (Sunday)</strong> को की जा सकती है। अगली निकासी विंडो <strong>{nextSundayFormatted}</strong> को खुलेगी।
                </p>
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">आपातकालीन मोड / टेस्टिंग अनुमति:</span>
                  <button
                    type="button"
                    onClick={() => setEmergencyOverride(!emergencyOverride)}
                    className="text-[10px] text-amber-400 hover:text-amber-300 underline font-bold cursor-pointer"
                  >
                    {emergencyOverride ? 'आपातकालीन मोड सक्रिय ✓' : 'आपातकालीन अनुमति प्राप्त करें'}
                  </button>
                </div>
              </div>
            )}

            {/* Withdrawal Method Switcher */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-300 text-[11px]">
                निकासी का माध्यम चुनें (Payment Destination) *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPayoutMethod('upi')}
                  className={`p-3 rounded-2xl border font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                    payoutMethod === 'upi'
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-black'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>UPI ट्रांसफर (GPay/PhonePe)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPayoutMethod('bank')}
                  className={`p-3 rounded-2xl border font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                    payoutMethod === 'bank'
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-black'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span>बैंक खाता (IMPS Transfer)</span>
                </button>
              </div>
            </div>

            {/* Payout Destination Inputs */}
            {payoutMethod === 'upi' ? (
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="block font-bold text-slate-300 text-[11px]">
                  आपकी सक्रिय UPI ID दर्ज करें *
                </label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value.toLowerCase().trim())}
                  placeholder="उदा. 9826011223@paytm / name@okhdfcbank"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs outline-none focus:border-amber-400"
                />
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 text-[10px] mb-1">
                      खाताधारक का नाम *
                    </label>
                    <input
                      type="text"
                      required
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      placeholder="नाम (पासबुक अनुसार)"
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xs outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 text-[10px] mb-1">
                      बैंक का नाम *
                    </label>
                    <input
                      type="text"
                      required
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="SBI / HDFC / PNB"
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xs outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 text-[10px] mb-1">
                      खाता संख्या (A/c Number) *
                    </label>
                    <input
                      type="password"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="खाता संख्या"
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 text-[10px] mb-1">
                      खाता संख्या दोबारा दर्ज करें *
                    </label>
                    <input
                      type="text"
                      required
                      value={confirmAccountNumber}
                      onChange={(e) => setConfirmAccountNumber(e.target.value)}
                      placeholder="खाता संख्या पुष्टि"
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 text-[10px] mb-1">
                    IFSC कोड (11 अक्षर) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    placeholder="उदा. SBIN0001234"
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs uppercase outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}

            {/* Deduction Notice */}
            {withdrawalType === 'salary' && isSalaryTargetMet && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 text-[10px] text-amber-200">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>280 टिकट लक्ष्य कटौती सूचना:</strong> यह ₹10,000 वेतन निकालने पर आपके सक्रिय लक्ष्य में से ठीक 280 टिकट माइनस हो जाएंगे और नया वेतन चक्र शुरू होगा।
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl"
              >
                रद्द करें
              </button>
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !isWithdrawalAllowed ||
                  (withdrawalType === 'salary' && !isSalaryTargetMet) ||
                  (withdrawalType === 'wallet' &&
                    (parsedWalletAmount < 100 || parsedWalletAmount > safeBalance))
                }
                className={`flex-2 py-3 font-black rounded-xl shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer ${
                  withdrawalType === 'salary'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950'
                }`}
              >
                {isSubmitting
                  ? 'प्रोसेसिंग...'
                  : withdrawalType === 'salary' && !isSalaryTargetMet
                  ? `🔒 280 टिकट पूरे करें (${currentCycleTickets}/280)`
                  : !isWithdrawalAllowed
                  ? '🔒 केवल रविवार को निकासी संभव (Sunday Only)'
                  : withdrawalType === 'salary'
                  ? '🎉 ₹10,000 वेतन निकालें ➔'
                  : `₹${parsedWalletAmount || 0} निकालें ➔`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
