import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import {
  X,
  Wallet,
  Copy,
  Check,
  Upload,
  ShieldCheck,
  AlertCircle,
  QrCode,
  CheckCircle2,
  Lock,
  Sparkles,
  Zap,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { compressImage } from '../../lib/storageUtils';

interface GoInstantAddMoneyModalProps {
  onClose: () => void;
}

export const GoInstantAddMoneyModal: React.FC<GoInstantAddMoneyModalProps> = ({ onClose }) => {
  const { settings, goInstantAddMoney, agentWalletBalance } = useData();
  const { error, success } = useToast();

  const [amount, setAmount] = useState<string>('500');
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [creditedAmount, setCreditedAmount] = useState(0);

  const upiId = settings?.safargo_upi_id || 'safargo.booking@icici';
  const parsedAmount = parseFloat(amount) || 0;

  // Real UPI deep link for QR code
  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=SafarGo%20Admin&am=${parsedAmount > 0 ? parsedAmount : 500}&cu=INR&tn=GO%20Instant%20Add%20Money`;
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    success('UPI ID कॉपी हुआ!', 'अपने UPI ऐप (PhonePe / GPay / Paytm) में पेस्ट करके भुगतान करें।');
    setTimeout(() => setCopiedUpi(false), 3000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        error('फाइल बहुत बड़ी है', 'कृपया 15MB से छोटी फाइल चुनें।');
        return;
      }
      try {
        const compressed = await compressImage(file, 800, 800, 0.6);
        setScreenshotPreview(compressed);
      } catch {
        const reader = new FileReader();
        reader.onload = () => {
          setScreenshotPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleInstantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const cleanAmount = parseFloat(amount);
    if (!cleanAmount || cleanAmount < 100) {
      error('अमान्य राशि', 'कृपया कम से कम ₹100 की राशि दर्ज करें।');
      return;
    }

    const cleanUtr = utrNumber.trim();
    if (!cleanUtr || cleanUtr.length < 8) {
      error('अमान्य UTR', 'कृपया बैंक/UPI ऐप का सही 8-12 अंकों का UTR / UPI Ref No दर्ज करें।');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await goInstantAddMoney({
        amount: cleanAmount,
        utr: cleanUtr,
        screenshotUrl: screenshotPreview || undefined,
        paymentMethod: 'upi_qr',
      });

      if (res.success) {
        setCreditedAmount(cleanAmount);
        setIsSuccess(true);
      }
    } catch (err: any) {
      error('रीचार्ज त्रुटि', err?.message || 'सिस्टम में त्रुटि हुई। पुनः प्रयास करें।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl max-w-lg w-full text-white shadow-2xl overflow-hidden my-4">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border-b border-amber-400/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <Zap className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base text-white">
                  GO Instant Add Money
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 animate-pulse">
                  ⚡ 0-Second Instant
                </span>
              </div>
              <p className="text-[11px] text-amber-300 font-medium">
                स्वचालित AI वेरिफिकेशन — तुरंत वॉलेट में पैसे जोड़ें!
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

        {/* Content */}
        {isSuccess ? (
          <div className="p-6 sm:p-8 text-center space-y-5 animate-in zoom-in-95">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase font-black tracking-widest text-emerald-400">
                पेमेंट स्वीकृत व क्रेडिट!
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-mono">
                +₹{creditedAmount.toLocaleString('en-IN')}
              </h2>
              <p className="text-xs text-slate-300">
                राशि तुरंत आपके Go Wallet बैलेंस में जोड़ दी गई है। अब आप बिना रुके बस टिकट बुक कर सकते हैं!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs flex justify-between items-center font-mono">
              <span className="text-slate-400">नया उपलब्ध बैलेंस:</span>
              <strong className="text-emerald-400 text-base font-black">
                ₹{(agentWalletBalance || 0).toLocaleString('en-IN')}.00
              </strong>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-sm transition shadow-lg cursor-pointer"
            >
              टिकट बुकिंग जारी रखें ➔
            </button>
          </div>
        ) : (
          <form onSubmit={handleInstantSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
            
            {/* Quick Amount Pills */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-300 text-[11px]">
                रिचार्ज राशि चुनें (Select Amount) *
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['200', '500', '1000', '2000'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`py-2 rounded-xl font-black text-xs transition border cursor-pointer ${
                      amount === val
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md scale-102'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    ₹{val}
                  </button>
                ))}
              </div>

              <div className="relative mt-2">
                <span className="absolute left-3 top-2.5 text-base font-black text-amber-400">₹</span>
                <input
                  type="number"
                  min={100}
                  step={50}
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="कस्टम राशि (उदा. 1500)"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-950 border-2 border-slate-700 text-white font-mono font-black text-sm outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* QR Code & UPI Deep Link */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-400/40 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-36 h-36 bg-white p-2 rounded-2xl shrink-0 flex items-center justify-center shadow-md">
                <img
                  src={qrCodeApiUrl}
                  alt="SafarGo QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-amber-400">
                    SafarGo अधिकृत QR कोड
                  </span>
                  <p className="text-[11px] text-slate-300">
                    PhonePe / GPay / Paytm से स्कैन करें और <strong>₹{parsedAmount || 500}</strong> का भुगतान करें।
                  </p>
                </div>

                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-slate-200 truncate">
                    {upiId}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 shrink-0"
                    title="कॉपी करें"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* UTR Input with Advance Validation */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-300 text-[11px]">
                12-अंकों का UPI Ref / UTR नंबर दर्ज करें *
              </label>
              <input
                type="text"
                required
                maxLength={24}
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value.toUpperCase())}
                placeholder="उदा. 428901234567"
                className="w-full p-3 rounded-xl bg-slate-950 border-2 border-slate-700 text-white font-mono font-bold text-xs uppercase tracking-wider outline-none focus:border-amber-400"
              />
              <p className="text-[10px] text-slate-400">
                पेमेंट ऐप की रसीद में <strong>UPI Ref No. / UTR No.</strong> लिखा होता है।
              </p>
            </div>

            {/* Screenshot Upload */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-300 text-[11px]">
                पेमेंट स्क्रीनशॉट (वैकल्पिक परंतु सुरक्षित)
              </label>
              <div className="flex items-center gap-2">
                <label className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-dashed border-slate-700 hover:border-amber-400 text-slate-300 cursor-pointer flex items-center justify-center gap-2 transition">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px]">
                    {screenshotPreview ? 'स्क्रीनशॉट बदलें' : 'स्क्रीनशॉट अपलोड करें'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {screenshotPreview && (
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-amber-400 shrink-0">
                    <img src={screenshotPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Anti-Fraud Security Shield Note */}
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 text-[10px] text-amber-200 leading-snug">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>एडवांस सुरक्षा प्रणाली:</strong> सिस्टम में डुप्लीकेट UTR व फर्जी स्क्रीनशॉट स्वतः ब्लॉक होते हैं। गलत UTR पाए जाने पर एडमिन द्वारा राशि वापस काटी जा सकती है।
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !utrNumber.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>AI सुरक्षा सत्यापन जारी...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>⚡ तुरंत वॉलेट में पैसे जोड़ें (₹{parsedAmount || 500})</span>
                </>
              )}
            </button>

          </form>
        )}

      </div>
    </div>
  );
};
