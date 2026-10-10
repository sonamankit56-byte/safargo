import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import {
  X,
  Wallet,
  Smartphone,
  Building2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Lock,
  CreditCard
} from 'lucide-react';

interface PayoutRequestModalProps {
  availableBalance: number;
  onClose: () => void;
  onOpenKyc?: () => void;
}

export const PayoutRequestModal: React.FC<PayoutRequestModalProps> = ({
  availableBalance,
  onClose,
  onOpenKyc
}) => {
  const { currentUser } = useAuth();
  const { requestPayout } = useData();
  const { error } = useToast();

  const [payoutMethod, setPayoutMethod] = useState<'upi' | 'bank_transfer'>(
    currentUser?.bank_upi_id ? 'upi' : 'bank_transfer'
  );
  const [amount, setAmount] = useState<string>(availableBalance > 0 ? availableBalance.toFixed(2) : '50');
  
  // UPI fields (prefilled from verified KYC if available)
  const [upiId, setUpiId] = useState(currentUser?.bank_upi_id || '');

  // Bank fields (prefilled from verified KYC if available)
  const [accountNumber, setAccountNumber] = useState(currentUser?.bank_account_number || '');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState(currentUser?.bank_account_number || '');
  const [ifscCode, setIfscCode] = useState(currentUser?.bank_ifsc || '');
  const [accountHolderName, setAccountHolderName] = useState(
    currentUser?.bank_account_holder || currentUser?.full_name || ''
  );
  const [bankName, setBankName] = useState(currentUser?.bank_name || '');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // KYC Guard: If agent has not been verified by admin, lock the withdrawal form
  if (currentUser?.kyc_status !== 'verified') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
          <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-base">
                  KYC सत्यापन अनिवार्य है
                </h2>
                <p className="text-xs text-slate-300">
                  Withdrawal Locked • KYC Pending
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-5 text-center">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border-2 border-amber-200">
              <CreditCard className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">
                आधार व पैन KYC के बिना निकासी संभव नहीं है
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                सफ़ारगो सुरक्षा व RBI दिशानिर्देशों के अनुसार, कमीशन निकासी और रविवार के स्वतः भुगतान हेतु <strong>आधार कार्ड (12 अंक) और पैन कार्ड का सत्यापन अनिवार्य</strong> है।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">वर्तमान KYC स्थिति:</span>
                <span
                  className={`font-black text-[11px] uppercase px-2.5 py-0.5 rounded-full ${
                    currentUser?.kyc_status === 'pending'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : currentUser?.kyc_status === 'rejected'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {currentUser?.kyc_status === 'pending'
                    ? 'जांच प्रगति पर (Under Review)'
                    : currentUser?.kyc_status === 'rejected'
                    ? 'अस्वीकृत (Rejected)'
                    : 'अधूरा (Not Submitted)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {currentUser?.kyc_status === 'pending'
                  ? 'आपके दस्तावेज एडमिन के पास समीक्षाधीन हैं। सत्यापन होते ही तत्काल विथड्रॉल सक्रिय हो जाएगा।'
                  : 'कृपया 2 मिनट में अपने आधार व पैन कार्ड का विवरण अपलोड करें व WhatsApp पर एडमिन को भेजें।'}
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenKyc?.();
                }}
                className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs shadow-lg shadow-orange-500/30 transition flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>अभी आधार व पैन KYC पूरा करें (Complete KYC Now)</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                बाद में करेंगे (Close)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      error('Invalid Amount', 'कृपया मान्य निकासी राशि दर्ज करें।');
      return;
    }

    if (parsedAmount > availableBalance) {
      error('Insufficient Balance', `निकासी राशि उपलब्ध शेष (₹${availableBalance.toFixed(2)}) से अधिक नहीं हो सकती।`);
      return;
    }

    if (payoutMethod === 'upi') {
      if (!upiId.trim() || !upiId.includes('@')) {
        error('Invalid UPI ID', 'कृपया सही UPI ID दर्ज करें (उदा. 9876543210@paytm या user@oksbi)');
        return;
      }
    } else {
      if (!accountNumber.trim() || accountNumber !== confirmAccountNumber) {
        error('Account Mismatch', 'बैंक खाता संख्या और पुनः दर्ज संख्या मेल नहीं खाती!');
        return;
      }
      if (!ifscCode.trim() || ifscCode.trim().length < 8) {
        error('Invalid IFSC', 'कृपया मान्य बैंक IFSC कोड दर्ज करें (उदा. SBIN0001234)');
        return;
      }
      if (!accountHolderName.trim()) {
        error('Name Required', 'कृपया खाताधारक का नाम दर्ज करें।');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const ok = await requestPayout({
        amount: parsedAmount,
        payout_method: payoutMethod,
        upi_id: payoutMethod === 'upi' ? upiId.trim() : undefined,
        account_number: payoutMethod === 'bank_transfer' ? accountNumber.trim() : undefined,
        ifsc_code: payoutMethod === 'bank_transfer' ? ifscCode.trim().toUpperCase() : undefined,
        account_holder_name: payoutMethod === 'bank_transfer' ? accountHolderName.trim() : undefined,
        bank_name: payoutMethod === 'bank_transfer' ? bankName.trim() : undefined,
      });

      if (ok) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg">
                कमीशन निकासी अनुरोध (Payout Request)
              </h2>
              <p className="text-xs text-slate-300">
                उपलब्ध शेष राशि अपने खाते या UPI में सीधे प्राप्त करें
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* KYC Verified Confirmation Badge */}
        <div className="px-5 py-2.5 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-800 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>सत्यापित KYC पार्टनर (Aadhaar & PAN Verified ✓)</span>
          </div>
          <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-black uppercase">
            Instant Unlocked
          </span>
        </div>

        {/* Balance Highlight Banner */}
        <div className="p-4 bg-orange-50 border-b border-orange-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-orange-900 block">
              वर्तमान निकासी योग्य शेष:
            </span>
            <span className="text-[11px] text-orange-700 font-semibold">
              साप्ताहिक पेआउट चक्र: हर रविवार (Every Sunday)
            </span>
          </div>
          <span className="text-xl font-black text-orange-600">
            ₹{availableBalance.toFixed(2)}
          </span>
        </div>

        {/* Salary Base Model Advisory */}
        <div className="mx-5 sm:mx-6 mt-4 p-3 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-[11px] leading-relaxed">
            <span className="font-bold text-amber-900 block">सैलरी बेस टिप (Salary Base Incentive):</span>
            <span className="text-amber-800">
              150 बुकिंग का लक्ष्य पूरा करने पर आपको <strong>पूरा ₹5,000 फिक्स्ड वेतन</strong> मिलता है यदि आप बीच में कमीशन विथड्रॉ नहीं करते हैं। यदि आप अभी राशि निकालते हैं, तो 150 पूरा होने पर शेष बची राशि रविवार को स्वतः प्राप्त होगी।
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          
          {/* Amount input & quick pills */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              निकासी राशि (Amount in ₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-sm">₹</span>
              <input
                type="number"
                step="0.01"
                min="1"
                max={availableBalance}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="उदा. 100"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 font-black text-base outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Quick Pills */}
            <div className="flex items-center gap-2 pt-1 text-xs font-bold">
              <span className="text-slate-400 text-[11px]">त्वरित विकल्प:</span>
              <button
                type="button"
                onClick={() => setAmount('50')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                ₹50
              </button>
              <button
                type="button"
                onClick={() => setAmount('100')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                ₹100
              </button>
              <button
                type="button"
                onClick={() => setAmount(availableBalance.toFixed(2))}
                className="px-2.5 py-1 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-800 transition"
              >
                पूरा बैलेंस (₹{availableBalance.toFixed(2)})
              </button>
            </div>
          </div>

          {/* Method Selection Tabs */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              भुगतान माध्यम चुनें (Payout Method) *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPayoutMethod('upi')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition ${
                  payoutMethod === 'upi'
                    ? 'border-orange-500 bg-orange-50/50 text-slate-900 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Smartphone className={`w-5 h-5 ${payoutMethod === 'upi' ? 'text-orange-600' : 'text-slate-400'}`} />
                <div>
                  <span className="text-xs font-extrabold block">UPI (PhonePe / GPay)</span>
                  <span className="text-[10px] text-slate-500">तत्काल ट्रांसफर</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPayoutMethod('bank_transfer')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition ${
                  payoutMethod === 'bank_transfer'
                    ? 'border-orange-500 bg-orange-50/50 text-slate-900 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Building2 className={`w-5 h-5 ${payoutMethod === 'bank_transfer' ? 'text-orange-600' : 'text-slate-400'}`} />
                <div>
                  <span className="text-xs font-extrabold block">बैंक खाता (IMPS/NEFT)</span>
                  <span className="text-[10px] text-slate-500">खाता संख्या व IFSC</span>
                </div>
              </button>
            </div>
          </div>

          {/* Method-Specific Inputs */}
          {payoutMethod === 'upi' ? (
            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="text-xs font-bold text-slate-700 block">
                अपनी UPI ID दर्ज करें (UPI VPA) *
              </label>
              <input
                type="text"
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="उदा. 9876543210@paytm या user@oksbi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              />
              <p className="text-[11px] text-slate-500">
                Google Pay, PhonePe, Paytm या BHIM में आपकी प्रोफाइल पर दिखने वाली UPI ID।
              </p>
            </div>
          ) : (
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  खाताधारक का पूरा नाम *
                </label>
                <input
                  type="text"
                  required
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="बैंक पासबुक अनुसार नाम"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    बैंक खाता संख्या *
                  </label>
                  <input
                    type="password"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="खाता संख्या"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    पुनः खाता संख्या दर्ज करें *
                  </label>
                  <input
                    type="text"
                    required
                    value={confirmAccountNumber}
                    onChange={(e) => setConfirmAccountNumber(e.target.value)}
                    placeholder="खाता संख्या दोबारा दर्ज करें"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    IFSC कोड *
                  </label>
                  <input
                    type="text"
                    required
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    placeholder="उदा. SBIN0001234"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold uppercase outline-none focus:ring-2 focus:ring-orange-500 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    बैंक का नाम (वैकल्पिक)
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="उदा. State Bank of India"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Security note */}
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2.5 text-[11px] text-blue-900">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>सुरक्षित ट्रांसफर:</strong> SafarGo एडमिन टीम द्वारा सत्यापन के बाद UTR संदर्भ के साथ सीधे आपके खाते में राशि भेजी जाती है।
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              disabled={isSubmitting || availableBalance <= 0}
              className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <span>{isSubmitting ? 'भेजा जा रहा है...' : 'निकासी अनुरोध भेजें'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
