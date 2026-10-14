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
  Lock
} from 'lucide-react';

interface GoAgentWithdrawalModalProps {
  onClose: () => void;
}

export const GoAgentWithdrawalModal: React.FC<GoAgentWithdrawalModalProps> = ({ onClose }) => {
  const { currentUser } = useAuth();
  const { agentWalletBalance, withdrawFromGoWallet, requestPayout } = useData();
  const { error, success } = useToast();

  const [payoutMethod, setPayoutMethod] = useState<'upi' | 'bank'>('upi');
  const [amount, setAmount] = useState<string>('500');

  // UPI Fields
  const [upiId, setUpiId] = useState('');

  // Bank Fields
  const [bankName, setBankName] = useState(currentUser?.bank_name || '');
  const [accountHolder, setAccountHolder] = useState(currentUser?.bank_account_holder || currentUser?.full_name || '');
  const [accountNumber, setAccountNumber] = useState(currentUser?.bank_account_number || '');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState(currentUser?.bank_account_number || '');
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
    month: 'long'
  });

  const parsedAmount = parseFloat(amount) || 0;
  const safeBalance = Number(agentWalletBalance) || 0;

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!isWithdrawalAllowed) {
      error(
        'रविवार निकासी नियम',
        `Go Wallet एवं कमीशन निकासी केवल प्रत्येक रविवार (Every Sunday) को ही उपलब्ध है। अगली निकासी तिथि: ${nextSundayFormatted}`
      );
      return;
    }

    if (parsedAmount < 100) {
      error('न्यूनतम निकासी', 'न्यूनतम निकासी राशि ₹100 है।');
      return;
    }

    if (parsedAmount > safeBalance) {
      error('अपर्याप्त बैलेंस', `आपके वॉलेट में केवल ₹${safeBalance.toLocaleString('en-IN')} उपलब्ध हैं।`);
      return;
    }

    let destination = '';

    if (payoutMethod === 'upi') {
      const cleanUpi = upiId.trim();
      const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
      if (!cleanUpi || !upiRegex.test(cleanUpi)) {
        error('अमान्य UPI ID', 'कृपया सही UPI ID दर्ज करें (उदा. 9826011223@paytm या name@okhdfcbank)।');
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
      // 1. Deduct from Go Wallet and record transaction
      const ok = await withdrawFromGoWallet(parsedAmount, payoutMethod, destination);

      if (ok) {
        // 2. Also register in Payout Requests for admin records
        if (requestPayout) {
          await requestPayout({
            amount: parsedAmount,
            payout_method: payoutMethod,
            upi_id: payoutMethod === 'upi' ? destination : undefined,
            bank_account_holder: payoutMethod === 'bank' ? accountHolder : undefined,
            bank_account_number: payoutMethod === 'bank' ? accountNumber : undefined,
            bank_ifsc: payoutMethod === 'bank' ? ifscCode.trim().toUpperCase() : undefined,
            bank_name: payoutMethod === 'bank' ? bankName : undefined,
            admin_notes: `⚡ GO Agent एडवांस निकासी अनुरोध: ${destination}`,
          }).catch(console.warn);
        }

        setWithdrawnAmount(parsedAmount);
        setIsSuccess(true);
      }
    } catch (err: any) {
      error('Withdrawal Error', err?.message || 'निकासी प्रक्रिया में त्रुटि हुई।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border-2 border-emerald-500 rounded-3xl max-w-lg w-full text-white shadow-2xl overflow-hidden my-4">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 border-b border-emerald-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base text-white">
                  GO Agent एडवांस निकासी डेस्क
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-400 text-slate-950">
                  Instant Payout
                </span>
              </div>
              <p className="text-[11px] text-emerald-300 font-medium">
                Go Wallet से सीधे बैंक खाते या UPI में पैसे ट्रांसफर करें
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
                निकासी अनुरोध सफल!
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-mono">
                ₹{withdrawnAmount.toLocaleString('en-IN')}.00
              </h2>
              <p className="text-xs text-slate-300">
                राशि आपके Go Wallet से निकाल ली गई है और <strong>{payoutMethod === 'upi' ? 'UPI खाते' : 'बैंक खाते'}</strong> में भेजी जा रही है।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs flex justify-between items-center font-mono">
              <span className="text-slate-400">शेष उपलब्ध बैलेंस:</span>
              <strong className="text-emerald-400 text-base font-black">
                ₹{(agentWalletBalance || 0).toLocaleString('en-IN')}.00
              </strong>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-sm transition shadow-lg cursor-pointer"
            >
              पूर्ण (Done)
            </button>
          </div>
        ) : (
          <form onSubmit={handleWithdrawalSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
            
            {/* Live Balance Banner */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  वर्तमान उपलब्ध बैलेंस
                </span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                  ₹{safeBalance.toLocaleString('en-IN')}.00
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAmount(safeBalance.toString())}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs transition border border-amber-400/30 cursor-pointer"
              >
                पूरा निकालें (Max)
              </button>
            </div>

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
                  GO Agent एवं Go Wallet से राशि की निकासी केवल <strong>प्रत्येक रविवार (Sunday)</strong> को की जा सकती है। अगली निकासी विंडो <strong>{nextSundayFormatted}</strong> को खुलेगी।
                </p>
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">आपातकालीन टेस्टिंग / एडमिन अनुमति:</span>
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
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md font-black'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>UPI ट्रांसफर (GPay / PhonePe)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPayoutMethod('bank')}
                  className={`p-3 rounded-2xl border font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                    payoutMethod === 'bank'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md font-black'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span>बैंक खाता (IMPS Transfer)</span>
                </button>
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-300 text-[11px]">
                निकासी राशि दर्ज करें (₹100 से ₹{safeBalance.toLocaleString('en-IN')}) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-base font-black text-emerald-400">₹</span>
                <input
                  type="number"
                  min={100}
                  max={safeBalance}
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="राशि दर्ज करें"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-950 border-2 border-slate-700 text-white font-mono font-black text-sm outline-none focus:border-emerald-400"
                />
              </div>

              {/* Quick Pills */}
              <div className="flex gap-2 pt-1">
                {['200', '500', '1000', '2000'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setAmount(p)}
                    className="flex-1 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-300 hover:text-white"
                  >
                    ₹{p}
                  </button>
                ))}
              </div>
            </div>

            {/* UPI Details */}
            {payoutMethod === 'upi' ? (
              <div className="space-y-1">
                <label className="block font-bold text-slate-300 text-[11px]">
                  आपकी UPI ID दर्ज करें *
                </label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="उदा. 9826011223@paytm या user@okhdfcbank"
                  className="w-full p-3 rounded-xl bg-slate-950 border-2 border-slate-700 text-white font-mono font-bold text-xs outline-none focus:border-emerald-400"
                />
                <p className="text-[10px] text-slate-400">
                  सत्यापित करें कि UPI ID आपके उसी बैंक खाते से जुड़ी है जिस पर आप पैसा चाहते हैं।
                </p>
              </div>
            ) : (
              <div className="space-y-3 p-3 bg-slate-950 rounded-2xl border border-slate-800">
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
                      placeholder="नाम"
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xs outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 text-[10px] mb-1">
                      बैंक का नाम
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="SBI / HDFC / PNB"
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xs outline-none focus:border-emerald-400"
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
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs outline-none focus:border-emerald-400"
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
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs outline-none focus:border-emerald-400"
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
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs uppercase outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
            )}

            {/* Security Guarantee Note */}
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2 text-[10px] text-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>सुरक्षित IMPS / UPI निकासी:</strong> निकासी अनुरोध सबमिट होते ही राशि Go Wallet से डेबिट होकर आपके गंतव्य खाते में भेज दी जाती है।
              </span>
            </div>

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
                disabled={isSubmitting || !isWithdrawalAllowed || parsedAmount < 100 || parsedAmount > safeBalance}
                className="flex-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting
                  ? 'प्रोसेसिंग...'
                  : !isWithdrawalAllowed
                  ? '🔒 केवल रविवार को निकासी संभव (Sunday Only)'
                  : `₹${parsedAmount || 0} निकालें ➔`}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
