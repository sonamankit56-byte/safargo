import React, { useState } from 'react';
import { X, Wallet, Copy, Check, QrCode, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';

interface WalletRechargeModalProps {
  onClose: () => void;
  onSuccess?: (amount: number) => void;
}

export const WalletRechargeModal: React.FC<WalletRechargeModalProps> = ({ onClose, onSuccess }) => {
  const { store } = useStore();
  const { currentUser } = useAuth();

  const [amount, setAmount] = useState<number>(2000);
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const upiId = 'safargo@upi';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    `upi://pay?pa=${upiId}&pn=SafarGo%20Mobility&am=${amount}&cu=INR`
  )}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber || utrNumber.length < 6) {
      alert('Please enter a valid 12-digit UTR or transaction ID.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      store.logAudit(
        currentUser.id,
        currentUser.fullName,
        currentUser.role,
        'WALLET_RECHARGE_REQUEST',
        'wallet',
        `wal-${Date.now()}`,
        `Recharge request of ₹${amount} submitted with UTR ${utrNumber}`
      );
      store.save();
      onSuccess?.(amount);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden text-xs">
        
        {/* Header */}
        <div className="bg-safargo-navy text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-safargo-orange" />
            <span className="font-bold text-sm">Agent Wallet Instant Recharge</span>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white font-bold text-lg">
            ✕
          </button>
        </div>

        {isSuccess ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Recharge Request Submitted!</h3>
              <p className="text-slate-500 mt-1">
                Your payment of <strong>₹{amount}</strong> (UTR: {utrNumber}) has been submitted for automated desk verification. Balance will reflect in your account within 5-10 minutes.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-safargo-navy hover:bg-slate-800 text-white font-bold rounded-xl shadow"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            
            {/* Amount Presets */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Select Recharge Amount</label>
              <div className="grid grid-cols-4 gap-2">
                {[1000, 2000, 5000, 10000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      amount === amt
                        ? 'bg-safargo-orange text-white border-safargo-orange shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* UPI QR Display */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-2">
              <div className="text-[11px] font-semibold text-slate-500">Scan UPI QR via Any App (GPay / PhonePe / Paytm)</div>
              <div className="w-36 h-36 bg-white p-2 rounded-xl border border-slate-200 shadow-sm mx-auto flex items-center justify-center">
                <img src={qrUrl} alt="UPI QR" className="w-full h-full object-contain" />
              </div>
              <div className="flex items-center justify-center space-x-2 pt-1">
                <span className="font-mono text-slate-600 font-semibold">{upiId}</span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="p-1 text-safargo-orange hover:text-orange-700"
                  title="Copy UPI ID"
                >
                  {copiedUpi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* UTR Input */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Enter 12-Digit UPI Ref / UTR Number
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 528910482910"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl font-mono uppercase bg-slate-50 text-xs"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-safargo-orange hover:bg-orange-600 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
            >
              <span>{isSubmitting ? 'Verifying...' : `Submit ₹${amount} Recharge`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
