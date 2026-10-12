import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Profile } from '../../types';
import {
  X,
  Wallet,
  PlusCircle,
  MinusCircle,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Building2,
  Phone,
  DollarSign
} from 'lucide-react';

interface AdminWalletAdjustmentModalProps {
  agent: Profile;
  onClose: () => void;
}

export const AdminWalletAdjustmentModal: React.FC<AdminWalletAdjustmentModalProps> = ({
  agent,
  onClose,
}) => {
  const { adjustAgentWallet } = useData();
  const { error } = useToast();

  const [type, setType] = useState<'credit' | 'debit'>('credit');
  const [amountStr, setAmountStr] = useState<string>('1000');
  const [reason, setReason] = useState<string>('ऑफलाइन कैश जमा');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentBal = agent.wallet_balance || 0;
  const parsedAmount = parseFloat(amountStr) || 0;
  const newBal = type === 'credit' ? currentBal + parsedAmount : currentBal - parsedAmount;

  const quickAmounts = [500, 1000, 2000, 5000, 10000];
  const quickReasons = [
    'ऑफलाइन नकद प्राप्त (Cash Received)',
    'विशिष्ट मासिक इंसेंटिव (Incentive Bonus)',
    'टिकट कैंसलेशन पेनल्टी (Cancellation Penalty)',
    'खाता सुधार / रेक्टिफिकेशन (Correction)',
    'आपातकालीन अग्रिम (Emergency Advance)',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (parsedAmount <= 0) {
      error('Invalid Amount', 'कृपया ₹0 से अधिक की वैध राशि दर्ज करें।');
      return;
    }

    if (type === 'debit' && parsedAmount > currentBal) {
      error(
        'Insufficient Balance',
        `एजेंट का वर्तमान बैलेंस केवल ₹${currentBal.toLocaleString('en-IN')} है, इससे अधिक राशि नहीं काटी जा सकती।`
      );
      return;
    }

    if (!reason.trim()) {
      error('Reason Required', 'वॉलेट में बदलाव करने का कारण / विवरण दर्ज करना अनिवार्य है।');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await adjustAgentWallet(agent.id, parsedAmount, type, reason.trim());
      if (ok) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 my-8">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md ${
              type === 'credit' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}>
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg">
                एजेंट वॉलेट बैलेंस एडजस्ट करें
              </h2>
              <p className="text-xs text-slate-300">
                एडमिन अधिकार: पैसे जोड़ें अथवा कम करें
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Agent Info Card */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-black text-slate-900 text-sm block">{agent.full_name}</span>
            <div className="flex items-center gap-2 text-slate-500 text-[11px] mt-0.5">
              <span>+91 {agent.mobile}</span>
              <span>•</span>
              <span>{agent.shop_name || 'Partner Point'}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">वर्तमान बैलेंस</span>
            <span className="text-base font-black text-slate-900">₹{currentBal.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          
          {/* Action Type Toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              कार्रवाई प्रकार चुनें (Select Adjustment Action) *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('credit')}
                className={`py-3 px-4 rounded-2xl border text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer ${
                  type === 'credit'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>➕ पैसे जोड़ें (Credit)</span>
              </button>

              <button
                type="button"
                onClick={() => setType('debit')}
                className={`py-3 px-4 rounded-2xl border text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer ${
                  type === 'debit'
                    ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-xs ring-2 ring-rose-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <MinusCircle className="w-4 h-4 text-rose-600" />
                <span>➖ पैसे काटें / कम करें (Deduct)</span>
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              राशि दर्ज करें (Amount in ₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-base">₹</span>
              <input
                type="number"
                min="1"
                step="any"
                required
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none text-base font-mono font-bold text-slate-900"
                placeholder="1000"
              />
            </div>

            {/* Quick Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmountStr(q.toString())}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    amountStr === q.toString()
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  ₹{q.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          {/* Reason / Remarks */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              एडजस्टमेंट का कारण / टिप्पणी (Reason / Audit Note) *
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="उदा. ऑफलाइन नकद प्राप्त हुआ, सुधार, इंसेंटिव"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none text-xs font-medium bg-white"
            />
            {/* Quick Reasons Chips */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {quickReasons.map((qr) => (
                <button
                  key={qr}
                  type="button"
                  onClick={() => setReason(qr)}
                  className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                >
                  {qr}
                </button>
              ))}
            </div>
          </div>

          {/* Balance Preview Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>वर्तमान बैलेंस:</span>
              <span className="font-mono font-bold text-slate-800">₹{currentBal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>{type === 'credit' ? 'जोड़ी जाने वाली राशि (+):' : 'काटी जाने वाली राशि (-):'}</span>
              <span className={`font-mono ${type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {type === 'credit' ? '+' : '-'}₹{parsedAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>अपडेट के बाद नया बैलेंस:</span>
              <span className={`font-mono text-base ${newBal < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                ₹{newBal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              disabled={isSubmitting || parsedAmount <= 0 || (type === 'debit' && parsedAmount > currentBal)}
              className={`px-6 py-2.5 rounded-xl text-white font-black text-xs shadow-md transition flex items-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50 ${
                type === 'credit'
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-rose-600 hover:bg-rose-500'
              }`}
            >
              <span>
                {isSubmitting
                  ? 'प्रोसेस हो रहा है...'
                  : type === 'credit'
                  ? `₹${parsedAmount.toLocaleString('en-IN')} जोड़ें`
                  : `₹${parsedAmount.toLocaleString('en-IN')} काटें`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
